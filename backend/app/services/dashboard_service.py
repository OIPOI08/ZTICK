
from app.database.supabase import db


# ==========================================
# ORGANIZER DASHBOARD
# ==========================================

def get_organizer_dashboard(
    organizer_id: str,
    event_id: str = None
):
    try:
        response = db.rpc(
            "get_organizer_dashboard_stats",
            {
                "p_organizer_id": organizer_id,
                "p_event_id": event_id
            }
        ).execute()

        return response.data or {}

    except Exception as error:
        print("ORGANIZER DASHBOARD ERROR:", repr(error))
        raise ValueError(
            "Gagal mengambil statistik dashboard organizer."
        )


# ==========================================
# ADMIN DASHBOARD
# ==========================================

def get_admin_dashboard():
    try:
        response = db.rpc(
            "get_admin_dashboard_stats",
            {}
        ).execute()

        return response.data or {}

    except Exception as error:
        print("ADMIN DASHBOARD ERROR:", repr(error))
        raise ValueError(
            "Gagal mengambil statistik dashboard admin."
        )
