
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
        # Pastikan konser milik organizer yang login
        event_response = (
            db.table("events")
            .select("id, status")
            .eq("id", event_id)
            .eq("organizer_id", current_user["id"])
            .single()
            .execute()
        )

        event = event_response.data

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
        ticket_data["event_id"] = event_id

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

    except Exception:
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
        event_response = (
            db.table("events")
            .select("id")
            .eq("id", event_id)
            .eq("organizer_id", current_user["id"])
            .single()
            .execute()
        )

        if not event_response.data:
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
            "data": response.data
        }

    except HTTPException:
        raise

    except Exception:
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
        category_response = (
            db.table("ticket_categories")
            .select("id, event_id, sold, quota")
            .eq("id", ticket_category_id)
            .single()
            .execute()
        )

        category = category_response.data

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Kategori tiket tidak ditemukan."
            )

        event_response = (
            db.table("events")
            .select("id, status")
            .eq("id", category["event_id"])
            .eq("organizer_id", current_user["id"])
            .single()
            .execute()
        )

        if not event_response.data:
            raise HTTPException(
                status_code=403,
                detail="Kamu tidak memiliki akses ke kategori ini."
            )

        if event_response.data["status"] not in ["draft", "pending"]:
            raise HTTPException(
                status_code=400,
                detail="Kategori konser yang sudah dipublikasikan tidak dapat diubah melalui endpoint ini."
            )

        update_data = data.model_dump(
            exclude_unset=True,
            mode="json"
        )

        if "quota" in update_data:
            if update_data["quota"] < category["sold"]:
                raise HTTPException(
                    status_code=400,
                    detail="Kuota tidak boleh lebih kecil dari tiket yang terjual."
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

    except Exception:
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
        category_response = (
            db.table("ticket_categories")
            .select("id, event_id, sold")
            .eq("id", ticket_category_id)
            .single()
            .execute()
        )

        category = category_response.data

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Kategori tiket tidak ditemukan."
            )

        event_response = (
            db.table("events")
            .select("id, status")
            .eq("id", category["event_id"])
            .eq("organizer_id", current_user["id"])
            .single()
            .execute()
        )

        if not event_response.data:
            raise HTTPException(
                status_code=403,
                detail="Kamu tidak memiliki akses ke kategori ini."
            )

        if event_response.data["status"] not in ["draft", "pending"]:
            raise HTTPException(
                status_code=400,
                detail="Kategori pada konser yang sudah dipublikasikan tidak dapat dihapus."
            )

        if category["sold"] > 0:
            raise HTTPException(
                status_code=400,
                detail="Kategori yang sudah memiliki penjualan tidak dapat dihapus."
            )

        db.table("ticket_categories").delete().eq(
            "id", ticket_category_id
        ).execute()

        return {
            "success": True,
            "message": "Kategori tiket berhasil dihapus."
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Gagal menghapus kategori tiket."
        )


# ==========================================
# CUSTOMER - LIHAT KATEGORI TIKET KONSER
# ==========================================

@router.get("/public/{event_id}")
def get_public_ticket_categories(event_id: str):
    try:
        event_response = (
            db.table("events")
            .select("id")
            .eq("id", event_id)
            .eq("status", "published")
            .single()
            .execute()
        )

        if not event_response.data:
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

        return {
            "success": True,
            "data": response.data
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Gagal mengambil kategori tiket."
        )
