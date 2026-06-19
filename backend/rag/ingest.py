import numpy as np

from rag.loaders import extract_text
from rag.chunker import chunk_text
from embeddings.embedder import get_embedding
from vectorstore.chroma_store import add_chunks, delete_doc


def ingest_file(file_path, doc_id):
    """Extract, chunk, embed, and index any supported document.

    Returns the number of chunks indexed. Raises ValueError if no extractable
    text is found, or UnsupportedFileError (from loaders) for deferred types.
    """

    text = extract_text(file_path)

    if not text or not text.strip():
        raise ValueError(
            "No extractable text found in the file (it may be scanned images)."
        )

    chunks = chunk_text(text)

    embeddings = np.array([get_embedding(chunk) for chunk in chunks])

    # Replace any prior chunks for this document, then add the new ones.
    delete_doc(doc_id)

    add_chunks(chunks, embeddings, doc_id=doc_id)

    return len(chunks)


# Backwards-compatible alias (older callers used ingest_pdf).
def ingest_pdf(file_path, doc_id):
    return ingest_file(file_path, doc_id)
