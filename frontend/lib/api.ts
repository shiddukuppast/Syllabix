import { Conversation, DocumentItem, Message, StudyMode, UserSettings } from '@/components/dashboard/types'

const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, '').replace(/\/api$/, '')

export type BackendHealth = {
  status: string
}

export type ChatApiResponse = {
  conversation_id: string
  message_id: string
  answer: string
  additional_ai_knowledge?: string
  sources: Array<{
    doc_name: string
    page: string | number
    snippet: string
    match_score?: number
  }>
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...init?.headers },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `Request failed (${response.status})`)
  }
  return response.json()
}

function mapMessage(message: Record<string, unknown>): Message {
  return {
    id: String(message.message_id),
    role: message.role as Message['role'],
    content: String(message.content),
    timestamp: new Date(String(message.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sources: (message.sources as Array<Record<string, unknown>> | undefined)?.map((source) => ({
      docName: String(source.doc_name),
      page: source.page as string | number,
      snippet: String(source.snippet),
      matchScore: source.match_score as number | undefined,
    })),
    additionalKnowledge: message.additional_ai_knowledge as string | undefined,
  }
}

function mapConversation(item: Record<string, unknown>): Conversation {
  return {
    id: String(item.id),
    title: String(item.title),
    preview: String(item.preview || ''),
    updatedAt: String(item.updatedAt || ''),
    mode: item.mode as StudyMode,
    messages: (item.messages as Array<Record<string, unknown>> || []).map(mapMessage),
  }
}

export const api = {
  health: () => request<BackendHealth>('/health'),
  listConversations: async () => (await request<Array<Record<string, unknown>>>('/conversations')).map(mapConversation),
  getConversation: async (id: string) => mapConversation(await request<Record<string, unknown>>(`/conversations/${id}`)),
  createConversation: async () => mapConversation(await request<Record<string, unknown>>('/conversations', { method: 'POST' })),
  renameConversation: async (id: string, title: string) =>
    mapConversation(await request<Record<string, unknown>>(`/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    })),
  deleteConversation: (id: string) => request(`/conversations/${id}`, { method: 'DELETE' }),
  clearConversations: async (conversations: Conversation[]) => Promise.all(conversations.map((conversation) => api.deleteConversation(conversation.id))),
  listDocuments: () => request<DocumentItem[]>('/documents'),
  deleteDocument: (id: string) => request(`/documents/${id}`, { method: 'DELETE' }),
  uploadDocument: (file: File, onProgress?: (progress: number) => void): Promise<DocumentItem> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${API_BASE_URL}/documents/upload`)
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText))
        else reject(new Error(JSON.parse(xhr.responseText)?.detail || 'Upload failed'))
      }
      xhr.onerror = () => reject(new Error('Network error while uploading document'))
      const form = new FormData()
      form.append('file', file)
      xhr.send(form)
    }),
  chat: (question: string, conversationId: string | null, mode: StudyMode, detail: UserSettings['answerDetail']) =>
    request<ChatApiResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ question, conversation_id: conversationId, mode, detail }),
    }),
  getSettings: () => request<Record<string, unknown>>('/settings'),
  updateSettings: (settings: UserSettings) => request<Record<string, unknown>>('/settings', { method: 'PATCH', body: JSON.stringify({
    reading_font_size: settings.readingFontSize, default_mode: settings.defaultMode, answer_detail: settings.answerDetail,
    exam_preparation_focus: settings.examPreparationFocus, study_reminders: settings.studyReminders, high_contrast_code: settings.highContrastCode,
  }) }),
}
