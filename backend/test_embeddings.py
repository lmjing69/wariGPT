from embeddings.embedder import get_embedding

text = "A variable is a named storage location"

embedding = get_embedding(text)

print(type(embedding))
print(len(embedding))

print("\nFirst 10 Values:\n")

print(embedding[:10])
