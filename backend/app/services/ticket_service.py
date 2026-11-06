
from app.database.supabase import db


def get_customer_tickets(customer_id: str):
    try:
        response = (
            db.table("tickets")
            .select(
                "id, order_id, order_item_id, owner_id, "
                "ticket_category_id, ticket_code, qr_token, "
                "status, checked_in_at, created_at, "
                "ticket_categories("
                    "id, name, event_id, "
                    "events("
                        "id, title, poster_url, start_date, "
                        "end_date, venue_name, venue_address, city"
                    ")"
                ")"
            )
            .eq("owner_id", customer_id)
            .order("created_at", desc=True)
            .execute()
        )

        return response.data or []

    except Exception as error:
        print("GET CUSTOMER TICKETS ERROR:", repr(error))
        raise


def get_customer_ticket_detail(
    ticket_id: str,
    customer_id: str,
):
    try:
        response = (
            db.table("tickets")
            .select(
                "id, order_id, order_item_id, owner_id, "
                "ticket_category_id, ticket_code, qr_token, "
                "status, checked_in_at, created_at, "
                "ticket_categories("
                    "id, name, event_id, "
                    "events("
                        "id, title, poster_url, start_date, "
                        "end_date, venue_name, venue_address, city"
                    ")"
                ")"
            )
            .eq("id", ticket_id)
            .eq("owner_id", customer_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]

    except Exception as error:
        print("GET CUSTOMER TICKET DETAIL ERROR:", repr(error))
        raise
