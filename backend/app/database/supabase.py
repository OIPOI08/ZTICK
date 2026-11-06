from supabase import create_client, Client
from .config import (
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY
)

# Client untuk proses autentikasi
auth_client: Client = create_client(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
)

# Client khusus backend untuk akses database
db: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SECRET_KEY
)