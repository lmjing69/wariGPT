from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import shutil
import os
import re

from services.llm import ask_llm
from services.assistant import chat_event_stream
from rag.rag_pipeline import ask_pdf
from rag.ingest import ingest_file
from rag.loaders import UnsupportedFileError, file_kind


def _doc_id_from_filename(filename):
    # Stable, filesystem/metadata-safe id derived from the filename.
    base = os.path.splitext(filename or "document")[0]
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", base).strip("_").lower()
    return slug or "document"


app = FastAPI(title="WariGPT API")

# Allow the Next.js frontend (localhost:3000) to call the API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- Schemas ---------------------------------------------------------------

class PDFQuestion(BaseModel):
    question: str


class ChatRequest(BaseModel):
    question: str


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatStreamRequest(BaseModel):
    messages: List[ChatMessage]
    doc_ids: Optional[List[str]] = None


# ---- Endpoints -------------------------------------------------------------

@app.get("/")
def home():
    return {"status": "running"}


@app.post("/chat-stream")
def chat_stream(data: ChatStreamRequest):
    """Streaming, memory-aware assistant chat with hidden relevance-gated RAG.

    Streams Server-Sent Events: {type:"token"} deltas, then optionally
    {type:"sources"}, {type:"followups"}, and finally {type:"done"}.
    """

    messages = [m.model_dump() for m in data.messages]

    generator = chat_event_stream(messages, doc_ids=data.doc_ids)

    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # disable proxy buffering for streaming
        },
    )


@app.post("/upload")
async def upload(file: UploadFile):
    """Upload + index any supported document (PDF, DOCX, TXT/MD)."""

    os.makedirs("uploads", exist_ok=True)

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    doc_id = _doc_id_from_filename(file.filename)
    kind = file_kind(file.filename)

    try:
        num_chunks = ingest_file(file_path, doc_id)
    except UnsupportedFileError as e:
        raise HTTPException(status_code=415, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to index file: {e}")

    return {
        "message": "uploaded",
        "filename": file.filename,
        "doc_id": doc_id,
        "kind": kind,
        "path": file_path,
        "chunks_indexed": num_chunks,
    }


# Backwards-compatible alias for the original endpoint name.
@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile):
    return await upload(file)


@app.post("/chat")
def chat(data: ChatRequest):
    return {"answer": ask_llm(data.question)}


@app.post("/ask-pdf")
def ask_pdf_endpoint(data: PDFQuestion):
    return ask_pdf(data.question)
