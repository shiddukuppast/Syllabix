import re
from pathlib import Path
from typing import TypedDict


class ExtractedBlock(TypedDict):
    text: str
    page_number: int | None
    slide_number: int | None
    section_heading: str | None


def _clean(text: str) -> str:
    return re.sub(r"[ \t]+", " ", re.sub(r"\n{3,}", "\n\n", text)).strip()


def extract_document(path: Path, file_type: str) -> tuple[list[ExtractedBlock], int]:
    blocks: list[ExtractedBlock] = []
    if file_type == "pdf":
        import fitz

        with fitz.open(path) as pdf:
            for index, page in enumerate(pdf, 1):
                text = _clean(page.get_text())
                if text:
                    blocks.append({"text": text, "page_number": index, "slide_number": None, "section_heading": None})
            return blocks, len(pdf)
    if file_type == "docx":
        from docx import Document as DocxDocument

        document = DocxDocument(path)
        current_heading: str | None = None
        paragraphs: list[str] = []
        for paragraph in document.paragraphs:
            text = _clean(paragraph.text)
            if not text:
                continue
            if paragraph.style.name.lower().startswith("heading"):
                current_heading = text
            else:
                paragraphs.append(text)
                if len(paragraphs) >= 8:
                    blocks.append({"text": "\n".join(paragraphs), "page_number": None, "slide_number": None, "section_heading": current_heading})
                    paragraphs = []
        for table in document.tables:
            rows = [" | ".join(_clean(cell.text) for cell in row.cells) for row in table.rows]
            paragraphs.append("\n".join(rows))
        if paragraphs:
            blocks.append({"text": "\n".join(paragraphs), "page_number": None, "slide_number": None, "section_heading": current_heading})
        return blocks, len(blocks)
    if file_type == "pptx":
        from pptx import Presentation

        presentation = Presentation(path)
        for index, slide in enumerate(presentation.slides, 1):
            text = _clean("\n".join(shape.text for shape in slide.shapes if hasattr(shape, "text")))
            if text:
                blocks.append({"text": text, "page_number": None, "slide_number": index, "section_heading": None})
        return blocks, len(presentation.slides)
    raise ValueError(f"Unsupported document type: {file_type}")
