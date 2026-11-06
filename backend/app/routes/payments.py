
from fastapi import APIRouter, Depends, HTTPException, Request

from app.middleware.auth_middleware import require_roles
from app.services.payment_service import (
    create_payment,
    handle_midtrans_notification
)

router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"]
)


# ==========================================
# CREATE PAYMENT
# ==========================================

@router.post("/create")
def create_new_payment(
    payload: dict,
    current_user: dict = Depends(require_roles("customer"))
):
    order_id = payload.get("order_id")

    if not order_id:
        raise HTTPException(
            status_code=400,
            detail="order_id wajib diisi."
        )

    try:
        result = create_payment(
            order_id=str(order_id),
            customer_id=current_user["id"]
        )

        return {
            "success": True,
            "message": "Transaksi pembayaran berhasil dibuat.",
            "data": result
        }

    except ValueError as error:
        message = str(error)

        if message == "Gagal membuat transaksi pembayaran.":
            raise HTTPException(
                status_code=502,
                detail=message
            )

        raise HTTPException(
            status_code=400,
            detail=message
        )

    except Exception as error:
        print("CREATE PAYMENT ROUTE ERROR:", repr(error))

        raise HTTPException(
            status_code=500,
            detail="Terjadi kesalahan saat membuat pembayaran."
        )


# ==========================================
# MIDTRANS NOTIFICATION / WEBHOOK
# ==========================================

@router.post("/notification")
async def midtrans_notification(request: Request):
    try:
        notification = await request.json()

        result = handle_midtrans_notification(notification)

        return {
            "success": True,
            **result
        }

    except ValueError as error:
        print("PAYMENT NOTIFICATION VALIDATION ERROR:", repr(error))

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        print("PAYMENT NOTIFICATION ERROR:", repr(error))

        raise HTTPException(
            status_code=500,
            detail="Gagal memproses notifikasi pembayaran."
        )
