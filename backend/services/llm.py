import os
import json

from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


class RateLimitError(Exception):
    """Raised when the LLM provider quota is exhausted."""


def _is_rate_limit(error) -> bool:
    code = getattr(error, "status_code", None) or getattr(error, "code", None)
    text = str(error)
    return code == 429 or "429" in text or "rate_limit" in text.lower()


_RATE_LIMIT_MESSAGE = (
    "The assistant is briefly rate-limited. Please wait a few seconds and try "
    "again."
)


def ask_llm(prompt: str):
    """Single-shot completion (kept for backward compatibility)."""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
    )

    content = response.choices[0].message.content
    return content or "The model did not return a response. Please try again."


def stream_answer(messages, system_instruction):
    """Yield answer text deltas for a multi-turn conversation.

    `messages` is a list of OpenAI-style dicts ({"role": "user"|"assistant",
    "content": str}). `system_instruction` carries the persona + any retrieved
    document context and is prepended as a system message.
    """

    full_messages = [{"role": "system", "content": system_instruction}, *messages]

    try:
        stream = client.chat.completions.create(
            model=MODEL,
            messages=full_messages,
            temperature=0.7,
            stream=True,
        )
        for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
    except Exception as error:
        if _is_rate_limit(error):
            raise RateLimitError(_RATE_LIMIT_MESSAGE) from error
        raise


def generate_followups(history_text: str, answer: str):
    """Return up to 3 short, natural follow-up questions for the user to tap.

    Uses Groq JSON mode for reliability; falls back to [] on any error.
    """

    prompt = f"""Based on the conversation and the assistant's latest answer,
suggest 3 short, natural follow-up questions the USER might want to ask next.

Rules:
- Phrase them from the user's point of view (e.g. "Can you give an example?").
- Keep each under 8 words.
- Make them specific to the topic, not generic.

Respond with JSON in exactly this shape:
{{"followups": ["question 1", "question 2", "question 3"]}}

Conversation so far:
{history_text}

Assistant's latest answer:
{answer}
"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.5,
        )

        content = response.choices[0].message.content
        if not content:
            return []

        data = json.loads(content)
        items = data.get("followups", []) if isinstance(data, dict) else []

        if isinstance(items, list):
            return [str(x) for x in items if str(x).strip()][:3]

        return []
    except Exception:
        return []
