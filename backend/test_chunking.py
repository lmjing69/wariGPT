from rag.pdf_loader import extract_pdf_text
from rag.chunker import chunk_text

pdf_path = "uploads/03.04.25 PPL module 2 Section A.pdf"

text = extract_pdf_text(pdf_path)

chunks = chunk_text(text)

print(f"Total Chunks: {len(chunks)}")

for i, chunk in enumerate(chunks[:3]):
    print("\n")
    print("=" * 50)
    print(f"Chunk {i+1}")
    print("=" * 50)
    print(chunk[:500])

