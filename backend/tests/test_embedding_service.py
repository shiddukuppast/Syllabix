from unittest.mock import MagicMock, patch

import pytest

from app.services.embedding_service import EmbeddingService


def test_embedding_dimension_is_validated():
    model = MagicMock()
    model.get_sentence_embedding_dimension.return_value = 384
    model.encode.return_value = MagicMock(
        tolist=lambda: [[0.1] * 384],
    )

    with patch("sentence_transformers.SentenceTransformer", return_value=model):
        service = EmbeddingService("sentence-transformers/all-MiniLM-L6-v2")

    vectors = service.encode(["a syllabus question"])

    assert len(vectors) == 1
    assert len(vectors[0]) == 384


def test_embedding_dimension_mismatch_fails_fast():
    model = MagicMock()
    model.get_sentence_embedding_dimension.return_value = 768

    with patch("sentence_transformers.SentenceTransformer", return_value=model):
        with pytest.raises(ValueError, match="does not match expected"):
            EmbeddingService("wrong-dimension-model")
