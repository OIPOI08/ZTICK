
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.middleware.auth_middleware import require_roles
from app.services.dashboard_service import (
    get_organizer_dashboard,
    get_admin_dashboard
)

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


# ==========================================
# ORGANIZER DASHBOARD
# ==========================================

@router.get("/organizer/overview")
def organizer_dashboard(
    current_user: dict = Depends(
        require_roles("event_organizer")
    )
):
    try:
        stats = get_organizer_dashboard(
            organizer_id=current_user["id"]
        )

        return {
            "success": True,
            "data": stats
        }

    except ValueError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@router.get("/organizer/events/{event_id}")
def organizer_event_dashboard(
    event_id: UUID,
    current_user: dict = Depends(
        require_roles("event_organizer")
    )
):
    try:
        stats = get_organizer_dashboard(
            organizer_id=current_user["id"],
            event_id=str(event_id)
        )

        return {
            "success": True,
            "data": stats
        }

    except ValueError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ==========================================
# ADMIN DASHBOARD
# ==========================================

@router.get("/admin/overview")
def admin_dashboard(
    current_user: dict = Depends(
        require_roles("admin")
    )
):
    try:
        stats = get_admin_dashboard()

        return {
            "success": True,
            "data": stats
        }

    except ValueError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
