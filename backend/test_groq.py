from services.groq_llm import ask_groq

response = ask_groq(
    "Explain RAG in simple terms."
)

print(response)
