from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock
import httpx
import pytest

from app.services.llm_service import (
    LLMConfigurationError,
    LLMContentFilterError,
    LLMEmptyResponseError,
    LLMModelNotFoundError,
    LLMQuotaExceededError,
    LLMService,
    LLMServiceUnavailableError,
    LLMTimeoutError,
)
from groq import (
    AuthenticationError,
    InternalServerError,
    NotFoundError,
    RateLimitError,
)


def make_mock_groq_response(content: str, finish_reason: str = "stop") -> SimpleNamespace:
    return SimpleNamespace(
        id="chatcmpl-test-123",
        choices=[
            SimpleNamespace(
                finish_reason=finish_reason,
                index=0,
                message=SimpleNamespace(
                    role="assistant",
                    content=content,
                ),
            )
        ],
        model="openai/gpt-oss-120b",
        object="chat.completion",
    )


@pytest.mark.asyncio
async def test_question_type_1_define_internet():
    """TEST: Definition question - Direct, precise definition without filler."""
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(
        return_value=make_mock_groq_response(
            "The Internet is a global system of interconnected computer networks that uses the standard Internet Protocol Suite (TCP/IP) to link billions of devices worldwide.\n\n"
            "It enables the transmission and exchange of data, services, and applications such as the World Wide Web, email, and file sharing.\n\n"
            "Source: Computer_Networks_Unit1.pdf, Page 4"
        )
    )

    service = LLMService(client=mock_client)
    answer, additional = await service.answer(
        question="Define the Internet.",
        context="Source: Computer_Networks_Unit1.pdf, Page 4\nThe Internet is a global network of interconnected computers communicating via TCP/IP.",
        history="",
        mode="Strict Syllabus",
        detail="concise",
    )

    assert "global system of interconnected computer networks" in answer or "Internet" in answer
    assert additional is None
    assert "chunk_id" not in answer
    assert "Source: Computer_Networks_Unit1.pdf, Page 4" in answer

    # Verify system instruction contains academic tutor guidelines
    call_kwargs = mock_client.chat.completions.create.call_args.kwargs
    system_prompt = call_kwargs["messages"][0]["content"]
    assert "Definition questions" in system_prompt
    assert "DO NOT use filler intros" in system_prompt


@pytest.mark.asyncio
async def test_question_type_2_four_characteristics():
    """TEST: Short structured question - 4 fundamental characteristics."""
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(
        return_value=make_mock_groq_response(
            "### Four Fundamental Characteristics of Data Communication\n\n"
            "Data communication systems depend on four fundamental characteristics:\n\n"
            "1. **Delivery:** The system must deliver data to the correct destination.\n"
            "2. **Accuracy:** The system must deliver data accurately without alteration.\n"
            "3. **Timeliness:** The system must deliver data in a timely manner without significant delays.\n"
            "4. **Jitter:** Jitter refers to the variation in packet arrival time and must be minimized.\n\n"
            "Source: Data_Communications_Forouzan.pdf, Page 6"
        )
    )

    service = LLMService(client=mock_client)
    answer, additional = await service.answer(
        question="Explain the four fundamental characteristics of data communication.",
        context="Source: Data_Communications_Forouzan.pdf, Page 6\nFour characteristics: Delivery, Accuracy, Timeliness, Jitter.",
        history="",
        mode="Strict Syllabus",
        detail="balanced",
    )

    assert "Delivery" in answer and "Accuracy" in answer and "Timeliness" in answer and "Jitter" in answer
    assert "chunk_id" not in answer
    assert additional is None


@pytest.mark.asyncio
async def test_question_type_3_osi_model():
    """TEST: Concept explanation - OSI 7-layer architecture."""
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(
        return_value=make_mock_groq_response(
            "### The OSI Reference Model\n\n"
            "The Open Systems Interconnection (OSI) model is a conceptual framework that standardizes network communication functions across seven distinct layers:\n\n"
            "1. **Physical Layer:** Transmits raw bit streams over a physical transmission medium.\n"
            "2. **Data Link Layer:** Handles node-to-node data transfer and frame synchronization (MAC, framing, error control).\n"
            "3. **Network Layer:** Manages routing and logical packet addressing (IP, routers).\n"
            "4. **Transport Layer:** Provides reliable host-to-host packet delivery and flow control (TCP, UDP).\n"
            "5. **Session Layer:** Establishes, manages, and terminates presentation sessions between applications.\n"
            "6. **Presentation Layer:** Translates, encrypts, and compresses data formats (syntax and semantics).\n"
            "7. **Application Layer:** Interfaces directly with end-user software applications (HTTP, DNS, SMTP).\n\n"
            "Source: Computer_Networks_Tanenbaum.pdf, Page 42"
        )
    )

    service = LLMService(client=mock_client)
    answer, _ = await service.answer(
        question="Explain the OSI model.",
        context="Source: Computer_Networks_Tanenbaum.pdf, Page 42\nOSI Model consists of 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.",
        history="",
        mode="Syllabus + AI",
        detail="balanced",
    )

    assert "Physical Layer" in answer
    assert "Application Layer" in answer
    assert "chunk_id" not in answer


@pytest.mark.asyncio
async def test_question_type_4_tcp_vs_udp_comparison_table():
    """TEST: Difference/comparison question - Structured Markdown table."""
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(
        return_value=make_mock_groq_response(
            "### Comparison between TCP and UDP\n\n"
            "| Feature / Aspect | TCP (Transmission Control Protocol) | UDP (User Datagram Protocol) |\n"
            "| :--- | :--- | :--- |\n"
            "| **Connection Type** | Connection-oriented (Three-way handshake) | Connectionless |\n"
            "| **Reliability** | Guaranteed delivery with acknowledgments | Best-effort, no guarantee |\n"
            "| **Speed / Overhead** | Slower due to error and flow control | Faster with minimal header overhead |\n"
            "| **Packet Order** | Packets delivered in order | Packets may arrive out of order |\n"
            "| **Applications** | HTTP, HTTPS, FTP, SSH, SMTP | DNS, VoIP, Video Streaming, Gaming |\n\n"
            "Source: Computer_Networks_Unit3.pdf, Page 115"
        )
    )

    service = LLMService(client=mock_client)
    answer, _ = await service.answer(
        question="Differentiate between TCP and UDP.",
        context="Source: Computer_Networks_Unit3.pdf, Page 115\nTCP is connection-oriented, reliable. UDP is connectionless, fast.",
        history="",
        mode="Strict Syllabus",
        detail="balanced",
    )

    assert "| Feature / Aspect |" in answer or "| Connection Type |" in answer
    assert "Connection-oriented" in answer
    assert "Connectionless" in answer
    assert "chunk_id" not in answer


@pytest.mark.asyncio
async def test_question_type_5_list_advantages():
    """TEST: List question - Numbered points with brief explanations."""
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(
        return_value=make_mock_groq_response(
            "### Advantages of Computer Networks\n\n"
            "1. **Resource Sharing:** Hardware (such as printers and storage) and software resources can be shared across multiple devices.\n"
            "2. **Cost Efficiency:** Shared peripherals and centralized software licenses reduce organizational capital expenses.\n"
            "3. **High Reliability:** Alternate data routing paths and redundant storage ensure continuous availability if one node fails.\n"
            "4. **Fast Communication:** Instantaneous data and file transfers via email, messaging, and web applications.\n"
            "5. **Centralized Data Management:** Databases and security policies can be administered from a central server.\n\n"
            "Source: Introduction_To_Networking.pdf, Page 12"
        )
    )

    service = LLMService(client=mock_client)
    answer, _ = await service.answer(
        question="List the advantages of computer networks.",
        context="Source: Introduction_To_Networking.pdf, Page 12\nAdvantages include resource sharing, cost reduction, reliability, communication.",
        history="",
        mode="Strict Syllabus",
        detail="balanced",
    )

    assert "Resource Sharing" in answer
    assert "Cost Efficiency" in answer
    assert "chunk_id" not in answer


@pytest.mark.asyncio
async def test_question_type_6_ten_mark_exam_answer():
    """TEST: 10-mark comprehensive answer with intro, structured sections, and conclusion."""
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(
        return_value=make_mock_groq_response(
            "### Database Normalization (10 Marks)\n\n"
            "Database normalization is a systematic technique of organizing relational database tables to reduce data redundancy and eliminate anomalies.\n\n"
            "#### 1. First Normal Form (1NF)\n"
            "- Each column must contain only atomic (indivisible) values.\n"
            "- No repeating groups or arrays allowed.\n\n"
            "#### 2. Second Normal Form (2NF)\n"
            "- Must be in 1NF.\n"
            "- All non-key attributes must be fully functionally dependent on the entire primary key (no partial dependencies).\n\n"
            "#### 3. Third Normal Form (3NF)\n"
            "- Must be in 2NF.\n"
            "- No transitive dependencies: non-key attributes cannot depend on other non-key attributes.\n\n"
            "#### Advantages of Normalization\n"
            "- Prevents insertion, update, and deletion anomalies.\n"
            "- Minimizes duplicate data storage.\n\n"
            "#### Conclusion\n"
            "Normalization achieves clean data integrity, with 3NF/BCNF typically providing the ideal balance for transactional systems.\n\n"
            "Source: DBMS_Korth_Unit2.pdf, Page 85"
        )
    )

    service = LLMService(client=mock_client)
    answer, _ = await service.answer(
        question="Explain database normalization as a 10-mark answer.",
        context="Source: DBMS_Korth_Unit2.pdf, Page 85\nNormalization rules: 1NF atomic values, 2NF no partial dependency, 3NF no transitive dependency.",
        history="",
        mode="Strict Syllabus",
        detail="deep",
    )

    assert "First Normal Form" in answer
    assert "Second Normal Form" in answer
    assert "Third Normal Form" in answer
    assert "Conclusion" in answer


@pytest.mark.asyncio
async def test_question_type_7_insufficient_context_refusal():
    """TEST: Strict Syllabus refusal when requested topic is not in uploaded materials."""
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(
        return_value=make_mock_groq_response(
            "The provided syllabus materials contain insufficient information to answer this question. "
            "The retrieved course materials only discuss Database Management Systems and Relational Algebra, "
            "and do not cover Quantum Entanglement or Quantum Computing principles."
        )
    )

    service = LLMService(client=mock_client)
    answer, additional = await service.answer(
        question="Explain the principle of Quantum Entanglement.",
        context="Source: DBMS_Notes.pdf, Page 1\nRelational algebra operators include select, project, union, set difference, Cartesian product.",
        history="",
        mode="Strict Syllabus",
        detail="balanced",
    )

    assert "insufficient information" in answer.lower()
    assert additional is None


@pytest.mark.asyncio
async def test_syllabus_plus_ai_mode_separation():
    """TEST: Syllabus + AI separates document facts from supplementary knowledge."""
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(
        return_value=make_mock_groq_response(
            "Binary search requires a sorted collection and repeatedly divides the search interval in half. Its time complexity is O(log n).\n\n"
            "Source: DSA_Module2.pdf, Page 34\n\n"
            "### Additional AI Knowledge\n"
            "In modern operating systems and file systems, B-tree indexes leverage generalized multi-way binary search concepts to minimize costly disk block I/O operations."
        )
    )

    service = LLMService(client=mock_client)
    answer, additional = await service.answer(
        question="What is binary search and what is its time complexity?",
        context="Source: DSA_Module2.pdf, Page 34\nBinary search works on sorted arrays. Time complexity is O(log n).",
        history="",
        mode="Syllabus + AI",
        detail="balanced",
    )

    assert "O(log n)" in answer
    assert "### Additional AI Knowledge" not in answer
    assert additional is not None
    assert "B-tree" in additional


@pytest.mark.asyncio
async def test_error_handling_authentication_failure():
    """TEST: Groq authentication failure raises LLMConfigurationError."""
    mock_client = MagicMock()
    mock_response = httpx.Response(401, request=httpx.Request("POST", "https://api.groq.com"))
    mock_client.chat.completions.create = AsyncMock(
        side_effect=AuthenticationError("Invalid API key provided", response=mock_response, body=None)
    )

    service = LLMService(client=mock_client)
    with pytest.raises(LLMConfigurationError) as exc_info:
        await service.answer("Test", "Context", "", "Strict Syllabus", "balanced")

    assert "authentication failed" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_error_handling_rate_limit():
    """TEST: Groq rate limit (429) retries and raises LLMQuotaExceededError."""
    mock_client = MagicMock()
    mock_response = httpx.Response(429, request=httpx.Request("POST", "https://api.groq.com"))
    mock_client.chat.completions.create = AsyncMock(
        side_effect=RateLimitError("Rate limit exceeded", response=mock_response, body=None)
    )

    service = LLMService(client=mock_client, max_retries=1)
    with pytest.raises(LLMQuotaExceededError) as exc_info:
        await service.answer("Test", "Context", "", "Strict Syllabus", "balanced")

    assert "rate limit exceeded" in str(exc_info.value).lower()
    assert mock_client.chat.completions.create.await_count == 2


@pytest.mark.asyncio
async def test_error_handling_timeout():
    """TEST: Request timeout raises LLMTimeoutError."""
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(
        side_effect=httpx.ReadTimeout("Connection timed out")
    )

    service = LLMService(client=mock_client, timeout_seconds=5.0, max_retries=1)
    with pytest.raises(LLMTimeoutError) as exc_info:
        await service.answer("Test", "Context", "", "Strict Syllabus", "balanced")

    assert "timed out" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_chunk_id_leak_prevention():
    """TEST: Any accidental chunk_id metadata in model output is stripped cleanly."""
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(
        return_value=make_mock_groq_response(
            "DNS translates human-friendly domain names to numerical IP addresses. [chunk_id=72d4daef743c4368898099e9074ee9fc]\n\n"
            "Source: Computer_Networks.pdf, Page 15 | chunk_id=abc12345"
        )
    )

    service = LLMService(client=mock_client)
    answer, _ = await service.answer(
        question="What is DNS?",
        context="Source: Computer_Networks.pdf, Page 15\nDNS translates domain names to IP addresses.",
        history="",
        mode="Strict Syllabus",
        detail="balanced",
    )

    assert "chunk_id" not in answer
    assert "DNS translates human-friendly domain names" in answer
    assert "Source: Computer_Networks.pdf, Page 15" in answer
