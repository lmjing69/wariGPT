import numpy as np
from chromadb.utils.embedding_functions import ONNXMiniLM_L6_V2

_ef = None

def _get_ef():
    global _ef
    if _ef is None:
        _ef = ONNXMiniLM_L6_V2()
    return _ef

def get_embedding(text):
    return np.array(_get_ef()([text])[0])
