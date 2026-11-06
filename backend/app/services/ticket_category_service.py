
from app.database.supabase import db


# =========================
# CREATE TICKET CATEGORY
# =========================
def create_ticket_category(event_id: str, payload: dict):
    event = (
        db.table("events")
        .select("id")
        .eq("id", event_id)
        .limit(1)
        .execute()
    )

    if not event.data:
        raise ValueError("Event tidak ditemukan.")

    payload["event_id"] = event_id
    payload["sold"] = 0

    response = (
        db.table("ticket_categories")
        .insert(payload)
        .execute()
    )

    return response.data[0] if response.data else None


# =========================
# GET CATEGORIES BY EVENT
# =========================
def get_categories_by_event(event_id: str):
    response = (
        db.table("ticket_categories")
        .select("*")
        .eq("event_id", event_id)
        .order("price")
        .execute()
    )

    return response.data


# =========================
# GET PUBLIC CATEGORIES
# =========================
def get_public_categories(event_id: str):
    event = (
        db.table("events")
        .select("id")
        .eq("id", event_id)
        .eq("status", "published")
        .limit(1)
        .execute()
    )

    if not event.data:
        return None

    return get_categories_by_event(event_id)


# =========================
# GET CATEGORY BY ID
# =========================
def get_category_by_id(category_id: str):
    response = (
        db.table("ticket_categories")
        .select("*")
        .eq("id", category_id)
        .limit(1)
        .execute()
    )

    return response.data[0] if response.data else None


# =========================
# UPDATE CATEGORY
# =========================
def update_ticket_category(category_id: str, payload: dict):
    current = get_category_by_id(category_id)

    if not current:
        raise ValueError("Kategori tiket tidak ditemukan.")

    if "quota" in payload and payload["quota"] < current["sold"]:
        raise ValueError(
            "Kuota tidak boleh lebih kecil dari tiket terjual."
        )

    response = (
        db.table("ticket_categories")
        .update(payload)
        .eq("id", category_id)
        .execute()
    )

    return response.data[0] if response.data else None


# =========================
# DELETE CATEGORY
# =========================
def delete_ticket_category(category_id: str):
    current = get_category_by_id(category_id)

    if not current:
        raise ValueError("Kategori tiket tidak ditemukan.")

    if current["sold"] > 0:
        raise ValueError(
            "Kategori tidak bisa dihapus karena sudah memiliki penjualan."
        )

    response = (
        db.table("ticket_categories")
        .delete()
        .eq("id", category_id)
        .execute()
    )

    return bool(response.data)
