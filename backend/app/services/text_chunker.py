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


def _split_into_sentences_or_items(text: str) -> list[str]:
    """Split text into sentences, bullet points, or numbered list items."""
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    elements: list[str] = []
    for line in lines:
        if re.match(r"^(•|-|\*|·|\d+[\.)])\s+", line):
            elements.append(line)
        else:
            sentences = re.split(r"(?<=[.!?])\s+", line)
            for s in sentences:
                s_clean = s.strip()
                if s_clean:
                    elements.append(s_clean)
    return elements


def chunk_blocks(blocks: list[ExtractedBlock], size: int, overlap: int) -> list[Chunk]:
    """Structure-aware chunker that:
    1. Consolidates content sharing the same section heading up to the token/word budget.
    2. Respects sentence, bullet, and list-item boundaries.
    3. Handles word-level fallback when text lacks punctuation or when an element exceeds budget.
    4. Maintains metadata (page_number, slide_number, section_heading, index, chunk_id).
    """
    if not blocks:
        return []

    # Merge consecutive blocks that share the same section_heading if they fit within budget
    merged_blocks: list[dict] = []
    for b in blocks:
        if (
            merged_blocks
            and b.get("section_heading") is not None
            and b.get("section_heading") == merged_blocks[-1].get("section_heading")
            and len(merged_blocks[-1]["text"].split()) + len(b["text"].split()) <= size
        ):
            merged_blocks[-1]["text"] = f"{merged_blocks[-1]['text']}\n{b['text']}"
        else:
            merged_blocks.append(dict(b))

    chunks: list[Chunk] = []
    step = max(1, size - overlap)

    for block in merged_blocks:
        text = block["text"]
        heading = block.get("section_heading")
        page_num = block.get("page_number")
        slide_num = block.get("slide_number")

        elements = _split_into_sentences_or_items(text)
        has_structure = any(
            re.search(r"[.!?]$", el) or re.match(r"^(•|-|\*|·|\d+[\.)])\s+", el)
            for el in elements
        )

        # Fallback to word-level chunking when text lacks sentence punctuation
        if not has_structure and len(text.split()) > size:
            words = text.split()
            w_start = 0
            while w_start < len(words):
                w_end = min(w_start + size, len(words))
                chunks.append(Chunk(
                    text=" ".join(words[w_start:w_end]),
                    page_number=page_num,
                    slide_number=slide_num,
                    section_heading=heading,
                    index=len(chunks),
                    chunk_id=uuid4().hex,
                ))
                if w_end >= len(words):
                    break
                w_start += step
            continue

        # Sentence/Item-aware chunking
        start_el = 0
        while start_el < len(elements):
            accum_words = 0
            end_el = start_el
            while end_el < len(elements):
                el_words = len(elements[end_el].split())
                if accum_words + el_words > size and end_el > start_el:
                    break
                accum_words += el_words
                end_el += 1

            selected = elements[start_el:end_el]
            if not selected:
                break

            chunk_body = (
                " ".join(selected)
                if all(not el.startswith(("•", "-", "*", "·")) for el in selected)
                else "\n".join(selected)
            )

            chunks.append(Chunk(
                text=chunk_body,
                page_number=page_num,
                slide_number=slide_num,
                section_heading=heading,
                index=len(chunks),
                chunk_id=uuid4().hex,
            ))

            if end_el >= len(elements):
                break

            back_words = 0
            back_idx = end_el
            while back_idx > start_el + 1:
                back_words += len(elements[back_idx - 1].split())
                if back_words >= overlap:
                    break
                back_idx -= 1
            next_start = back_idx if back_idx < end_el else end_el
            start_el = max(start_el + 1, next_start)

    return chunks
