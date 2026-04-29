import os
from dotenv import load_dotenv

load_dotenv()  # read .env file and set environment variables

ELEVENLABS_API_KEY  = os.getenv("ELEVENLABS_API_KEY")  
SUPABASE_URL        = os.getenv("SUPABASE_URL")         
SUPABASE_KEY        = os.getenv("SUPABASE_KEY")        
DISPATCHER_LANG     = os.getenv("DISPATCHER_LANG", "English")
DISPATCHER_VOICE_ID = os.getenv("DISPATCHER_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")