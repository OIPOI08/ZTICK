
from app.database.supabase import db


def create_order(
    customer_id: str,
    ticket_category_id: str,
    quantity: int,
):
    if quantity < 1:
        raise ValueError("Jumlah tiket minimal 1.")

    try:
        response = db.rpc(
            "create_ticket_order",
            {
                "p_customer_id": customer_id,
                "p_ticket_category_id": ticket_category_id,
                "p_quantity": quantity,
            },
        ).execute()

        if not response.data:
            raise ValueError("Pesanan gagal dibuat.")

        order_id = response.data

        if isinstance(order_id, dict):
            order_id = (
                order_id.get("order_id")
                or order_id.get("create_ticket_order")
            )

        elif isinstance(order_id, list):
            order_id = order_id[0] if order_id else None

            if isinstance(order_id, dict):
                order_id = (
                    order_id.get("order_id")
                    or order_id.get("create_ticket_order")
                )

        if not order_id:
            raise ValueError("ID pesanan tidak ditemukan.")

        return {"order_id": str(order_id)}

    except ValueError:
        raise

    except Exception as error:
        print("CREATE ORDER ERROR:", repr(error))
        raise ValueError(
            "Gagal membuat pesanan. Periksa ketersediaan tiket."
        )


def get_customer_orders(customer_id: str):
    try:
        response = (
            db.table("orders")
            .select(
                "id, order_code, total_amount, status, "
                "expires_at, paid_at, created_at, "
                "order_items("
                    "id, quantity, unit_price, subtotal, "
                    "ticket_category_id, "
                    "ticket_categories("
                        "id, name, event_id, "
                        "events("
                            "id, title, poster_url, "
                            "start_date, venue_name, city"
                        ")"
                    ")"
                ")"
            )
            .eq("customer_id", customer_id)
            .order("created_at", desc=True)
            .execute()
        )

        return response.data or []

    except Exception as error:
        print("GET CUSTOMER ORDERS ERROR:", repr(error))
        raise


def get_customer_order_detail(
    order_id: str,
    customer_id: str,
):
    try:
        response = (
            db.table("orders")
            .select(
                "id, order_code, customer_id, total_amount, "
                "status, expires_at, paid_at, created_at, "
                "order_items("
                    "id, quantity, unit_price, subtotal, "
                    "ticket_category_id, "
                    "ticket_categories("
                        "id, name, event_id, "
                        "events("
                            "id, title, poster_url, "
                            "start_date, venue_name, city"
                        ")"
                    ")"
                ")"
            )
            .eq("id", order_id)
            .eq("customer_id", customer_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]

    except Exception as error:
        print("GET ORDER DETAIL ERROR:", repr(error))
        raise


def cancel_order(
    order_id: str,
    customer_id: str,
):
    try:
        response = db.rpc(
            "cancel_ticket_order",
            {
                "p_order_id": order_id,
                "p_customer_id": customer_id,
            },
        ).execute()

        if response.data is not True:
            raise ValueError(
                "Pesanan tidak dapat dibatalkan."
            )

        return True

    except ValueError:
        raise

    except Exception as error:
        print("CANCEL ORDER ERROR:", repr(error))
        raise ValueError(
            "Gagal membatalkan pesanan."
        )
