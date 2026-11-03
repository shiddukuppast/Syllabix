from dataclasses import dataclass

from app.services.document_processor import ExtractedBlock


@dataclass
class Chunk:
    text: str
    page_number: int | None
    slide_number: int | None
    section_heading: str | None
    index: int


def chunk_blocks(blocks: list[ExtractedBlock], size: int, overlap: int) -> list[Chunk]:
    words: list[tuple[str, ExtractedBlock]] = []
    for block in blocks:
        words.extend((word, block) for word in block["text"].split())
    if not words:
        return []
    step = max(1, size - overlap)
    chunks: list[Chunk] = []
    for start in range(0, len(words), step):
        selected = words[start : start + size]
        if not selected:
            break
        source = selected[0][1]
        chunks.append(Chunk(" ".join(word for word, _ in selected), source["page_number"], source["slide_number"], source["section_heading"], len(chunks)))
        if start + size >= len(words):
            break
    return chunks

