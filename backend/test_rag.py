from rag.rag_pipeline import ask_pdf

result = ask_pdf(
    "What is a variable?"
)

print("\nANSWER\n")
print(result["answer"])
