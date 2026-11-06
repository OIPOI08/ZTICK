
import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

# Lokasi backend/.env
BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH, override=True)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")

# Validasi environment
if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL belum terbaca dari backend/.env")

if not SUPABASE_PUBLISHABLE_KEY:
    raise ValueError("SUPABASE_PUBLISHABLE_KEY belum diisi!")

if not SUPABASE_SECRET_KEY:
    raise ValueError("SUPABASE_SECRET_KEY belum diisi!")

# Supabase client untuk autentikasi
auth_client = create_client(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
)

# Supabase client untuk database backend
db = create_client(
    SUPABASE_URL,
    SUPABASE_SECRET_KEY,
)
