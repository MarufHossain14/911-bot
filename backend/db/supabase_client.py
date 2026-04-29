# db/supabase_client.py
from supabase import create_client
from config import SUPABASE_URL, SUPABASE_KEY

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

async def save_call_record(
    original_text: str,
    translated_text: str,
    language_code: str,
):
    supabase.table("call_records").insert({
        "original_text":   original_text,
        "translated_text": translated_text,
        "language_code":   language_code,
    }).execute()

async def get_call_records():
    result = supabase.table("call_records").select("*").order("created_at", desc=True).execute()
    return result.data