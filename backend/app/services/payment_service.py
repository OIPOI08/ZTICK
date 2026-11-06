
import os
import uuid
import hashlib
import hmac
import traceback

from decimal import Decimal, InvalidOperation
from datetime import datetime, timezone

import midtransclient

from app.database.supabase import db


# ==========================================
# MIDTRANS CONFIGURATION
# ==========================================

def get_snap_client():
    server_key = os.getenv("MIDTRANS_SERVER_KEY", "").strip()

    if not server_key:
        raise ValueError("MIDTRANS_SERVER_KEY belum dikonfigurasi.")

    is_production = (
        os.getenv("MIDTRANS_IS_PRODUCTION", "false").strip().lower()
        == "true"
    )

    if not is_production and not server_key.startswith("SB-Mid-server-"):
        raise ValueError(
            "Gunakan Sandbox Server Key Midtrans dengan prefix SB-Mid-server-."
        )

    if is_production and not server_key.startswith("Mid-server-"):
        raise ValueError(
            "Gunakan Production Server Key Midtrans."
        )

    print("MIDTRANS KEY LOADED:", bool(server_key))
    print("MIDTRANS KEY PREFIX:", server_key[:15])
    print("MIDTRANS MODE:", "PRODUCTION" if is_production else "SANDBOX")

    return midtransclient.Snap(
        is_production=is_production,
        server_key=server_key
    )


# ==========================================
# CREATE PAYMENT
# ==========================================

def create_payment(order_id: str, customer_id: str):
    order_response = (
        db.table("orders")
        .select(
            "id, order_code, customer_id, total_amount, status, expires_at"
        )
        .eq("id", order_id)
        .eq("customer_id", customer_id)
        .limit(1)
        .execute()
    )

    if not order_response.data:
        raise ValueError("Pesanan tidak ditemukan.")

    order = order_response.data[0]

    if order["status"] != "pending":
        raise ValueError("Pesanan tidak dalam status pending.")

    # Validasi masa berlaku order
    if order.get("expires_at"):
        expires_at = datetime.fromisoformat(
            order["expires_at"].replace("Z", "+00:00")
        )

        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at <= datetime.now(timezone.utc):
            raise ValueError("Pesanan sudah kedaluwarsa.")

    # Validasi nominal
    try:
        amount_decimal = Decimal(str(order["total_amount"]))
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError("Nominal pembayaran tidak valid.")

    if not amount_decimal.is_finite() or amount_decimal <= 0:
        raise ValueError("Nominal pembayaran tidak valid.")

    if amount_decimal != amount_decimal.to_integral_value():
        raise ValueError(
            "Nominal pembayaran harus berupa bilangan bulat."
        )

    amount = int(amount_decimal)

    # Reference unik untuk setiap percobaan pembayaran
    midtrans_order_id = (
        f"{order['order_code']}-PAY-{uuid.uuid4().hex[:8]}"
    )

    # Simpan pembayaran ke database
    payment_response = (
        db.table("payments")
        .insert({
            "order_id": order["id"],
            "provider": "midtrans",
            "provider_reference": midtrans_order_id,
            "payment_method": "snap",
            "amount": amount,
            "status": "pending"
        })
        .execute()
    )

    if not payment_response.data:
        raise ValueError("Data pembayaran gagal disimpan.")

    payment_id = payment_response.data[0]["id"]

    try:
        snap = get_snap_client()

        transaction = snap.create_transaction({
            "transaction_details": {
                "order_id": midtrans_order_id,
                "gross_amount": amount
            },
            "expiry": {
                "unit": "minutes",
                "duration": 15
            }
        })

        snap_token = transaction.get("token")
        redirect_url = transaction.get("redirect_url")

        if not snap_token or not redirect_url:
            raise ValueError(
                "Respons Midtrans tidak memiliki token atau redirect URL."
            )

        return {
            "payment_id": payment_id,
            "order_id": order["id"],
            "snap_token": snap_token,
            "redirect_url": redirect_url
        }

    except Exception as error:
        print("\n========== MIDTRANS CREATE PAYMENT ERROR ==========")
        print(repr(error))
        traceback.print_exc()
        print("===================================================\n")

        try:
            db.table("payments").update({
                "status": "failed"
            }).eq("id", payment_id).execute()
        except Exception as db_error:
            print("PAYMENT UPDATE ERROR:", repr(db_error))

        raise ValueError(
            "Gagal membuat transaksi pembayaran."
        )


# ==========================================
# VERIFY MIDTRANS SIGNATURE
# ==========================================

def verify_notification(notification: dict):
    server_key = os.getenv("MIDTRANS_SERVER_KEY")

    if not server_key:
        raise ValueError("Server Key belum dikonfigurasi.")

    order_reference = notification.get("order_id")
    status_code = notification.get("status_code")
    gross_amount = notification.get("gross_amount")
    signature_key = notification.get("signature_key")

    if not all([
        order_reference,
        status_code,
        gross_amount,
        signature_key
    ]):
        raise ValueError("Data notifikasi tidak lengkap.")

    raw_signature = (
        f"{order_reference}"
        f"{status_code}"
        f"{gross_amount}"
        f"{server_key}"
    )

    expected_signature = hashlib.sha512(
        raw_signature.encode("utf-8")
    ).hexdigest()

    if not hmac.compare_digest(
        expected_signature,
        signature_key
    ):
        raise ValueError("Signature notifikasi tidak valid.")

    return order_reference, gross_amount


# ==========================================
# GENERATE TICKETS
# ==========================================

def generate_tickets(order_id: str):
    response = db.rpc(
        "generate_order_tickets",
        {
            "p_order_id": order_id
        }
    ).execute()

    return response.data


# ==========================================
# HANDLE MIDTRANS NOTIFICATION
# ==========================================

def handle_midtrans_notification(notification: dict):
    order_reference, gross_amount = verify_notification(
        notification
    )

    # Cari payment berdasarkan reference Midtrans
    payment_response = (
        db.table("payments")
        .select("id, order_id, amount, status")
        .eq("provider_reference", order_reference)
        .eq("provider", "midtrans")
        .limit(1)
        .execute()
    )

    if not payment_response.data:
        raise ValueError("Data pembayaran tidak ditemukan.")

    payment = payment_response.data[0]

    # Validasi nominal
    try:
        expected_amount = Decimal(str(payment["amount"]))
        received_amount = Decimal(str(gross_amount))
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError("Nominal pembayaran tidak valid.")

    if expected_amount != received_amount:
        raise ValueError("Nominal pembayaran tidak sesuai.")

    transaction_status = notification.get("transaction_status")
    fraud_status = notification.get("fraud_status")
    status_code = str(notification.get("status_code"))

    # Tentukan status transaksi
    if (
        transaction_status == "settlement"
        and status_code == "200"
    ):
        new_status = "success"

    elif (
        transaction_status == "capture"
        and status_code == "200"
        and fraud_status in (None, "accept")
    ):
        new_status = "success"

    elif transaction_status == "pending":
        new_status = "pending"

    elif transaction_status == "expire":
        new_status = "expired"

    elif transaction_status in ("cancel", "deny", "failure"):
        new_status = "failed"

    else:
        return {
            "message": "Status transaksi belum diproses.",
            "payment_status": payment["status"]
        }

    # Jangan menurunkan status pembayaran yang sudah sukses
    if payment["status"] == "success" and new_status != "success":
        return {
            "message": "Pembayaran sudah berhasil sebelumnya.",
            "payment_status": "success"
        }

    # Update payment
    if payment["status"] != "success":
        payment_update = {
            "status": new_status,
            "payment_method": (
                notification.get("payment_type") or "snap"
            )
        }

        if new_status == "success":
            payment_update["paid_at"] = (
                notification.get("settlement_time")
                or notification.get("transaction_time")
                or datetime.now(timezone.utc).isoformat()
            )

        db.table("payments").update(
            payment_update
        ).eq("id", payment["id"]).execute()

    # Status selain sukses tidak menerbitkan tiket
    if new_status != "success":
        return {
            "message": "Status pembayaran berhasil diperbarui.",
            "payment_status": new_status
        }

    # Ambil status order
    order_response = (
        db.table("orders")
        .select("id, status")
        .eq("id", payment["order_id"])
        .limit(1)
        .execute()
    )

    if not order_response.data:
        raise ValueError("Order pembayaran tidak ditemukan.")

    order = order_response.data[0]

    # Jangan terbitkan tiket untuk order tidak aktif
    if order["status"] in (
        "cancelled",
        "expired",
        "refunded"
    ):
        return {
            "message": (
                "Pembayaran berhasil, tetapi order sudah tidak aktif. "
                "Perlu pemeriksaan dan penanganan refund."
            ),
            "payment_status": "success",
            "order_status": order["status"],
            "requires_review": True
        }

    # Ubah order pending menjadi paid
    if order["status"] == "pending":
        paid_at = (
            notification.get("settlement_time")
            or notification.get("transaction_time")
            or datetime.now(timezone.utc).isoformat()
        )

        db.table("orders").update({
            "status": "paid",
            "paid_at": paid_at
        }).eq(
            "id", payment["order_id"]
        ).eq(
            "status", "pending"
        ).execute()

    # Verifikasi status order
    confirmed_order = (
        db.table("orders")
        .select("id, status")
        .eq("id", payment["order_id"])
        .limit(1)
        .execute()
    )

    if (
        not confirmed_order.data
        or confirmed_order.data[0]["status"] != "paid"
    ):
        raise ValueError(
            "Status order belum berhasil diperbarui."
        )

    # Terbitkan tiket melalui RPC
    created_tickets = generate_tickets(
        payment["order_id"]
    )

    return {
        "message": "Pembayaran berhasil dan tiket sudah diproses.",
        "payment_status": "success",
        "order_status": "paid",
        "tickets_created": created_tickets
    }
