
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database.supabase import auth_client, db


security = HTTPBearer()


# =========================
# VERIFY TOKEN & GET USER
# =========================
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        response = auth_client.auth.get_user(token)

        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token tidak valid."
            )

        user_id = response.user.id

        profile_response = (
            db.table("profiles")
            .select("id, full_name, email, phone, avatar_url, role")
            .eq("id", user_id)
            .single()
            .execute()
        )

        profile = profile_response.data

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profil pengguna tidak ditemukan."
            )

        return profile

    except HTTPException:
        raise

    except Exception as error:
        print("AUTHENTICATION ERROR:", repr(error))

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autentikasi gagal atau token sudah kedaluwarsa."
        )


# =========================
# ROLE AUTHORIZATION
# =========================
def require_roles(*allowed_roles: str):

    def role_checker(
        current_user: dict = Depends(get_current_user)
    ):
        user_role = current_user.get("role")

        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Kamu tidak memiliki akses ke fitur ini."
            )

        return current_user

    return role_checker
