
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.database.supabase import db
from app.middleware.auth_middleware import require_roles
from app.schemas.tickets import (
    TicketCategoryCreate,
    TicketCategoryUpdate
)

router = APIRouter(
    prefix="/api/ticket-categories",
    tags=["Ticket Categories"]
)


# ==========================================
# HELPER
# ==========================================

def get_event(event_id: str, organizer_id: str = None):
    query = (
        db.table("events")
        .select("id, status, organizer_id")
        .eq("id", event_id)
    )

    if organizer_id:
        query = query.eq("organizer_id", organizer_id)

    response = query.limit(1).execute()

    if not response.data:
        return None

    return response.data[0]


def get_category(ticket_category_id: str):
    response = (
        db.table("ticket_categories")
        .select("*")
        .eq("id", ticket_category_id)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def validate_sales_period(sales_start, sales_end):
    if sales_start and sales_end:
        start = datetime.fromisoformat(
            sales_start.replace("Z", "+00:00")
        )
        end = datetime.fromisoformat(
            sales_end.replace("Z", "+00:00")
        )

        if start >= end:
            raise HTTPException(
                status_code=400,
                detail="Sales end harus setelah sales start."
            )


# ==========================================
# EVENT ORGANIZER - TAMBAH KATEGORI TIKET
# ==========================================

@router.post("/{event_id}")
def create_ticket_category(
    event_id: str,
    data: TicketCategoryCreate,
    current_user: dict = Depends(
        require_roles("event_organizer")
    )
):
    try:
        event = get_event(
            event_id,
            current_user["id"]
        )

        if not event:
            raise HTTPException(
                status_code=404,
                detail="Konser tidak ditemukan."
            )

        if event["status"] not in ["draft", "pending"]:
            raise HTTPException(
                status_code=400,
                detail="Kategori tiket tidak dapat ditambahkan pada status konser ini."
            )

        ticket_data = data.model_dump(mode="json")

        validate_sales_period(
            ticket_data.get("sales_start"),
            ticket_data.get("sales_end")
        )

        ticket_data["event_id"] = event_id
        ticket_data["sold"] = 0

        response = (
            db.table("ticket_categories")
            .insert(ticket_data)
            .execute()
        )

        return {
            "success": True,
            "message": "Kategori tiket berhasil dibuat.",
            "data": response.data
        }

    except HTTPException:
        raise

    except Exception as error:
        print("CREATE TICKET CATEGORY ERROR:", repr(error))

        raise HTTPException(
            status_code=400,
            detail="Gagal membuat kategori tiket."
        )


# ==========================================
# EVENT ORGANIZER - LIHAT KATEGORI TIKET
# ==========================================

@router.get("/organizer/{event_id}")
def get_organizer_ticket_categories(
    event_id: str,
    current_user: dict = Depends(
        require_roles("event_organizer")
    )
):
    try:
        event = get_event(
            event_id,
            current_user["id"]
        )

        if not event:
            raise HTTPException(
                status_code=404,
                detail="Konser tidak ditemukan."
            )

        response = (
            db.table("ticket_categories")
            .select("*")
            .eq("event_id", event_id)
            .order("price")
            .execute()
        )

        return {
            "success": True,
            "data": response.data or []
        }

    except HTTPException:
        raise

    except Exception as error:
        print("GET ORGANIZER CATEGORIES ERROR:", repr(error))

        raise HTTPException(
            status_code=400,
            detail="Gagal mengambil kategori tiket."
        )


# ==========================================
# EVENT ORGANIZER - UBAH KATEGORI TIKET
# ==========================================

@router.patch("/{ticket_category_id}")
def update_ticket_category(
    ticket_category_id: str,
    data: TicketCategoryUpdate,
    current_user: dict = Depends(
        require_roles("event_organizer")
    )
):
    try:
        category = get_category(ticket_category_id)

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Kategori tiket tidak ditemukan."
            )

        event = get_event(
            category["event_id"],
            current_user["id"]
        )

        if not event:
            raise HTTPException(
                status_code=403,
                detail="Kamu tidak memiliki akses ke kategori ini."
            )

        if event["status"] not in ["draft", "pending"]:
            raise HTTPException(
                status_code=400,
                detail="Kategori pada konser yang sudah dipublikasikan tidak dapat diubah."
            )

        update_data = data.model_dump(
            exclude_unset=True,
            mode="json"
        )

        if not update_data:
            raise HTTPException(
                status_code=400,
                detail="Tidak ada data yang diperbarui."
            )

        new_quota = update_data.get(
            "quota",
            category["quota"]
        )

        if new_quota < category["sold"]:
            raise HTTPException(
                status_code=400,
                detail="Kuota tidak boleh lebih kecil dari tiket yang terjual."
            )

        sales_start = update_data.get(
            "sales_start",
            category.get("sales_start")
        )

        sales_end = update_data.get(
            "sales_end",
            category.get("sales_end")
        )

        validate_sales_period(
            sales_start,
            sales_end
        )

        response = (
            db.table("ticket_categories")
            .update(update_data)
            .eq("id", ticket_category_id)
            .execute()
        )

        return {
            "success": True,
            "message": "Kategori tiket berhasil diperbarui.",
            "data": response.data
        }

    except HTTPException:
        raise

    except Exception as error:
        print("UPDATE TICKET CATEGORY ERROR:", repr(error))

        raise HTTPException(
            status_code=400,
            detail="Gagal memperbarui kategori tiket."
        )


# ==========================================
# EVENT ORGANIZER - HAPUS KATEGORI TIKET
# ==========================================

@router.delete("/{ticket_category_id}")
def delete_ticket_category(
    ticket_category_id: str,
    current_user: dict = Depends(
        require_roles("event_organizer")
    )
):
    try:
        category = get_category(ticket_category_id)

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Kategori tiket tidak ditemukan."
            )

        event = get_event(
            category["event_id"],
            current_user["id"]
        )

        if not event:
            raise HTTPException(
                status_code=403,
                detail="Kamu tidak memiliki akses ke kategori ini."
            )

        if event["status"] not in ["draft", "pending"]:
            raise HTTPException(
                status_code=400,
                detail="Kategori pada konser yang sudah dipublikasikan tidak dapat dihapus."
            )

        if category["sold"] > 0:
            raise HTTPException(
                status_code=400,
                detail="Kategori yang sudah memiliki penjualan tidak dapat dihapus."
            )

        (
            db.table("ticket_categories")
            .delete()
            .eq("id", ticket_category_id)
            .execute()
        )

        return {
            "success": True,
            "message": "Kategori tiket berhasil dihapus."
        }

    except HTTPException:
        raise

    except Exception as error:
        print("DELETE TICKET CATEGORY ERROR:", repr(error))

        raise HTTPException(
            status_code=400,
            detail="Gagal menghapus kategori tiket. Pastikan kategori tidak terhubung dengan order."
        )


# ==========================================
# CUSTOMER - LIHAT KATEGORI TIKET KONSER
# ==========================================

@router.get("/public/{event_id}")
def get_public_ticket_categories(
    event_id: str
):
    try:
        event = get_event(event_id)

        if not event or event["status"] != "published":
            raise HTTPException(
                status_code=404,
                detail="Konser tidak ditemukan."
            )

        response = (
            db.table("ticket_categories")
            .select(
                "id, name, description, price, quota, sold, sales_start, sales_end"
            )
            .eq("event_id", event_id)
            .order("price")
            .execute()
        )

        now = datetime.now(timezone.utc)

        available_categories = []

        for category in response.data or []:
            quota = category["quota"]
            sold = category["sold"]

            sales_start = category.get("sales_start")
            sales_end = category.get("sales_end")

            if quota <= sold:
                continue

            if sales_start:
                start = datetime.fromisoformat(
                    sales_start.replace("Z", "+00:00")
                )

                if now < start:
                    continue

            if sales_end:
                end = datetime.fromisoformat(
                    sales_end.replace("Z", "+00:00")
                )

                if now > end:
                    continue

            category["remaining"] = quota - sold

            available_categories.append(category)

        return {
            "success": True,
            "data": available_categories
        }

    except HTTPException:
        raise

    except Exception as error:
        print("GET PUBLIC CATEGORIES ERROR:", repr(error))

        raise HTTPException(
            status_code=400,
            detail="Gagal mengambil kategori tiket."
        )
