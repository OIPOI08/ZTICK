from app.database.supabase import db

try:
    response = db.table("categories").select("*").execute()

    print("================================")
    print("TIXORA - SUPABASE CONNECTION")
    print("================================")
    print("Koneksi Supabase berhasil!")
    print("Data kategori:")

    for category in response.data:
        print(f"- {category['name']}")

except Exception as error:
    print("Koneksi Supabase gagal!")
    print("Error:", error)