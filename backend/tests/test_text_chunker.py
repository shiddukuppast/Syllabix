from app.services.text_chunker import chunk_blocks


def test_chunking_preserves_source_metadata_and_overlap():
    blocks = [
        {
            "text": "one two three four five six seven eight",
            "page_number": 3,
            "slide_number": None,
            "section_heading": "Overview",
        }
    ]

    chunks = chunk_blocks(blocks, size=5, overlap=2)

    assert [chunk.text for chunk in chunks] == [
        "one two three four five",
        "four five six seven eight",
    ]
    assert all(chunk.page_number == 3 for chunk in chunks)
    assert all(chunk.section_heading == "Overview" for chunk in chunks)

