import logging


logger = logging.getLogger(__name__)


class EmbeddingService:
    def __init__(self, model_name: str, expected_dimension: int = 384):
        from sentence_transformers import SentenceTransformer

        self.model = SentenceTransformer(model_name)
        self.dimension = self.model.get_sentence_embedding_dimension()
        if self.dimension != expected_dimension:
            raise ValueError(
                f"Embedding model dimension {self.dimension} does not match expected {expected_dimension}."
            )

    def encode(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        logger.info(
            "embedding_generation_started",
            extra={"stage": "embedding_generation", "text_count": len(texts)},
        )
        embeddings = self.model.encode(texts, normalize_embeddings=True).tolist()
        if any(len(embedding) != self.dimension for embedding in embeddings):
            raise ValueError(f"Embedding output dimension does not match expected {self.dimension}.")
        logger.info(
            "embedding_generation_completed",
            extra={"stage": "embedding_generation", "text_count": len(texts)},
        )
        return embeddings
