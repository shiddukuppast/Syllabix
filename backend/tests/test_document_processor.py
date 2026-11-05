from pathlib import Path

import fitz
from docx import Document
from pptx import Presentation
from pptx.util import Inches

from app.services.document_processor import extract_document
from app.services.text_chunker import chunk_blocks


def test_extract_pdf_preserves_page_numbers(tmp_path: Path):
    path = tmp_path / "notes.pdf"
    document = fitz.open()
    for page_number in (1, 2):
        page = document.new_page()
        page.insert_text((72, 72), f"Page {page_number} content.")
    document.save(path)
    document.close()

    blocks, page_count = extract_document(path, "pdf")

    assert page_count == 2
    assert [block["page_number"] for block in blocks] == [1, 2]


def test_extract_docx_preserves_heading_metadata(tmp_path: Path):
    path = tmp_path / "notes.docx"
    document = Document()
    document.add_heading("Module One", level=1)
    document.add_paragraph("This is the module content.")
    document.save(path)

    blocks, _ = extract_document(path, "docx")

    assert blocks[0]["section_heading"] == "Module One"
    assert "module content" in blocks[0]["text"]


def test_extract_pptx_preserves_slide_numbers(tmp_path: Path):
    path = tmp_path / "notes.pptx"
    presentation = Presentation()
    for index in (1, 2):
        slide = presentation.slides.add_slide(presentation.slide_layouts[6])
        box = slide.shapes.add_textbox(Inches(1), Inches(1), Inches(5), Inches(1))
        box.text = f"Slide {index} content."
    presentation.save(path)

    blocks, slide_count = extract_document(path, "pptx")

    assert slide_count == 2
    assert [block["slide_number"] for block in blocks] == [1, 2]


def test_chunking_respects_sentence_boundaries_and_unique_ids():
    blocks = [{
        "text": "First sentence ends here. Second sentence ends here. Third sentence ends here.",
        "page_number": 4,
        "slide_number": None,
        "section_heading": "Overview",
    }]

    chunks = chunk_blocks(blocks, size=5, overlap=1)

    assert all(chunk.page_number == 4 for chunk in chunks)
    assert len({chunk.chunk_id for chunk in chunks}) == len(chunks)
    assert all(not chunk.text.split()[-1].endswith("sentence") for chunk in chunks[:-1])
