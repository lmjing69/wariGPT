from embeddings.embedder import get_embedding
from vectorstore.chroma_store import search_chunks, count

# Chroma's default space is L2 (squared euclidean). Lower distance = closer.
# Empirically, the all-MiniLM-L6-v2 embeddings put on-topic chunks well below
# ~1.0 and off-topic chunks above it. Tune in verification.
RELEVANCE_THRESHOLD = 1.0


def retrieve(question, k=4, doc_ids=None):
    """Embed the question and fetch the nearest chunks.

    Returns a dict: {chunks, distances, best_distance}. Empty/None-safe even
    when the vector store has no documents yet.
    """

    if count() == 0:
        return {"chunks": [], "distances": [], "best_distance": None}

    query_embedding = get_embedding(question)

    results = search_chunks(query_embedding, n_results=k, doc_ids=doc_ids)

    documents = (results.get("documents") or [[]])[0]
    distances = (results.get("distances") or [[]])[0]

    best = min(distances) if distances else None

    return {
        "chunks": documents,
        "distances": distances,
        "best_distance": best,
    }


def is_relevant(best_distance, threshold=RELEVANCE_THRESHOLD):
    """Decide whether the retrieved context is close enough to ground on."""

    if best_distance is None:
        return False

    return best_distance <= threshold
