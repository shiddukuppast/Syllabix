from dataclasses import dataclass, field
import re
from uuid import uuid4

from app.services.document_processor import ExtractedBlock


@dataclass
class Chunk:
    text: str
    page_number: int | None
    slide_number: int | None
    section_heading: str | None
    index: int
    chunk_id: str = field(default_factory=lambda: uuid4().hex)


def chunk_blocks(blocks: list[ExtractedBlock], size: int, overlap: int) -> list[Chunk]:
    step = max(1, size - overlap)
    chunks: list[Chunk] = []
    for block in blocks:
        words = block["text"].split()
        start = 0
        while start < len(words):
            limit = min(start + size, len(words))
            end = limit
            if limit < len(words):
                sentence_end = max(
                    (
                        index + 1
                        for index in range(start, limit)
                        if re.search(r"[.!?]$", words[index])
                    ),
                    default=start,
                )
                if sentence_end > start:
                    end = sentence_end
            selected = words[start:end]
            if not selected:
                break
            chunks.append(Chunk(
                text=" ".join(selected),
                page_number=block["page_number"],
                slide_number=block["slide_number"],
                section_heading=block["section_heading"],
                index=len(chunks),
                chunk_id=uuid4().hex,
            ))
            if end >= len(words):
                break
            start = max(start + 1, end - overlap)
    return chunks
