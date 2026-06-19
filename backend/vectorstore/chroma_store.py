import chromadb

client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = client.get_or_create_collection(
    name="documents"
)

def add_chunks(chunks, embeddings, doc_id="doc"):

    # Prefix ids with the document id so multiple PDFs can coexist
    # instead of overwriting each other's chunk_0..N ids.
    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]

    metadatas = [{"doc_id": doc_id} for _ in range(len(chunks))]

    embeddings_list = (
        embeddings.tolist() if hasattr(embeddings, "tolist") else embeddings
    )

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings_list,
        metadatas=metadatas
    )

def delete_doc(doc_id):

    # Remove any previously-indexed chunks for this document so a
    # re-upload replaces them cleanly instead of duplicating.
    collection.delete(
        where={"doc_id": doc_id}
    )

def count():
    return collection.count()


def search_chunks(query_embedding, n_results=3, doc_ids=None):

    query_kwargs = {
        "query_embeddings": [query_embedding.tolist()],
        "n_results": n_results,
    }

    # Optionally restrict the search to specific documents.
    if doc_ids:
        query_kwargs["where"] = {"doc_id": {"$in": list(doc_ids)}}

    results = collection.query(**query_kwargs)

    return results
