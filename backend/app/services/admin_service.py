
from datetime import datetime, timezone

from app.database.supabase import db


def get_users(role=None, search=None, page=1, limit=20):
    try:
        query = (
            db.table("profiles")
            .select(
                "id, full_name, email, phone, role, "
                "verification_status, created_at"
            )
        )

        if role:
            query = query.eq("role", role)

        if search:
            query = query.or_(
                f"full_name.ilike.%{search}%,email.ilike.%{search}%"
            )

        start = (page - 1) * limit
        end = start + limit - 1

        response = (
            query
            .order("created_at", desc=True)
            .range(start, end)
            .execute()
        )

        return response.data or []

    except Exception as error:
        print("GET USERS ERROR:", repr(error))
        raise ValueError("Gagal mengambil daftar pengguna.")


def get_user_detail(user_id):
    try:
        response = (
            db.table("profiles")
            .select(
                "id, full_name, email, phone, avatar_url, role, "
                "verification_status, verified_at, verified_by, "
                "rejection_reason, created_at"
            )
            .eq("id", user_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            raise ValueError("Pengguna tidak ditemukan.")

        return response.data[0]

    except ValueError:
        raise
    except Exception as error:
        print("GET USER DETAIL ERROR:", repr(error))
        raise ValueError("Gagal mengambil detail pengguna.")


def update_organizer_verification(
    organizer_id,
    admin_id,
    verification_status,
    rejection_reason=None
):
    try:
        organizer = (
            db.table("profiles")
            .select("id, role")
            .eq("id", organizer_id)
            .limit(1)
            .execute()
        )

        if not organizer.data:
            raise ValueError("Organizer tidak ditemukan.")

        if organizer.data[0]["role"] != "event_organizer":
            raise ValueError("Pengguna ini bukan event organizer.")

        update_data = {
            "verification_status": verification_status,
            "verified_by": admin_id,
            "verified_at": (
                datetime.now(timezone.utc).isoformat()
                if verification_status == "verified"
                else None
            ),
            "rejection_reason": (
                rejection_reason
                if verification_status == "rejected"
                else None
            )
        }

        response = (
            db.table("profiles")
            .update(update_data)
            .eq("id", organizer_id)
            .execute()
        )

        if not response.data:
            raise ValueError("Gagal memperbarui verifikasi organizer.")

        return response.data[0]

    except ValueError:
        raise
    except Exception as error:
        print("UPDATE VERIFICATION ERROR:", repr(error))
        raise ValueError("Terjadi kesalahan saat memperbarui verifikasi.")
