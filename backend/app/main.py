from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.security import require_auth
from app.database.mongodb import close_mongodb, connect_mongodb
from app.database.qdrant import close_qdrant, connect_qdrant
from app.routes import auth, chat, conversations, documents, settings
from app.services.embedding_service import EmbeddingService
from app.services.llm_service import LLMService
from app.services.rag_service import RAGService


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_mongodb()
    await connect_qdrant()
    rag = RAGService(EmbeddingService(get_settings().embedding_model), LLMService())
    documents.set_rag_service(rag)
    chat.set_rag_service(rag)
    yield
    await close_qdrant()
    await close_mongodb()


app = FastAPI(title="Syllabix API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=[get_settings().frontend_url], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Public endpoints (Auth & Health)
app.include_router(auth.router)

# Protected endpoints (Require valid PIN session)
app.include_router(documents.router, dependencies=[Depends(require_auth)])
app.include_router(chat.router, dependencies=[Depends(require_auth)])
app.include_router(conversations.router, dependencies=[Depends(require_auth)])
app.include_router(settings.router, dependencies=[Depends(require_auth)])



@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok"}
