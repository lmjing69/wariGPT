import os
import json

from rag.retrieval import retrieve, is_relevant
from services.llm import stream_answer, generate_followups, RateLimitError

FOLLOWUPS_ENABLED = os.getenv("WARIGPT_FOLLOWUPS", "1") != "0"

# The assistant's persona. This is what makes it feel like a product, not a
# document query box. RAG is never mentioned to the user.
BASE_PERSONA = """You are WariGPT, a sharp, thoughtful AI assistant.

Personality and behavior:
- Be conversational, warm, and genuinely helpful — like a knowledgeable colleague.
- Answer general questions directly from your own knowledge.
- Ask a brief clarifying question when the request is ambiguous.
- Proactively suggest better approaches and point out weak assumptions, kindly.
- Be willing to brainstorm and explore a topic in depth.
- Use clean Markdown: headings, **bold**, lists, tables, and fenced code blocks
  with language tags when sharing code.
- Be concise by default; expand when the user wants depth.

Never mention retrieval, embeddings, vector databases, "chunks", or that you are
a RAG system. Never say "based on the provided context" unless the user explicitly
asks where information came from."""

GROUNDING_TEMPLATE = """The user has uploaded documents. The following excerpts
appear relevant to their latest message. Use them naturally to inform your answer
when they help. If they don't actually answer the question, rely on your own
knowledge instead — do not force them and do not announce that you used them.

Relevant excerpts:
{context}"""


def build_system_instruction(grounded_chunks):
    if grounded_chunks:
        context = "\n\n---\n\n".join(grounded_chunks)
        return BASE_PERSONA + "\n\n" + GROUNDING_TEMPLATE.format(context=context)
    return BASE_PERSONA


def build_messages(messages):
    """Convert UI messages to OpenAI-style chat messages (user/assistant)."""

    out = []

    for m in messages:
        role = "assistant" if m.get("role") == "assistant" else "user"
        text = m.get("content", "")
        if not text:
            continue
        out.append({"role": role, "content": text})

    return out


def _history_text(messages, limit=6):
    recent = messages[-limit:]
    lines = []
    for m in recent:
        who = "User" if m.get("role") != "assistant" else "Assistant"
        lines.append(f"{who}: {m.get('content', '')}")
    return "\n".join(lines)


def _sse(payload):
    """Format a dict as a Server-Sent Events data line."""
    return f"data: {json.dumps(payload)}\n\n"


def chat_event_stream(messages, doc_ids=None):
    """Generator of SSE strings: token* -> [sources] -> followups -> done.

    Routing is relevance-gated: we retrieve on the last user message and only
    ground (and only emit a `sources` event) when a document is clearly relevant.
    """

    # Find the latest user message to use as the retrieval query.
    last_user = next(
        (m for m in reversed(messages) if m.get("role") != "assistant"),
        None,
    )

    grounded_chunks = []

    try:
        if last_user and last_user.get("content"):
            result = retrieve(last_user["content"], k=4, doc_ids=doc_ids)
            if is_relevant(result["best_distance"]):
                grounded_chunks = result["chunks"]
    except Exception:
        # Retrieval problems should never break the chat — fall back to general.
        grounded_chunks = []

    system_instruction = build_system_instruction(grounded_chunks)
    convo = build_messages(messages)

    answer_parts = []

    try:
        for delta in stream_answer(convo, system_instruction):
            answer_parts.append(delta)
            yield _sse({"type": "token", "text": delta})
    except RateLimitError as e:
        yield _sse({"type": "error", "message": str(e)})
        return
    except Exception:
        yield _sse({
            "type": "error",
            "message": "Something went wrong while generating a response. Please try again.",
        })
        return

    answer = "".join(answer_parts)

    # Sources are hidden by default in the UI; we send them so the user can
    # reveal them on demand. Only emitted when we actually grounded.
    if grounded_chunks:
        yield _sse({"type": "sources", "sources": grounded_chunks})

    if FOLLOWUPS_ENABLED and answer.strip():
        followups = generate_followups(_history_text(messages), answer)
        if followups:
            yield _sse({"type": "followups", "items": followups})

    yield _sse({"type": "done"})
