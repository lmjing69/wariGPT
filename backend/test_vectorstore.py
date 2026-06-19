from rag.pdf_loader import extract_pdf_text
from rag.chunker import chunk_text

from embeddings.embedder import get_embedding
from vectorstore.chroma_store import add_chunks

pdf_path = "uploads/03.04.25 PPL module 2 Section A.pdf"

text = extract_pdf_text(pdf_path)

chunks = chunk_text(text)

embeddings = []

for chunk in chunks:
    embeddings.append(
        get_embedding(chunk)
    )

import numpy as np

embeddings = np.array(embeddings)

add_chunks(
    chunks,
    embeddings
)

print("Stored Successfully")
