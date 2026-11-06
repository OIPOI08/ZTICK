
from fastapi import APIRouter, HTTPException, Depends
from app.database.supabase import db
from app.middleware.auth_middleware import (
    get_current_user,
    require_roles
)
from app.schemas.events import EventCreate, EventUpdate

router = APIRouter(
    prefix="/api/events",
    tags=["Events"]
)


# ==========================================
# CUSTOMER - MELIHAT KONSER PUBLISHED
# ==========================================

@router.get("/")
def get_events():
    try:
        response = (
            db.table("events")
            .select("*, categories(name), ticket_categories(*)")
            .eq("status", "published")
            .order("start_date")
            .execute()
        )

        return {
            "success": True,
            "data": response.data
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Gagal mengambil data konser."
        )


# ==========================================
# DETAIL KONSER
# ==========================================

@router.get("/{event_id}")
def get_event_detail(event_id: str):
    try:
        response = (
            db.table("events")
            .select("*, categories(name), ticket_categories(*)")
            .eq("id", event_id)
            .eq("status", "published")
            .single()
            .execute()
        )

        return {
            "success": True,
            "data": response.data
        }

    except Exception:
        raise HTTPException(
            status_code=404,
            detail="Konser tidak ditemukan."
        )


# ==========================================
# EVENT ORGANIZER - MEMBUAT KONSER
# ==========================================

@router.post("/")
def create_event(
    data: EventCreate,
    current_user: dict = Depends(
        require_roles("event_organizer")
    )
):
    try:
        event_data = data.model_dump(mode="json")

        event_data["organizer_id"] = current_user["id"]
        event_data["status"] = "pending"

        response = (
            db.table("events")
            .insert(event_data)
            .execute()
        )

        return {
            "success": True,
            "message": "Pengajuan konser berhasil dikirim.",
            "data": response.data
        }

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Gagal mengajukan konser. Periksa data dan slug."
        )


@router.patch("/{event_id}")
def update_event(
    event_id: str,
    data: EventUpdate,
    current_user: dict = Depends(
        require_roles("event_organizer")
    )
):
    try:
        update_data = data.model_dump(
            exclude_unset=True,
            mode="json"
        )

        response = (
            db.table("events")
            .update(update_data)
            .eq("id", event_id)
            .eq("organizer_id", current_user["id"])
            .eq("status", "draft")
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Konser tidak ditemukan atau tidak dapat diedit."
            )

        return {
            "success": True,
            "message": "Konser berhasil diperbarui.",
            "data": response.data
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Gagal memperbarui konser."
        )

# ==========================================
# EVENT ORGANIZER - MELIHAT KONSER MILIKNYA
# ==========================================

@router.get("/organizer/my-events")
def get_my_events(
    current_user: dict = Depends(
        require_roles("event_organizer")
    )
):
    try:
        response = (
            db.table("events")
            .select("*")
            .eq("organizer_id", current_user["id"])
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "success": True,
            "data": response.data
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Gagal mengambil konser milik organizer."
        )


# ==========================================
# EVENT ORGANIZER - MENGUBAH KONSER
# ==========================================



# ==========================================
# SUPER ADMIN - MELIHAT PENGAJUAN KONSER
# ==========================================

@router.get("/admin/submissions")
def get_event_submissions(
    current_user: dict = Depends(
        require_roles("super_admin")
    )
):
    try:
        response = (
            db.table("events")
            .select("*")
            .eq("status", "pending")
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "success": True,
            "data": response.data
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Gagal mengambil pengajuan konser."
        )


# ==========================================
# SUPER ADMIN - APPROVE KONSER
# ==========================================

@router.patch("/admin/{event_id}/approve")
def approve_event(
    event_id: str,
    current_user: dict = Depends(
        require_roles("super_admin")
    )
):
    try:
        response = (
            db.table("events")
            .update({"status": "published"})
            .eq("id", event_id)
            .eq("status", "pending")
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Pengajuan konser tidak ditemukan."
            )

        return {
            "success": True,
            "message": "Konser berhasil disetujui.",
            "data": response.data
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Gagal menyetujui konser."
        )


# ==========================================
# SUPER ADMIN - MENOLAK KONSER
# ==========================================

@router.patch("/admin/{event_id}/reject")
def reject_event(
    event_id: str,
    current_user: dict = Depends(
        require_roles("super_admin")
    )
):
    try:
        response = (
            db.table("events")
            .update({
                "status": "rejected",
                "rejection_reason": "Pengajuan ditolak oleh Super Admin."
            })
            .eq("id", event_id)
            .eq("status", "pending")
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Pengajuan konser tidak ditemukan."
            )

        return {
            "success": True,
            "message": "Pengajuan konser ditolak.",
            "data": response.data
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Gagal menolak konser."
        )
