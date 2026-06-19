from embeddings.embedder import get_embedding
from vectorstore.chroma_store import search_chunks
from services.llm import ask_llm


def ask_pdf(question):

    query_embedding = get_embedding(question)

    results = search_chunks(
        query_embedding,
        n_results=3
    )

    retrieved_chunks = results["documents"][0]

    context = "\n\n".join(retrieved_chunks)

    prompt = f"""
You are a helpful assistant.

Answer ONLY using the context below.

If the answer is not in the context, say:
"I could not find the answer in the document."

Context:
{context}

Question:
{question}
"""

    answer = ask_llm(prompt)

    return {
        "answer": answer,
        "context": retrieved_chunks
    }
