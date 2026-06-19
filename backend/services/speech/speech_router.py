"""FastAPI router exposing POST /tts."""
import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.speech.elevenlabs_tts import synthesize_stream

logger = logging.getLogger(__name__)

router = APIRouter()


class TTSRequest(BaseModel):
    text: str


@router.post("/tts")
def tts(req: TTSRequest):
    if not req.text.strip():
        raise HTTPException(status_code=422, detail="text must not be empty")

    try:
        return StreamingResponse(
            synthesize_stream(req.text),
            media_type="audio/mpeg",
        )
    except RuntimeError as e:
        # Missing API key
        logger.error("TTS config error: %s", e)
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception("TTS generation failed")
        raise HTTPException(status_code=502, detail="Voice generation failed")
