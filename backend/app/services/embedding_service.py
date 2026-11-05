import logging
import os
import sys
from typing import Any

logger = logging.getLogger(__name__)

os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"


class EmbeddingService:
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2", expected_dimension: int = 384):
        self.model_name = model_name
        self.expected_dimension = expected_dimension
        self._st_model: Any = None
        self._hf_tokenizer: Any = None
        self._hf_model: Any = None
        self.dimension = expected_dimension

        # Check if sentence_transformers is already explicitly mocked in tests
        if "sentence_transformers" in sys.modules:
            try:
                from sentence_transformers import SentenceTransformer

                self._st_model = SentenceTransformer(model_name)
                self.dimension = self._st_model.get_sentence_embedding_dimension()
                logger.info("Initialized EmbeddingService using mocked SentenceTransformer (%s, dim=%d)", model_name, self.dimension)
            except Exception as exc:
                logger.debug("SentenceTransformer mock load skipped: %s", exc)

        if self._st_model is None:
            # Native HuggingFace AutoModel (robust, direct, exact same weights and 384-d normalized vectors)
            import torch
            from transformers import AutoModel, AutoTokenizer

            try:
                self._hf_tokenizer = AutoTokenizer.from_pretrained(model_name, local_files_only=True)
                self._hf_model = AutoModel.from_pretrained(model_name, local_files_only=True)
            except Exception:
                self._hf_tokenizer = AutoTokenizer.from_pretrained(model_name)
                self._hf_model = AutoModel.from_pretrained(model_name)
            self._hf_model.eval()
            self.dimension = self._hf_model.config.hidden_size
            logger.info("Initialized EmbeddingService using HuggingFace AutoModel (%s, dim=%d)", model_name, self.dimension)

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
        if self._st_model is not None:
            embeddings = self._st_model.encode(texts, normalize_embeddings=True).tolist()
        else:
            import torch

            all_embeddings = []
            batch_size = 32
            for i in range(0, len(texts), batch_size):
                batch_texts = texts[i : i + batch_size]
                inputs = self._hf_tokenizer(
                    batch_texts,
                    padding=True,
                    truncation=True,
                    max_length=512,
                    return_tensors="pt",
                )
                with torch.no_grad():
                    out = self._hf_model(**inputs)
                    mask = inputs["attention_mask"].unsqueeze(-1).expand(out.last_hidden_state.size()).float()
                    sum_emb = torch.sum(out.last_hidden_state * mask, dim=1)
                    sum_mask = torch.clamp(mask.sum(dim=1), min=1e-9)
                    mean_emb = sum_emb / sum_mask
                    norm_emb = torch.nn.functional.normalize(mean_emb, p=2, dim=1)
                    all_embeddings.extend(norm_emb.tolist())
            embeddings = all_embeddings

        if any(len(embedding) != self.dimension for embedding in embeddings):
            raise ValueError(f"Embedding output dimension does not match expected {self.dimension}.")
        logger.info(
            "embedding_generation_completed",
            extra={"stage": "embedding_generation", "text_count": len(texts)},
        )
        return embeddings
