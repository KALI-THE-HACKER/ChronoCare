from agno.vectordb.chroma.chromadb import ChromaDb
from agno.embedder.sentence_transformer import SentenceTransformerEmbedder
from hashlib import md5
from typing import List, Optional, Dict, Any, Any as AnyType
from agno.document.base import Document
from agno.document.chunking.semantic import SemanticChunking
from agno.vectordb.chroma.chromadb import ChromaDb
from pypdf import PdfReader
from agno.utils.log import logger
import os
import time
import json

EMBEDDER = SentenceTransformerEmbedder()
CHUNKER = SemanticChunking(embedder=EMBEDDER)
_CHROMA_CACHE: Dict[str, ChromaDb] = {}

def _sanitize_metadata(meta: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Return a metadata dict where values are primitives or JSON strings acceptable by Chroma."""
    if not meta:
        return {}
    out: Dict[str, Any] = {}
    for k, v in meta.items():
        if v is None or isinstance(v, (str, int, float, bool)):
            out[k] = v
        else:
            # lists/dicts/other -> serialize to JSON string (safe for Chroma)
            try:
                out[k] = json.dumps(v, ensure_ascii=False)
            except Exception:
                out[k] = str(v)
    return out

def pdf_to_document(file_path: str, meta_data:Optional[Dict[str, Any]] = None, doc_id: Optional[str] = None) -> Document:
    """
    Read entire PDF and return a single Document containing all text.
    """
    reader = PdfReader(file_path)
    texts = []
    for i, page in enumerate(reader.pages, 1):
        page_text = page.extract_text() or ""
        texts.append(page_text.replace("\x00", "\ufffd"))
    full_text = "\n\n".join(t.strip() for t in texts if t.strip())
    if not doc_id:
        doc_id = md5(full_text.encode("utf-8")).hexdigest() if full_text else None
    
    # base metadata (always include primitive path/source/pages)
    base_meta = {"source": os.path.basename(file_path), "path": str(file_path), "pages": len(reader.pages)}

    if meta_data:
        # merge provided meta, then sanitize everything
        merged = {**meta_data}
        merged.update(base_meta)
        meta = _sanitize_metadata(merged)
    else:
        meta = base_meta

    return Document(id=doc_id, name=os.path.basename(file_path), meta_data=meta, content=full_text)


def semantically_chunk_pdf(
    file_path: str,
    embedder: Optional[Any] = None,
    chunk_size: int = 5000,
    similarity_threshold: Optional[float] = 0.5,
    meta_data: Optional[Dict[str, Any]] = None,
) -> List[Document]:
    """
    Produce semantic chunks (List[Document]) from a PDF using SemanticChunking.
    """
    logger.info(f"Loading PDF and creating Document: {file_path}")
    doc = pdf_to_document(file_path,meta_data=meta_data)
    use_embedder = embedder or EMBEDDER
    chunker = SemanticChunking(embedder=use_embedder)
    logger.info(f"Chunking document semantically (chunk_size={chunk_size}, threshold={similarity_threshold})")
    chunks = chunker.chunk(doc)
    logger.info(f"Produced {len(chunks)} semantic chunks")
    return chunks

def _get_cached_chroma(collection_name: str, path: str, persistent_client: bool, **kwargs) -> ChromaDb:
    key = f"{os.path.abspath(path)}::{collection_name}::{persistent_client}"
    if key in _CHROMA_CACHE:
        return _CHROMA_CACHE[key]

    chroma = ChromaDb(collection=collection_name, embedder=EMBEDDER, persistent_client=persistent_client, path=path, **kwargs)
    chroma.create() 

    def vector_search(query: str, limit: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[Document]:
        """Vector search wrapper that queries only this chroma collection and returns Documents."""
        embedder_to_use = getattr(chroma, "embedder", EMBEDDER)

        q_emb = embedder_to_use.get_embedding(query)
        if q_emb is None:
            logger.error("Failed to get embedding for query")
            return []

        collection = getattr(chroma, "_collection", None)
        if collection is None:
            collection = chroma.client.get_collection(name=collection_name)
            chroma._collection = collection

        query_args = {
            "query_embeddings": [q_emb],
            "n_results": limit,
            "include": ["metadatas", "documents","distances"],
        }
        if filters:
            query_args["where"] = filters

        try:
            result = collection.query(**query_args)
        except Exception as e:
            logger.error(f"Chroma query failed: {e}")
            return []

        ids = result.get("ids", [[]])[0]
        metadatas = result.get("metadatas", [[]])[0]
        documents = result.get("documents", [[]])[0]
        distances = result.get("distances", [[]])[0] if result.get("distances") else []

        results: List[Document] = []
        for idx, doc_id in enumerate(ids):
            meta = metadatas[idx] if idx < len(metadatas) else {}
            content = documents[idx] if idx < len(documents) else ""
            if idx < len(distances):
                try:
                    meta = dict(meta)
                    meta["distance"] = distances[idx]
                except Exception:
                    pass
            results.append(Document(id=doc_id, meta_data=meta, content=content))
        return results

    chroma.vector_search = vector_search

    _CHROMA_CACHE[key] = chroma
    return chroma

def save_chunks_to_chroma(
    chunks: List[Document],
    collection_name: str = "medical_documents",
    embedder_instance: Optional[AnyType] = None,
    upsert: bool = True,
    persistent_client: bool = True,
    path: str = "chromadb",  #might need to change this based on user
    **chroma_kwargs,
) -> int:
    if not chunks:
        logger.info("No chunks to store")
        return 0

    chroma = _get_cached_chroma(collection_name=collection_name, path=path, persistent_client=persistent_client, **chroma_kwargs)

    try:
        if upsert and chroma.upsert_available():
            chroma.upsert(chunks)
            logger.info(f"Upserted {len(chunks)} chunks into Chroma collection '{collection_name}'")
        else:
            chroma.insert(chunks)
            logger.info(f"Inserted {len(chunks)} chunks into Chroma collection '{collection_name}'")
    except Exception as e:
        logger.error(f"Failed to save chunks to Chroma: {e}")
        raise

    return len(chunks)

def search(query:str,document_path:str,collection_name: str = "medical_documents",path: str = "chromadb",persistent_client: bool = True,**chroma_kwargs):
    try:
        chroma = _get_cached_chroma(collection_name=collection_name, path=path, persistent_client=persistent_client, **chroma_kwargs)

        results = chroma.vector_search(query=query,filters={"path":str(document_path)})
        return results

    except Exception as e:
        logger.error(f"Failed to perform vector search: {e}")
        raise 

if __name__ == "__main__":
    # sample_file = "D:/ChronoCare/LabRecord.pdf"
    # meta_data = {'decription': 'The lipid panel shows mildly elevated total cholesterol (210 mg/dL) and triglycerides (160 mg/dL). Recommend lifestyle modification and follow-up.', 'parts_mentioned': ['heart']}

    # sample_file = "D:/ChronoCare/ImagingRecord.pdf"
    # meta_data = {'decription': 'MRI of the right shoulder shows a partial-thickness articular surface tear of the supraspinatus tendon with associated tendinosis, mild biceps tendinosis, and mild degenerative changes of the acromioclavicular joint.', 'parts_mentioned': ['shoulder']}
    rag = search(query="What was the patient's cholestrol level?",document_path="D:/ChronoCare/LabRecord.pdf")    
    # rag = search(query="Did the patient have a blow in his shoulder anytime?",document_path="D:/ChronoCare/ImagingRecord.pdf")
    print(rag)
    # logger.info(f"Stored {stored} chunks to Chroma collection 'medical_documents'")
    # logger.info(f"Total pipeline took {time.perf_counter()-start:.2f}s")

