import sys
from unittest.mock import MagicMock, patch

import pytest

from app.services.embedding_service import EmbeddingService


def test_embedding_dimension_is_validated():
    mock_model = MagicMock()
    mock_model.get_sentence_embedding_dimension.return_value = 384
    mock_model.encode.return_value = MagicMock(
        tolist=lambda: [[0.1] * 384],
    )
    mock_st_module = MagicMock()
    mock_st_module.SentenceTransformer.return_value = mock_model

    with patch.dict(sys.modules, {"sentence_transformers": mock_st_module}):
        service = EmbeddingService("sentence-transformers/all-MiniLM-L6-v2")
        vectors = service.encode(["a syllabus question"])

    assert len(vectors) == 1
    assert len(vectors[0]) == 384


def test_embedding_dimension_mismatch_fails_fast():
    mock_model = MagicMock()
    mock_model.get_sentence_embedding_dimension.return_value = 768
    mock_st_module = MagicMock()
    mock_st_module.SentenceTransformer.return_value = mock_model

    with patch.dict(sys.modules, {"sentence_transformers": mock_st_module}):
        with pytest.raises(ValueError, match="does not match expected"):
            EmbeddingService("wrong-dimension-model")
