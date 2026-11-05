import asyncio
import logging
import random
import re
from typing import Any

from groq import (
    APIConnectionError,
    APIError,
    APITimeoutError,
    AsyncGroq,
    AuthenticationError,
    BadRequestError,
    InternalServerError,
    NotFoundError,
    PermissionDeniedError,
    RateLimitError,
)
import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


# ==========================================
# Custom Exception Hierarchy
# ==========================================
class LLMError(Exception):
    """Base exception for all LLM service failures."""


class LLMConfigurationError(LLMError):
    """Raised when the Groq API key or configuration is missing or invalid."""


class LLMServiceUnavailableError(LLMError):
    """Raised when the Groq service is temporarily overloaded or unavailable (HTTP 500/502/503/504)."""


class LLMModelNotFoundError(LLMError):
    """Raised when the configured Groq model identifier is not found or unsupported."""


class LLMQuotaExceededError(LLMError):
    """Raised when API rate limits (RPM/TPM) or quotas are exceeded (HTTP 429)."""


class LLMTimeoutError(LLMError):
    """Raised when a request to Groq exceeds the configured timeout."""


class LLMContentFilterError(LLMError):
    """Raised when safety or moderation policies block the input prompt or generated response."""


class LLMEmptyResponseError(LLMError):
    """Raised when Groq returns an empty response without text content."""


class LLMAPIError(LLMError):
    """Raised when an unrecoverable Groq API or network error occurs."""


def _parse_retry_after(exc: Exception) -> float | None:
    resp = getattr(exc, "response", None)
    if resp is not None and hasattr(resp, "headers"):
        headers = resp.headers
        raw = headers.get("retry-after") or headers.get("Retry-After")
        if raw:
            try:
                val = float(raw)
                if val > 0:
                    return min(val, 20.0)
            except (ValueError, TypeError):
                pass
    return None


def _calculate_backoff(attempt: int, exc: Exception, base_delay: float = 1.5, max_delay: float = 12.0) -> float:
    retry_after = _parse_retry_after(exc)
    if retry_after is not None:
        jitter = random.uniform(0.1, 0.5)
        return retry_after + jitter
    # Exponential backoff with random jitter
    exp_delay = base_delay * (2 ** attempt)
    jitter = random.uniform(0.2, 0.8)
    return min(exp_delay + jitter, max_delay)


# ==========================================
# Groq LLM Service Implementation
# ==========================================
class LLMService:
    def __init__(
        self,
        client: AsyncGroq | None = None,
        model: str | None = None,
        temperature: float | None = None,
        max_completion_tokens: int | None = None,
        timeout_seconds: float | None = None,
        max_retries: int | None = None,
    ) -> None:
        settings = get_settings()
        self.model = model or settings.groq_model
        self.temperature = temperature if temperature is not None else settings.groq_temperature
        self.max_completion_tokens = (
            max_completion_tokens
            if max_completion_tokens is not None
            else settings.groq_max_completion_tokens
        )
        self.timeout_seconds = (
            timeout_seconds if timeout_seconds is not None else settings.groq_timeout_seconds
        )
        self.max_retries = max_retries if max_retries is not None else settings.groq_max_retries

        if client is not None:
            self.client = client
        elif settings.groq_api_key:
            self.client = AsyncGroq(
                api_key=settings.groq_api_key,
                timeout=self.timeout_seconds,
            )
        else:
            self.client = None

    def _build_system_instruction(self, mode: str, detail: str) -> str:
        return (
            "You are Syllabix, an intelligent university academic study assistant. "
            "Your primary responsibility is to help students understand academic concepts "
            "and prepare accurate, well-structured answers for university examinations.\n\n"
            "Use the provided academic context as your primary source. Understand the user's question, "
            "identify the expected answer depth, and generate a concise, clear, logically organized response. "
            "Your goal is not to produce the longest answer. Your goal is to provide the most useful answer "
            "with the right amount of detail.\n\n"
            f"Answering Mode: {mode}\n"
            f"Answer Detail Level: {detail}\n\n"
            "=== 1. ANSWER STYLE & TONE ===\n"
            "- Simple, direct, academically accurate, and grammatically correct.\n"
            "- Tailored for university semester examinations.\n"
            "- DO NOT use filler intros (e.g. 'Sure, here is the answer', 'Based on the provided documents'). Start immediately with the content or a relevant heading.\n"
            "- DO NOT repeat or rephrase the question.\n"
            "- Avoid excessive bolding or cluttering with too many headings.\n"
            "- DO NOT use emojis.\n"
            "- DO NOT include long, verbatim block quotations from the uploaded text; synthesize points in your own clear words.\n"
            "- NEVER expose internal technical details, chunk IDs, or vector identifiers.\n\n"
            "=== 2. ADAPT ANSWER LENGTH & STRUCTURE TO QUESTION TYPE ===\n"
            "- Definition questions: Provide a clear, precise definition, followed by 1–2 explanatory sentences if necessary.\n"
            "- Short-answer questions: Provide approximately 3–5 important points with concise explanations.\n"
            "- 5-mark questions: Provide a brief 1-2 sentence introduction, explain 4–6 relevant points with bold leads, and include an example where appropriate.\n"
            "- 10-mark questions: Provide a suitable introduction, explain core concepts with clear headings, include examples, advantages, diagrams in text/ASCII form if helpful, and a brief conclusion.\n"
            "- Difference / comparison questions: ALWAYS format as a clean Markdown comparison table with clear comparison criteria (e.g., | Feature / Aspect | Concept A | Concept B |).\n"
            "- List questions: Use numbered points with brief, informative explanations.\n"
            "- If the user specifies a mark allocation (e.g. '5 marks', '10 marks') or word limit, adapt the length and structure accordingly.\n\n"
            "=== 3. SOURCE GROUNDING & ACCURACY ===\n"
            "- Uploaded syllabus material is your primary source of truth. Preserve syllabus terminology and definitions accurately.\n"
            "- Do not invent facts, definitions, examples, or unsupported points.\n"
            "- Only include information supported by the retrieved context.\n"
            "- If the uploaded documents do not contain sufficient information to answer the question, clearly state:\n"
            "  'The provided syllabus materials do not contain sufficient information to answer this question.'\n"
            "  Explain what topics are present in the materials vs what is missing, without fabricating.\n\n"
            "=== 4. CITATION FORMATTING ===\n"
            "- Keep citations compact and clean in this exact format:\n"
            "  Source: <Document Name>, <Page/Slide Number>\n"
            "- Never expose chunk IDs, vector IDs, internal database hashes, or retrieval metadata.\n"
            "- Avoid inserting citations after every sentence; place them naturally at the end of the relevant section or at the end of the answer.\n\n"
            "=== 5. ANSWERING MODES ===\n"
            "- Strict Syllabus: Answer exclusively using the retrieved syllabus materials. Do not include external facts or ungrounded knowledge.\n"
            "- Syllabus + AI: Ground the main answer strictly in the syllabus documents first. If supplementary general knowledge adds value, place it under a clearly separated '### Additional AI Knowledge' section at the end."
        )

    def _extract_text(self, response: Any) -> str:
        if not response or not hasattr(response, "choices") or not response.choices:
            raise LLMEmptyResponseError("Groq returned an empty response with no choices.")

        choice = response.choices[0]
        finish_reason = getattr(choice, "finish_reason", None)
        if finish_reason and str(finish_reason).lower() in ("content_filter", "safety"):
            raise LLMContentFilterError(
                f"Response was filtered by Groq safety policy (reason: {finish_reason})"
            )

        message = getattr(choice, "message", None)
        content = getattr(message, "content", None) if message else None

        if not content or not content.strip():
            raise LLMEmptyResponseError("Groq returned an empty response.")

        return content.strip()

    async def _call_chat_completions(self, messages: list[dict[str, str]]) -> str:
        last_error: Exception | None = None
        for attempt in range(self.max_retries + 1):
            try:
                logger.info(
                    "Initiating Groq chat completion: model=%s, attempt=%d/%d, timeout=%.1fs",
                    self.model,
                    attempt + 1,
                    self.max_retries + 1,
                    self.timeout_seconds,
                )
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=self.temperature,
                    max_completion_tokens=self.max_completion_tokens,
                    timeout=self.timeout_seconds,
                )
                logger.info("Groq response received successfully for model=%s", self.model)
                return self._extract_text(response)
            except (APITimeoutError, httpx.TimeoutException, asyncio.TimeoutError) as exc:
                last_error = exc
                logger.warning(
                    "Groq request timed out on attempt %d/%d (timeout=%.1fs): %s",
                    attempt + 1,
                    self.max_retries + 1,
                    self.timeout_seconds,
                    exc,
                )
                if attempt < self.max_retries:
                    backoff = _calculate_backoff(attempt, exc, base_delay=1.0)
                    logger.info("Retrying Groq request in %.2fs (attempt %d/%d)...", backoff, attempt + 1, self.max_retries + 1)
                    await asyncio.sleep(backoff)
                    continue
                raise LLMTimeoutError(
                    f"Groq API request timed out after {self.timeout_seconds}s."
                ) from exc
            except AuthenticationError as exc:
                logger.error("Groq authentication failure (HTTP 401): %s", exc)
                raise LLMConfigurationError(
                    "Groq API authentication failed: Invalid or missing API key."
                ) from exc
            except PermissionDeniedError as exc:
                logger.error("Groq permission denied (HTTP 403): %s", exc)
                raise LLMConfigurationError(
                    f"Groq API access denied: {exc}"
                ) from exc
            except NotFoundError as exc:
                logger.error("Configured Groq model '%s' was not found (HTTP 404): %s", self.model, exc)
                raise LLMModelNotFoundError(
                    f"Configured Groq model '{self.model}' was not found: {exc}"
                ) from exc
            except BadRequestError as exc:
                lower_msg = str(exc).lower()
                if "model" in lower_msg or "not found" in lower_msg or "unsupported" in lower_msg:
                    logger.error("Invalid Groq model requested '%s': %s", self.model, exc)
                    raise LLMModelNotFoundError(f"Unsupported Groq model '{self.model}': {exc}") from exc
                logger.error("Bad request to Groq API (HTTP 400): %s", exc)
                raise LLMAPIError(f"Invalid request to Groq API: {exc}") from exc
            except RateLimitError as exc:
                last_error = exc
                if attempt < self.max_retries:
                    backoff = _calculate_backoff(attempt, exc, base_delay=2.0)
                    logger.warning(
                        "Groq rate limit reached (HTTP 429). Retrying in %.2fs (attempt %d/%d)...",
                        backoff,
                        attempt + 1,
                        self.max_retries + 1,
                    )
                    await asyncio.sleep(backoff)
                    continue
                logger.warning("Groq rate limit exceeded after %d retries: %s", self.max_retries, exc)
                raise LLMQuotaExceededError("Groq API rate limit exceeded. Please try again shortly.") from exc
            except (InternalServerError, APIConnectionError) as exc:
                last_error = exc
                if attempt < self.max_retries:
                    backoff = _calculate_backoff(attempt, exc, base_delay=1.5)
                    logger.warning(
                        "Transient Groq error (%s). Retrying in %.2fs (attempt %d/%d)...",
                        type(exc).__name__,
                        backoff,
                        attempt + 1,
                        self.max_retries + 1,
                    )
                    await asyncio.sleep(backoff)
                    continue
                logger.error("Groq service unavailable after %d retries: %s", self.max_retries, exc)
                raise LLMServiceUnavailableError(
                    "AI service is temporarily experiencing high demand. Your documents are safe. Please try again shortly."
                ) from exc
            except APIError as exc:
                last_error = exc
                code = getattr(exc, "status_code", None)
                if code and 500 <= code < 600 and attempt < self.max_retries:
                    backoff = _calculate_backoff(attempt, exc, base_delay=1.5)
                    logger.warning(
                        "Transient Groq API error (HTTP %s). Retrying in %.2fs (attempt %d/%d)...",
                        code,
                        backoff,
                        attempt + 1,
                        self.max_retries + 1,
                    )
                    await asyncio.sleep(backoff)
                    continue
                logger.error("Groq API error (HTTP %s): %s", code, exc)
                raise LLMAPIError(f"Groq API error: {exc}") from exc
            except (LLMContentFilterError, LLMEmptyResponseError):
                raise
            except Exception as exc:
                last_error = exc
                logger.warning(
                    "Unexpected error during Groq communication (attempt %d/%d): %s",
                    attempt + 1,
                    self.max_retries + 1,
                    exc,
                )
                if attempt < self.max_retries:
                    backoff = _calculate_backoff(attempt, exc, base_delay=1.0)
                    await asyncio.sleep(backoff)
                    continue
                logger.error("Groq request failed after %d retries: %s", self.max_retries, exc)
                raise LLMAPIError(f"Unexpected error communicating with Groq API: {exc}") from exc

        if last_error:
            raise LLMAPIError(f"Groq request failed after {self.max_retries} retries: {last_error}") from last_error

    async def answer(
        self, question: str, context: str, history: str, mode: str, detail: str
    ) -> tuple[str, str | None]:
        if not self.client:
            raise LLMConfigurationError(
                "GROQ_API_KEY is not configured. Please set GROQ_API_KEY in your environment."
            )

        system = self._build_system_instruction(mode, detail)
        user_content = (
            f"ACADEMIC SYLLABUS CONTEXT:\n{context}\n\n"
            f"RECENT CONVERSATION:\n{history if history else '(No previous conversation)'}\n\n"
            f"QUESTION:\n{question}"
        )
        logger.info(
            "Prompt constructed successfully for Groq: model=%s, context_chars=%d, history_chars=%d, question_chars=%d",
            self.model,
            len(context),
            len(history),
            len(question),
        )

        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": user_content},
        ]

        full_text = await self._call_chat_completions(messages)

        # Post-processing: remove any accidental chunk_id leaks
        full_text = re.sub(r'\|\s*chunk_id=[a-zA-Z0-9_\-]+', '', full_text)
        full_text = re.sub(r'\[chunk_id=[a-zA-Z0-9_\-]+\]', '', full_text)
        full_text = re.sub(r'chunk_id=[a-zA-Z0-9_\-]+', '', full_text)

        answer = full_text
        additional = None
        marker = "Additional AI Knowledge"
        if marker in answer:
            answer, additional = answer.split(marker, 1)
            # Clean up markdown headers, bold markers, colons, and leading/trailing whitespace
            additional = additional.lstrip(" :#\n*")
            answer = answer.rstrip(" #*\n:")

        return answer.strip(), (additional.strip() if additional else None)
