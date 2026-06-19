from rag.pdf_loader import extract_pdf_text

pdf_path = "uploads/03.04.25 PPL module 2 Section A.pdf"

text = extract_pdf_text(pdf_path)

print("=" * 50)
print(text[:3000])
print("=" * 50)

print(f"\nTotal Characters: {len(text)}")
