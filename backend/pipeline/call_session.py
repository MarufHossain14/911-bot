# pipeline/call_session.py
import base64
from services.speech_to_text import transcribe
from services.translate import translate
from services.text_to_speech import speak
from db.supabase_client import save_call_record  # 下面會寫

async def process_call(audio_bytes: bytes) -> dict:
    """
    完整流程：
    音訊 → 轉文字 → 翻譯 → 語音 → 回傳結果

    回傳的 dict 會直接送給前端
    """

    # Step 1: audio transcribe to text
    stt_result = await transcribe(audio_bytes)
    original_text  = stt_result["text"]
    language_code  = stt_result["language_code"]
    language_name  = stt_result["language_name"]

    if not original_text.strip():
        return {"error": "No speech detected"}

    # Step 2: translate to English (or you can choose other target language)
    translated_text = await translate(
        text=original_text,
        source_lang=language_code,
        target_lang="en"
    )

    # Step 3: text to speech
    audio_mp3 = await speak(translated_text)

    # Step 4: save to database (asynchronous, doesn't affect response speed)
    await save_call_record(
        original_text=original_text,
        translated_text=translated_text,
        language_code=language_code,
    )

    # Step 5: assemble the data to return to the frontend
    return {
        "original_text":   original_text,
        "language_code":   language_code,
        "language_name":   language_name,
        "translated_text": translated_text,
        # audio to base64, so it can be sent to the frontend as JSON
        "audio_b64": base64.b64encode(audio_mp3).decode("utf-8"),
    }