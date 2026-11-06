from app.database.supabase import auth_client, db


def register_user(full_name: str, email: str, password: str):
    response = auth_client.auth.sign_up({
        "email": email,
        "password": password,
        "options": {
            "data": {
                "full_name": full_name
            }
        }
    })

    return response


def login_user(email: str, password: str):
    response = auth_client.auth.sign_in_with_password({
        "email": email,
        "password": password
    })

    return response


def get_user_profile(user_id: str):
    response = (
        db.table("profiles")
        .select("id, full_name, email, role")
        .eq("id", user_id)
        .single()
        .execute()
    )

    return response.data