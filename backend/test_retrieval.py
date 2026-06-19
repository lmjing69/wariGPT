from embeddings.embedder import get_embedding
from vectorstore.chroma_store import search_chunks

question = "What is a variable?"

query_embedding = get_embedding(question)

results = search_chunks(
    query_embedding,
    n_results=3
)

print("\nRESULTS\n")

for doc in results["documents"][0]:
    print("=" * 60)
    print(doc)
    print("=" * 60)
