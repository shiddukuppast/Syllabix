# Syllabix Backend

The backend is a high-performance FastAPI service with MongoDB conversation and document metadata persistence, Qdrant vector storage, Sentence Transformers local embeddings, and an asynchronous Google Gemini LLM adapter.

## Architecture

- **LLM Integration**: Google Gemini Developer API via the official modern Python SDK (`google-genai`).
- **Default Model**: `gemini-3.8-flash` (configurable via `GEMINI_MODEL`).
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

## Gemini API Configuration

Set your Gemini credentials in `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
```

Obtain an API key from [Google AI Studio](https://aistudio.google.com/).

### Model Details & Rate Limits (Free Tier)

- **`gemini-3.8-flash` (Default)**: Google's high-efficiency frontier flash model engineered for long-horizon reasoning, deep document processing, and low latency in academic RAG workflows.
  - Rate limits: 15 Requests Per Minute (RPM), 1,000,000 Tokens Per Minute (TPM), 1,500 Requests Per Day (RPD).

Rate limits are enforced at the Google Cloud/AI Studio project level. If limits are reached, the service returns HTTP 429 with exponential backoff on transient retries.

## Answering Modes

1. **Strict Syllabus Mode**: Answers exclusively from the retrieved document chunks. Refuses to hallucinate external facts when document context is insufficient.
2. **Syllabus + AI Mode**: Answers from syllabus documents first, and appends general academic knowledge under a dedicated `### Additional AI Knowledge` section.

## API Endpoints

- `GET /api/health`: Health status check.
- `POST /api/documents/upload`: Upload and index course materials (`.pdf`, `.docx`, `.pptx`).
- `GET /api/documents`: List indexed materials.
- `DELETE /api/documents/{id}`: Delete an indexed document and its vector points.
- `POST /api/chat`: Submit academic study questions with context retrieval and Gemini response generation.
- `GET /api/conversations`: List user conversation history.
- `GET /api/conversations/{id}`: Retrieve a specific conversation with message history.
- `DELETE /api/conversations/{id}`: Delete a conversation.
- `GET /api/settings` & `PATCH /api/settings`: Get and update user study settings.
