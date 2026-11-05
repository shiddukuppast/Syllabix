'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Menu,
  ArrowLeft,
  Settings,
  Plus,
  Upload,
  Home,
} from 'lucide-react'

import {
  Conversation,
  DocumentItem,
  Message,
  SourceReference,
  StudyMode,
  UserSettings,
} from './types'
import { api } from '@/lib/api'
import { Sidebar } from './sidebar'
import { WelcomeView } from './welcome-view'
import { ChatView } from './chat-view'
import { ChatInput } from './chat-input'
import { SettingsModal } from './settings-modal'
import { DocumentModal } from './document-modal'
import { ToastContainer, ToastMessage } from './toast'

export function Dashboard() {
  const router = useRouter()

  // State
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<StudyMode>('Syllabus + AI')
  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  // Layout & UI State
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [activePreviewDoc, setActivePreviewDoc] = useState<DocumentItem | null>(null)
  const [activePreviewSource, setActivePreviewSource] = useState<SourceReference | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // Restore sidebar collapsed preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('syllabix_sidebar_collapsed')
      if (saved !== null) {
        setIsCollapsed(saved === 'true')
      }
    } catch {
      // Ignore localStorage access issues
    }
  }, [])

  const handleSetIsCollapsed = (action: boolean | ((prev: boolean) => boolean)) => {
    setIsCollapsed((prev) => {
      const next = typeof action === 'function' ? action(prev) : action
      try {
        localStorage.setItem('syllabix_sidebar_collapsed', String(next))
      } catch {
        // Ignore
      }
      return next
    })
  }

  // User Settings
  const [settings, setSettings] = useState<UserSettings>({
    readingFontSize: 'normal',
    defaultMode: 'Syllabus + AI',
    answerDetail: 'balanced',
    examPreparationFocus: true,
    studyReminders: true,
    highContrastCode: false,
  })

  // File Input Ref for top-level / modal triggers
  const hiddenUploadRef = useRef<HTMLInputElement>(null)
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const uploadingFilesRef = useRef(new Set<string>())
  const isSubmittingRef = useRef(false)

  // Current active conversation
  const activeConversation = conversations.find((c) => c.id === activeConvId) || null

  useEffect(() => {
    void Promise.all([api.health(), api.listConversations(), api.listDocuments(), api.getSettings()])
      .then(([, loadedConversations, loadedDocs, loadedSettings]) => {
        setBackendStatus('online')
        setConversations(loadedConversations)
        setDocs(loadedDocs)
        const nextSettings: UserSettings = {
          readingFontSize: loadedSettings.reading_font_size as UserSettings['readingFontSize'],
          defaultMode: loadedSettings.default_mode as StudyMode,
          answerDetail: loadedSettings.answer_detail as UserSettings['answerDetail'],
          examPreparationFocus: Boolean(loadedSettings.exam_preparation_focus),
          studyReminders: Boolean(loadedSettings.study_reminders),
          highContrastCode: Boolean(loadedSettings.high_contrast_code),
        }
        setSettings(nextSettings)
        setMode(nextSettings.defaultMode)
      })
      .catch((error: Error) => {
        setBackendStatus('offline')
        addToast('error', 'Backend unavailable', error.message)
      })
  }, [])

  // Toast helper
  const addToast = (type: 'success' | 'info' | 'error', title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, type, title, description }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3800)
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Auto-scroll chat to bottom smoothly when new messages or thinking indicator arrives
  useEffect(() => {
    if (activeConvId && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeConversation?.messages.length, isThinking, activeConvId])

  // Handlers
  const handleNewChat = () => {
    if (isThinking) return
    setActiveConvId(null)
    setQuery('')
    setIsThinking(false)
    addToast('info', 'New Study Session', 'Ready for your questions!')
  }

  const handleSelectConversation = (id: string) => {
    if (isThinking) return
    void api.getConversation(id)
      .then((conversation) => {
        setConversations((previous) => [
          conversation,
          ...previous.filter((item) => item.id !== conversation.id),
        ])
        setActiveConvId(id)
        setMode(conversation.mode)
      })
      .catch((error: Error) => addToast('error', 'Could not open conversation', error.message))
  }

  const handleDeleteConversation = (id: string) => {
    void api.deleteConversation(id).then(() => {
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (activeConvId === id) setActiveConvId(null)
      addToast('info', 'Conversation deleted')
    }).catch((error: Error) => addToast('error', 'Could not delete conversation', error.message))
  }

  const handleClearHistory = () => {
    void api.clearConversations(conversations).then(() => {
      setConversations([])
      setActiveConvId(null)
      addToast('info', 'History Cleared', 'All study chats have been reset.')
    }).catch((error: Error) => addToast('error', 'Could not clear history', error.message))
  }

  const handleFilesUpload = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    fileArray.forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (!['pdf', 'docx', 'pptx'].includes(ext || '')) {
        addToast('error', 'Unsupported file', `${file.name}: Only PDF, DOCX, and PPTX files are supported.`)
        return
      }
      if (file.size === 0) {
        addToast('error', 'Empty file', `${file.name} is empty (0 bytes).`)
        return
      }
      if (file.size > 25 * 1024 * 1024) {
        addToast('error', 'File too large', `${file.name} exceeds the 25 MB limit.`)
        return
      }
      const uploadKey = `${file.name}:${file.size}:${file.lastModified}`
      if (uploadingFilesRef.current.has(uploadKey)) {
        addToast('info', 'Upload in progress', `${file.name} is already uploading.`)
        return
      }
      uploadingFilesRef.current.add(uploadKey)
      const temporaryId = `upload-${Date.now()}-${file.name}`
      const formattedSize = file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`
      const temporary: DocumentItem = {
        id: temporaryId,
        name: file.name,
        size: formattedSize,
        pages: 'Uploading...',
        color: ext === 'pdf' ? 'coral' : ext === 'docx' ? 'violet' : 'mint',
        status: 'uploading',
        uploadProgress: 0,
        type: ext as DocumentItem['type'],
      }
      setDocs((prev) => [temporary, ...prev])
      void api.uploadDocument(file, (progress) =>
        setDocs((prev) =>
          prev.map((doc) => {
            if (doc.id !== temporaryId) return doc
            const isIndexing = progress >= 100
            return {
              ...doc,
              uploadProgress: progress,
              status: isIndexing ? 'indexing' : 'uploading',
              pages: isIndexing ? 'Indexing syllabus...' : `${progress}% uploaded`,
            }
          })
        )
      )
        .then(async (document) => {
          try {
            const refreshed = await api.listDocuments()
            setDocs(refreshed)
          } catch {
            setDocs((prev) => [document, ...prev.filter((doc) => doc.id !== temporaryId)])
          }
          addToast('success', 'Document Ready', `${file.name} has been processed and indexed.`)
        })
        .catch((error: Error) => {
          void api.listDocuments()
            .then((refreshed) => setDocs(refreshed))
            .catch(() => setDocs((prev) => prev.filter((doc) => doc.id !== temporaryId)))
          addToast('error', 'Upload failed', error.message)
        })
        .finally(() => uploadingFilesRef.current.delete(uploadKey))
    })
  }

  const handleDeleteDoc = (id: string) => {
    const docToDelete = docs.find((d) => d.id === id)
    const docName = docToDelete?.name || 'this document'

    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(
        `Are you sure you want to permanently delete "${docName}"?\n\nThis will remove the file from local storage, vector indexes, and database.`
      )
      if (!confirmed) return
    }

    void api.deleteDocument(id)
      .then(() => {
        setDocs((prev) => prev.filter((d) => d.id !== id))
        if (activePreviewDoc?.id === id) {
          setActivePreviewDoc(null)
        }
        addToast('success', 'Document Deleted', `"${docName}" has been permanently removed.`)
      })
      .catch((error: Error) => {
        addToast('error', 'Could not delete document', error.message)
      })
  }

  const handleSelectPrompt = (promptText: string) => {
    setQuery(promptText)
  }

  const handleSendMessage = (messageText?: string) => {
    const textToSend = messageText || query
    if (!textToSend.trim() || isThinking || isSubmittingRef.current) return

    isSubmittingRef.current = true
    setIsThinking(true)

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    const isNewConversation = !activeConvId || activeConvId.startsWith('temp-')
    const apiConvId = isNewConversation ? null : activeConvId
    const tempConvId = isNewConversation ? `temp-${Date.now()}` : activeConvId

    if (isNewConversation) {
      const initialConv: Conversation = {
        id: tempConvId,
        title: textToSend.trim().slice(0, 32),
        preview: textToSend.trim(),
        updatedAt: 'Just now',
        mode,
        messages: [userMessage],
      }
      setConversations((prev) => [initialConv, ...prev])
      setActiveConvId(tempConvId)
    } else {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === tempConvId
            ? { ...c, messages: [...c.messages, userMessage], updatedAt: 'Just now' }
            : c
        )
      )
    }

    setQuery('')

    void api.chat(textToSend.trim(), apiConvId, mode, settings.answerDetail)
      .then((response) => {
        const assistantMessage: Message = {
          id: response.message_id,
          role: 'assistant',
          content: response.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          additionalKnowledge: response.additional_ai_knowledge,
          sources: response.sources.map((source) => ({
            docName: String(source.doc_name),
            page: source.page as string | number,
            snippet: String(source.snippet),
            matchScore: source.match_score as number | undefined,
            documentId: source.document_id,
            chunkId: source.chunk_id,
            pageNumber: source.page_number,
            slideNumber: source.slide_number,
          })),
        }

        setConversations((prev) => {
          const current = prev.find((c) => c.id === tempConvId)
          if (current) {
            const updated: Conversation = {
              ...current,
              id: response.conversation_id,
              messages: [...current.messages, assistantMessage],
              updatedAt: 'Just now',
            }
            return [updated, ...prev.filter((c) => c.id !== tempConvId && c.id !== response.conversation_id)]
          }
          const next: Conversation = {
            id: response.conversation_id,
            title: textToSend.trim().slice(0, 32),
            preview: textToSend.trim(),
            updatedAt: 'Just now',
            mode,
            messages: [userMessage, assistantMessage],
          }
          return [next, ...prev.filter((c) => c.id !== response.conversation_id)]
        })
        setActiveConvId(response.conversation_id)
      })
      .catch((error: Error) => {
        // Preserve user's question so they do not need to retype it
        setQuery(textToSend)

        // Roll back the optimistic message so conversation state stays accurate
        if (isNewConversation) {
          setConversations((prev) => prev.filter((c) => c.id !== tempConvId))
          setActiveConvId(null)
        } else {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === tempConvId
                ? { ...c, messages: c.messages.filter((m) => m.id !== userMessage.id) }
                : c
            )
          )
        }

        const isHighDemand =
          error.message.toLowerCase().includes('high demand') ||
          error.message.includes('503') ||
          error.message.toLowerCase().includes('temporarily')
        if (isHighDemand) {
          addToast(
            'error',
            'AI High Demand',
            'AI service is temporarily experiencing high demand. Your question was preserved. Please click Send to retry.'
          )
        } else {
          addToast(
            'error',
            'Could not generate answer',
            `${error.message || 'Please check your connection.'} Your question was preserved.`
          )
        }
      })
      .finally(() => {
        isSubmittingRef.current = false
        setIsThinking(false)
      })
  }

  const handleRegenerate = () => {
    if (!activeConversation || activeConversation.messages.length === 0 || isThinking || isSubmittingRef.current)
      return

    const lastUser = [...activeConversation.messages].reverse().find((message) => message.role === 'user')
    if (lastUser) handleSendMessage(lastUser.content)
  }

  const handleCopyAnswer = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      addToast('success', 'Copied to Clipboard!', 'Ready to paste into your notes.')
    }
  }

  const handleViewSource = (source: SourceReference) => {
    setActivePreviewSource(source)
    setActivePreviewDoc(null)
  }

  const handlePreviewDoc = (doc: DocumentItem) => {
    setActivePreviewDoc(doc)
    setActivePreviewSource(null)
  }

  const handleAskAboutDoc = (docName: string) => {
    setQuery(`Summarize key concepts from ${docName}`)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#fbfaff] text-[#282344]">
      {/* Hidden file input for header or modal uploads */}
      <input
        ref={hiddenUploadRef}
        type="file"
        multiple
        accept=".pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFilesUpload(e.target.files)
          e.target.value = ''
        }}
      />

      {/* Sidebar Component */}
      <Sidebar
        conversations={conversations}
        activeConvId={activeConvId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        docs={docs}
        onOpenUpload={() => hiddenUploadRef.current?.click()}
        onPreviewDoc={handlePreviewDoc}
        onDeleteDoc={handleDeleteDoc}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={handleSetIsCollapsed}
      />

      {/* Main Study Arena */}
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#ebe7f4] bg-white/75 px-4 sm:px-8 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="grid size-9 place-items-center rounded-xl text-[#736c8d] hover:bg-[#f6f2fd] hover:text-[#282344] lg:hidden"
              aria-label="Open sidebar menu"
            >
              <Menu className="size-5" />
            </button>

            {/* Back button if in active chat */}
            {activeConvId && (
              <button
                onClick={handleNewChat}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#ebe7f4] bg-white px-3 py-1.5 text-xs font-semibold text-[#6555be] transition hover:bg-[#f6f2fd]"
              >
                <ArrowLeft className="size-3.5" />
                <span>Overview</span>
              </button>
            )}

            {/* Active Workspace Status Badge */}
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                {backendStatus === 'online' && (
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#3da47d] opacity-75" />
                )}
                <span className={`relative inline-flex size-2 rounded-full ${
                  backendStatus === 'online'
                    ? 'bg-[#3da47d]'
                    : backendStatus === 'offline'
                      ? 'bg-[#e17863]'
                      : 'bg-[#aaa4bc]'
                }`} />
              </span>
              <span className="text-xs font-bold text-[#302b4b]">
                {activeConversation
                  ? activeConversation.title
                  : 'Study Workspace'}
              </span>
              <span className="hidden sm:inline-block rounded-full bg-[#f3effd] px-2.5 py-0.5 text-[10px] font-semibold text-[#7763d9]">
                {mode}
              </span>
            </div>
          </div>

          {/* Top Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Upload Button */}
            <button
              onClick={() => hiddenUploadRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e3deef] bg-white px-3 py-1.5 text-xs font-semibold text-[#5d567c] transition hover:bg-[#f8f6ff] hover:text-[#7763d9]"
              title="Upload study material (.pdf, .docx, .pptx)"
            >
              <Upload className="size-3.5" />
              <span className="hidden md:inline">Upload Notes</span>
            </button>

            {/* Settings Trigger */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="grid size-9 place-items-center rounded-xl text-[#89849e] transition hover:bg-[#f6f2fd] hover:text-[#7763d9]"
              aria-label="Study Settings"
              title="Study Settings"
            >
              <Settings className="size-4" />
            </button>

            <div className="h-4 w-px bg-[#ebe7f4]" />

            {/* Home Link (back to landing page) */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e3deef] bg-white px-3 py-1.5 text-xs font-semibold text-[#5d567c] transition hover:bg-[#f8f6ff] hover:text-[#7763d9]"
              title="Return to Home"
            >
              <Home className="size-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Workspace Body */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl min-h-full flex flex-col">
            {!activeConversation ? (
              /* Welcome View */
              <div className="flex-1 flex flex-col justify-center">
                <WelcomeView
                  onSelectPrompt={handleSelectPrompt}
                  docs={docs}
                  onOpenUpload={() => hiddenUploadRef.current?.click()}
                  onPreviewDoc={handlePreviewDoc}
                  query={query}
                />
              </div>
            ) : (
              /* Chat Conversation View */
              <div className="flex-1">
                {/* Active Chat Header */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ebf8] pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#ee8a7a]">
                      Active Conversation
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#282344]">
                      {activeConversation.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleNewChat}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#e3deef] bg-white px-3 py-1.5 text-xs font-semibold text-[#6555be] shadow-sm hover:bg-[#f6f2fd]"
                    >
                      <Plus className="size-3.5" />
                      <span>New chat</span>
                    </button>
                  </div>
                </div>

                {/* Messages Feed */}
                <ChatView
                  messages={activeConversation.messages}
                  isThinking={isThinking}
                  onCopyAnswer={handleCopyAnswer}
                  onRegenerate={handleRegenerate}
                  onViewSource={handleViewSource}
                  fontSize={settings.readingFontSize}
                />
                <div ref={chatBottomRef} />
              </div>
            )}
          </div>
        </div>

        {/* Persistent Central Interactive Chat Input (Composer) */}
        <footer className="shrink-0 border-t border-[#ebe7f4] bg-white/80 p-4 sm:px-8 backdrop-blur-md">
          <div className="mx-auto max-w-4xl">
            <ChatInput
              query={query}
              setQuery={setQuery}
              onSubmit={() => handleSendMessage()}
              mode={mode}
              setMode={setMode}
              onFilesSelected={handleFilesUpload}
              isThinking={isThinking}
              placeholder={
                activeConvId
                  ? 'Ask a follow-up question or request clarification...'
                  : 'Ask a question about your syllabus, lecture notes, or exams...'
              }
            />
          </div>
        </footer>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) => {
          const nextSettings = { ...settings, ...newVals }
          setSettings(nextSettings)
          void api.updateSettings(nextSettings).catch((error: Error) => addToast('error', 'Could not save settings', error.message))
          if (newVals.defaultMode) {
            setMode(newVals.defaultMode)
          }
        }}
        onClearHistory={handleClearHistory}
      />

      {/* Document / Source Preview Modal */}
      <DocumentModal
        isOpen={Boolean(activePreviewDoc || activePreviewSource)}
        onClose={() => {
          setActivePreviewDoc(null)
          setActivePreviewSource(null)
        }}
        doc={activePreviewDoc}
        source={activePreviewSource}
        onAskAboutDoc={handleAskAboutDoc}
      />

      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
