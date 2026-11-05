import logging
import re
from pathlib import Path
from typing import TypedDict

logger = logging.getLogger(__name__)


class ExtractedBlock(TypedDict):
    text: str
    page_number: int | None
    slide_number: int | None
    section_heading: str | None


def _clean(text: str) -> str:
    """Normalize excess horizontal whitespace and consecutive blank lines."""
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _is_header_or_footer(text: str, y0: float, y1: float, page_height: float) -> bool:
    """Detect repetitive running headers (top margin) and footers (bottom margin)."""
    t = text.strip()
    if not t:
        return True
    is_top_margin = y1 < page_height * 0.10
    is_bottom_margin = y0 > page_height * 0.88
    if is_top_margin or is_bottom_margin:
        if re.search(r"(university|college|school of|department of|page\s*\d+|\b\d+$)", t, re.IGNORECASE):
            return True
        if len(t) < 70 and not t.endswith((".", ":", ";")):
            return True
    return False


def _is_heading_line(text: str) -> bool:
    """Detect section headings and major topic titles."""
    line = text.strip()
    if not (2 <= len(line) <= 80):
        return False
    if line.endswith((".", ":", ";", ",", "?", "!")):
        return False
    if line.startswith(("•", "-", "*", "—", "·")):
        return False
    if re.search(r"(university|college|school of|department of)", line, re.IGNORECASE):
        return False
    if re.match(r"^(\d+(\.\d+)*)\s+[A-Z]", line):
        return True
    if re.match(r"^(UNIT|MODULE|CHAPTER|PART)\s*[-:]?\s*(\d+|[IVXLCDM]+)", line, re.IGNORECASE):
        return True
    words = [
        w for w in re.findall(r"[a-zA-Z]+", line)
        if w.lower() not in {"of", "and", "in", "to", "for", "the", "a", "an", "on", "with", "at", "by", "from", "as"}
    ]
    if len(words) >= 1 and all(w[0].isupper() for w in words):
        return True
    return False


def extract_document(path: Path, file_type: str) -> tuple[list[ExtractedBlock], int]:
    blocks: list[ExtractedBlock] = []
    if file_type == "pdf":
        import fitz

        with fitz.open(path) as pdf:
            total_pages = len(pdf)
            current_heading: str | None = None
            accumulated_lines: list[str] = []
            block_start_page: int = 1

            for index, page in enumerate(pdf, 1):
                page_height = page.rect.height
                raw_blocks = page.get_text("blocks")
                content_blocks = [
                    b for b in raw_blocks
                    if not _is_header_or_footer(b[4], b[1], b[3], page_height)
                ]
                content_blocks.sort(key=lambda b: (round(b[1] / 8), b[0]))

                page_lines: list[str] = []
                for b in content_blocks:
                    for line in b[4].split("\n"):
                        clean_line = line.strip()
                        if clean_line:
                            page_lines.append(clean_line)

                line_idx = 0
                while line_idx < len(page_lines):
                    line = page_lines[line_idx]

                    if re.match(r"^\d+[\.)]$", line) and line_idx + 1 < len(page_lines):
                        line = f"{line} {page_lines[line_idx + 1]}"
                        line_idx += 1

                    if _is_heading_line(line):
                        if accumulated_lines:
                            text_block = _clean("\n".join(accumulated_lines))
                            if text_block:
                                blocks.append({
                                    "text": text_block,
                                    "page_number": block_start_page,
                                    "slide_number": None,
                                    "section_heading": current_heading,
                                })
                            accumulated_lines = []
                        current_heading = line
                        block_start_page = index
                    else:
                        if not accumulated_lines:
                            block_start_page = index
                        if accumulated_lines and not accumulated_lines[-1].endswith((".", ":", ";", "?", "!")):
                            if line and line[0].islower():
                                accumulated_lines[-1] = f"{accumulated_lines[-1]} {line}"
                                line_idx += 1
                                continue
                        accumulated_lines.append(line)

                    word_count = sum(len(l.split()) for l in accumulated_lines)
                    if word_count >= 250:
                        text_block = _clean("\n".join(accumulated_lines))
                        if text_block:
                            blocks.append({
                                "text": text_block,
                                "page_number": block_start_page,
                                "slide_number": None,
                                "section_heading": current_heading,
                            })
                        accumulated_lines = []
                        block_start_page = index

                    line_idx += 1

            if accumulated_lines:
                text_block = _clean("\n".join(accumulated_lines))
                if text_block:
                    blocks.append({
                        "text": text_block,
                        "page_number": block_start_page,
                        "slide_number": None,
                        "section_heading": current_heading,
                    })

            if not blocks:
                for index, page in enumerate(pdf, 1):
                    raw_text = _clean(page.get_text())
                    if raw_text:
                        blocks.append({
                            "text": raw_text,
                            "page_number": index,
                            "slide_number": None,
                            "section_heading": None,
                        })

            return blocks, total_pages

    if file_type == "docx":
        from docx import Document as DocxDocument

        document = DocxDocument(path)
        current_heading: str | None = None
        paragraphs: list[str] = []
        for paragraph in document.paragraphs:
            text = _clean(paragraph.text)
            if not text:
                continue
            if paragraph.style.name.lower().startswith("heading") or _is_heading_line(text):
                if paragraphs:
                    blocks.append({
                        "text": "\n".join(paragraphs),
                        "page_number": None,
                        "slide_number": None,
                        "section_heading": current_heading,
                    })
                    paragraphs = []
                current_heading = text
            else:
                paragraphs.append(text)
                if len(paragraphs) >= 6:
                    blocks.append({
                        "text": "\n".join(paragraphs),
                        "page_number": None,
                        "slide_number": None,
                        "section_heading": current_heading,
                    })
                    paragraphs = []
        for table in document.tables:
            rows = [" | ".join(_clean(cell.text) for cell in row.cells) for row in table.rows]
            paragraphs.append("\n".join(rows))
        if paragraphs:
            blocks.append({
                "text": "\n".join(paragraphs),
                "page_number": None,
                "slide_number": None,
                "section_heading": current_heading,
            })
        return blocks, len(blocks)

    if file_type == "pptx":
        from pptx import Presentation

        presentation = Presentation(path)
        for index, slide in enumerate(presentation.slides, 1):
            slide_title = None
            if hasattr(slide, "shapes") and slide.shapes.title and slide.shapes.title.text:
                slide_title = _clean(slide.shapes.title.text)
            text = _clean("\n".join(shape.text for shape in slide.shapes if hasattr(shape, "text")))
            if text:
                blocks.append({
                    "text": text,
                    "page_number": None,
                    "slide_number": index,
                    "section_heading": slide_title,
                })
        return blocks, len(presentation.slides)

    raise ValueError(f"Unsupported document type: {file_type}")
