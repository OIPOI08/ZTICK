
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.database.supabase import db
from app.middleware.auth_middleware import require_roles
from app.database.config import db

router = APIRouter(
    prefix="/api/checkin",
    tags=["Check-in"],
)


class CheckinRequest(BaseModel):
    qr_token: UUID


@router.post("/")
def checkin_ticket(
    payload: CheckinRequest,
    current_user=Depends(require_roles("admin")),
):
    try:
        response = db.rpc(
            "checkin_ticket",
            {
                "p_qr_token": str(payload.qr_token),
                "p_admin_id": current_user["id"],
            },
        ).execute()

        if response.data is False:
            raise HTTPException(
                status_code=400,
                detail="Tiket tidak valid atau sudah digunakan.",
            )

        return {
            "success": True,
            "message": "Check-in berhasil.",
            "data": response.data,
        }

    except HTTPException:
        raise

    except Exception as error:
        print("CHECKIN ERROR:", repr(error))
        raise HTTPException(
            status_code=400,
            detail="Check-in gagal. Periksa QR Code tiket.",
        )
