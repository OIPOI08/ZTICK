
import re
from uuid import uuid4

from app.database.supabase import db


def generate_slug(title: str):
    slug = title.lower().strip()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")

    return f"{slug}-{uuid4().hex[:8]}"


def serialize_dates(data: dict):
    for field in ("start_date", "end_date"):
        value = data.get(field)

        if value is not None and hasattr(value, "isoformat"):
            data[field] = value.isoformat()

    return data


# =========================
# CREATE EVENT
# =========================
def create_event(payload: dict, admin_id: str):
    data = serialize_dates(payload.copy())

    data["organizer_id"] = admin_id
    data["slug"] = generate_slug(data["title"])
    data["status"] = "draft"

    response = (
        db.table("events")
        .insert(data)
        .execute()
    )

    return response.data[0] if response.data else None


# =========================
# GET ALL EVENTS (ADMIN)
# =========================
def get_all_events():
    response = (
        db.table("events")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )

    return response.data


# =========================
# GET PUBLISHED EVENTS
# =========================
def get_published_events():
    response = (
        db.table("events")
        .select("*")
        .eq("status", "published")
        .order("start_date")
        .execute()
    )

    return response.data


# =========================
# GET EVENT DETAIL
# =========================
def get_event_by_id(event_id: str, published_only=False):
    query = (
        db.table("events")
        .select("*")
        .eq("id", event_id)
    )

    if published_only:
        query = query.eq("status", "published")

    response = query.limit(1).execute()

    return response.data[0] if response.data else None


# =========================
# UPDATE EVENT
# =========================
def update_event(event_id: str, payload: dict):
    data = serialize_dates(payload.copy())

    if not data:
        return get_event_by_id(event_id)

    if "title" in data:
        data["slug"] = generate_slug(data["title"])

    response = (
        db.table("events")
        .update(data)
        .eq("id", event_id)
        .execute()
    )

    return response.data[0] if response.data else None


# =========================
# PUBLISH EVENT
# =========================
def publish_event(event_id: str):
    response = (
        db.table("events")
        .update({
            "status": "published",
            "rejection_reason": None
        })
        .eq("id", event_id)
        .execute()
    )

    return response.data[0] if response.data else None


# =========================
# DELETE EVENT
# =========================
def delete_event(event_id: str):
    response = (
        db.table("events")
        .delete()
        .eq("id", event_id)
        .execute()
    )

    return bool(response.data)
