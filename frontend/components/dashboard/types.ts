export type StudyMode = 'Syllabus + AI' | 'Strict Syllabus'

export type LoadingAnimationTheme = 'couple' | 'penguin' | 'warrior'

export interface SourceReference {
  docName: string
  page: string | number
  snippet: string
  matchScore?: number
  documentId?: string
  chunkId?: string
  pageNumber?: number
  slideNumber?: number
  color?: 'coral' | 'violet' | 'mint'
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  sources?: SourceReference[]
  additionalKnowledge?: string
  liked?: boolean
}

export interface Conversation {
  id: string
  title: string
  preview: string
  updatedAt: string
  mode: StudyMode
  messages: Message[]
}

export interface DocumentItem {
  id: string
  name: string
  size: string
  pages: string
  color: 'coral' | 'violet' | 'mint'
  status: 'ready' | 'failed' | 'uploading' | 'indexing'
  uploadProgress?: number
  type: 'pdf' | 'docx' | 'pptx'
}

export interface UserSettings {
  readingFontSize: 'normal' | 'large' | 'compact'
  defaultMode: StudyMode
  answerDetail: 'concise' | 'balanced' | 'comprehensive'
  examPreparationFocus: boolean
  studyReminders: boolean
  highContrastCode: boolean
  loadingAnimation: LoadingAnimationTheme
}

export interface SavedNote {
  id: string
  messageId: string
  conversationId?: string
  question?: string
  content: string
  sources: SourceReference[]
  additionalKnowledge?: string
  createdAt: string
}
