# Syllabix Backend

The backend is a high-performance FastAPI service with MongoDB conversation and document metadata persistence, Qdrant vector storage, Sentence Transformers local embeddings, and an asynchronous Groq LLM adapter.

## Architecture

- **LLM Integration**: Groq API via the official Python SDK (`groq`).
- **Default Model**: `openai/gpt-oss-120b` (configurable via `GROQ_MODEL`).
- **Vector Search**: Qdrant vector database (`qdrant-client`).
- **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense vectors, fully preserved).
- **Document Processing**: PyMuPDF (PDF), python-docx (DOCX), python-pptx (PPTX).
- **Metadata & Persistence**: MongoDB database (`pymongo`).

## Quickstart

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

## Groq API Configuration

Set your Groq credentials in `.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

Obtain an API key from [Groq Console](https://console.groq.com/).

### Model Details

- **`openai/gpt-oss-120b` (Default)**: High-performance open-source model hosted on Groq LPU inference engine for ultra-fast response generation in academic RAG workflows.

If rate limits or provider-side issues occur, the service handles HTTP 429 and transient 5xx errors with exponential backoff on retries.

## Answering Modes

1. **Strict Syllabus Mode**: Answers exclusively from the retrieved document chunks. Refuses to hallucinate external facts when document context is insufficient.
2. **Syllabus + AI Mode**: Answers from syllabus documents first, and appends general academic knowledge under a dedicated `### Additional AI Knowledge` section.

## API Endpoints

- `GET /api/health`: Health status check.
- `POST /api/documents/upload`: Upload and index course materials (`.pdf`, `.docx`, `.pptx`).
- `GET /api/documents`: List indexed materials.
- `DELETE /api/documents/{id}`: Delete an indexed document and its vector points.
- `POST /api/chat`: Submit academic study questions with context retrieval and Groq response generation.
- `GET /api/conversations`: List user conversation history.
- `GET /api/conversations/{id}`: Retrieve a specific conversation with message history.
- `DELETE /api/conversations/{id}`: Delete a conversation.
- `GET /api/settings` & `PATCH /api/settings`: Get and update user study settings.
