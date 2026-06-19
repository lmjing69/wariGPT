"""ElevenLabs TTS service with in-memory cache."""
import hashlib
import logging
import os
from typing import Iterator

from elevenlabs import ElevenLabs

logger = logging.getLogger(__name__)

# --- Configuration (change here to swap voice/model) ---
VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"  # George – natural conversational voice
MODEL_ID = "eleven_turbo_v2_5"       # lowest-latency high-quality model

_client: ElevenLabs | None = None
_cache: dict[str, bytes] = {}


def _get_client() -> ElevenLabs:
    global _client
    if _client is None:
        api_key = os.environ.get("ELEVENLABS_API_KEY")
        if not api_key:
            raise RuntimeError("ELEVENLABS_API_KEY is not set")
        _client = ElevenLabs(api_key=api_key)
    return _client


def _cache_key(text: str) -> str:
    return hashlib.sha256(f"{VOICE_ID}:{MODEL_ID}:{text}".encode()).hexdigest()


def synthesize(text: str) -> bytes:
    """Return audio bytes for *text*, using cache when available."""
    key = _cache_key(text)
    if key in _cache:
        logger.debug("TTS cache hit")
        return _cache[key]

    client = _get_client()
    chunks: list[bytes] = []
    for chunk in client.text_to_speech.stream(
        text=text,
        voice_id=VOICE_ID,
        model_id=MODEL_ID,
    ):
        if isinstance(chunk, bytes):
            chunks.append(chunk)

    audio = b"".join(chunks)
    _cache[key] = audio
    return audio


def synthesize_stream(text: str) -> Iterator[bytes]:
    """Yield audio chunks for streaming response."""
    key = _cache_key(text)
    if key in _cache:
        logger.debug("TTS cache hit (stream)")
        yield _cache[key]
        return

    client = _get_client()
    chunks: list[bytes] = []
    for chunk in client.text_to_speech.stream(
        text=text,
        voice_id=VOICE_ID,
        model_id=MODEL_ID,
    ):
        if isinstance(chunk, bytes):
            chunks.append(chunk)
            yield chunk

    _cache[key] = b"".join(chunks)
