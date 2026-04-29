# db/supabase_client.py
from supabase import create_client
from config import SUPABASE_URL, SUPABASE_KEY

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

async def save_call_record(
    original_text: str,
    translated_text: str,
    language_code: str,
):
# every call record will be saved in "call_records" table, you can create this table in Supabase with columns: 
#   id (uuid), original_text (text), translated_text (text), language_code (text), created_at (timestamp) await
    supabase.table("call_records").insert({
        "original_text":   original_text,
        "translated_text": translated_text,
        "language_code":   language_code,
    }).execute()