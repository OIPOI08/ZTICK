
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.middleware.auth_middleware import require_roles
from app.schemas.admin import OrganizerVerificationRequest
from app.services.admin_service import (
    get_users,
    get_user_detail,
    update_organizer_verification
)

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin Management"]
)


# ==========================================
# GET ALL USERS
# ==========================================

@router.get("/users")
def admin_get_users(
    role: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: dict = Depends(require_roles("admin"))
):
    try:
        users = get_users(
            role=role,
            search=search,
            page=page,
            limit=limit
        )

        return {
            "success": True,
            "data": users,
            "pagination": {
                "page": page,
                "limit": limit,
                "returned": len(users)
            }
        }

    except ValueError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ==========================================
# GET USER DETAIL
# ==========================================

@router.get("/users/{user_id}")
def admin_get_user_detail(
    user_id: str,
    current_user: dict = Depends(require_roles("admin"))
):
    try:
        user = get_user_detail(user_id)

        return {
            "success": True,
            "data": user
        }

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


# ==========================================
# VERIFY ORGANIZER
# ==========================================

@router.patch("/organizers/{organizer_id}/verification")
def admin_verify_organizer(
    organizer_id: str,
    request: OrganizerVerificationRequest,
    current_user: dict = Depends(require_roles("admin"))
):
    if (
        request.verification_status == "rejected"
        and not request.rejection_reason
    ):
        raise HTTPException(
            status_code=400,
            detail="Alasan penolakan wajib diisi."
        )

    try:
        organizer = update_organizer_verification(
            organizer_id=organizer_id,
            admin_id=current_user["id"],
            verification_status=request.verification_status,
            rejection_reason=request.rejection_reason
        )

        return {
            "success": True,
            "message": (
                "Organizer berhasil diverifikasi."
                if request.verification_status == "verified"
                else "Pengajuan organizer berhasil ditolak."
            ),
            "data": organizer
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )
