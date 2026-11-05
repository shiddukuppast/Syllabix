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
  Bookmark,
  Lock,
} from 'lucide-react'

import {
  Conversation,
  DocumentItem,
  Message,
  SavedNote,
  SourceReference,
  StudyMode,
  UserSettings,
} from './types'
import { api } from '@/lib/api'
import { stripInlineSources, mergeSources } from '@/lib/source-utils'
import { PinEntryScreen } from '@/components/auth/pin-entry-screen'
import { useInactivityLock } from '@/hooks/use-inactivity-lock'
import { Sidebar } from './sidebar'
import { WelcomeView } from './welcome-view'
import { ChatView } from './chat-view'
import { ChatInput } from './chat-input'
import { SettingsModal } from './settings-modal'
import { DocumentModal } from './document-modal'
import { StudyNotesModal } from './study-notes-modal'
import { ConfirmModal, ConfirmDialogState } from './confirm-modal'
import { ToastContainer, ToastMessage } from './toast'

export function Dashboard() {
  const router = useRouter()

  // State
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<StudyMode>('Syllabus + AI')
  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  // Authentication & Security State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [autoLockNotice, setAutoLockNotice] = useState<string | null>(null)
  const [autoLockMinutes, setAutoLockMinutes] = useState<number>(5)

  // Layout & UI State
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null)
  const [activePreviewDoc, setActivePreviewDoc] = useState<DocumentItem | null>(null)
  const [activePreviewSource, setActivePreviewSource] = useState<SourceReference | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // Restore saved notes from localStorage with backward-compatible cleaning
  useEffect(() => {
    try {
      const raw = localStorage.getItem('syllabix_saved_notes')
      if (raw) {
        const parsed: SavedNote[] = JSON.parse(raw)
        const sanitized = parsed.map((note) => {
          const { cleanText, extractedSources } = stripInlineSources(note.content)
          const mergedSources = mergeSources(note.sources, extractedSources)
          return {
            ...note,
            content: cleanText,
            sources: mergedSources,
          }
        })
        setSavedNotes(sanitized)
      }
    } catch {
      // Ignore localStorage issues
    }
  }, [])

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
    loadingAnimation: 'couple',
  })

  // Restore sidebar collapsed and loading animation preferences from localStorage
  useEffect(() => {
    try {
      const savedAnim = localStorage.getItem('syllabix_loading_animation')
      if (savedAnim && ['couple', 'penguin', 'warrior'].includes(savedAnim)) {
        setSettings((prev) => ({
          ...prev,
          loadingAnimation: savedAnim as UserSettings['loadingAnimation'],
        }))
      }
    } catch {
      // Ignore localStorage access issues
    }
  }, [])

  // File Input Ref for top-level / modal triggers
  const hiddenUploadRef = useRef<HTMLInputElement>(null)
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const uploadingFilesRef = useRef(new Set<string>())
  const isSubmittingRef = useRef(false)

  // Current active conversation
  const activeConversation = conversations.find((c) => c.id === activeConvId) || null

  const loadInitialData = async () => {
    try {
      const [, loadedConversations, loadedDocs, loadedSettings] = await Promise.all([
        api.health(),
        api.listConversations(),
        api.listDocuments(),
        api.getSettings(),
      ])
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
        loadingAnimation:
          (loadedSettings.loading_animation as UserSettings['loadingAnimation']) ||
          settings.loadingAnimation ||
          'couple',
      }
      setSettings(nextSettings)
      try {
        localStorage.setItem('syllabix_loading_animation', nextSettings.loadingAnimation)
      } catch {
        // Ignore
      }
      setMode(nextSettings.defaultMode)
    } catch (error: any) {
      if (
        error?.status === 401 ||
        error?.message?.includes('401') ||
        error?.message?.toLowerCase().includes('authenticated')
      ) {
        setIsAuthenticated(false)
        return
      }
      setBackendStatus('offline')
      addToast('error', 'Backend unavailable', error?.message || 'Failed to connect')
    }
  }

  // Check PIN authentication status on workspace mount
  useEffect(() => {
    let isMounted = true
    api.getAuthStatus()
      .then((status) => {
        if (!isMounted) return
        if (status.auto_lock_minutes) {
          setAutoLockMinutes(status.auto_lock_minutes)
        }
        if (!status.pin_configured) {
          // If PIN is not configured on backend, allow immediate access
          setIsAuthenticated(true)
          void loadInitialData()
        } else if (status.authenticated) {
          setIsAuthenticated(true)
          void loadInitialData()
        } else {
          setIsAuthenticated(false)
        }
      })
      .catch((error: any) => {
        if (!isMounted) return
        if (error?.status === 401) {
          setIsAuthenticated(false)
        } else {
          // Backend offline or unreachable
          setIsAuthenticated(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  // Manual Workspace Lock Trigger
  const handleManualLock = async () => {
    try {
      await api.lockWorkspace()
    } catch {
      // Ignore network errors on lock
    } finally {
      setAutoLockNotice(null)
      setIsAuthenticated(false)
      addToast('info', 'Workspace Locked', 'Enter your PIN to return to your study session.')
    }
  }

  // Automatic Workspace Lock Trigger on Inactivity
  const handleAutoLock = async () => {
    try {
      await api.lockWorkspace()
    } catch {
      // Ignore
    } finally {
      setAutoLockNotice(
        `Your workspace was automatically locked due to ${autoLockMinutes} minutes of inactivity.`
      )
      setIsAuthenticated(false)
    }
  }

  // Background inactivity watcher
  useInactivityLock({
    isEnabled: isAuthenticated === true,
    timeoutMinutes: autoLockMinutes,
    onLock: handleAutoLock,
  })

  // Callback on successful PIN verification
  const handleUnlockSuccess = () => {
    setAutoLockNotice(null)
    setIsAuthenticated(true)
    void loadInitialData()
  }

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
      .catch((error: Error) => {
        if ((error as any)?.status === 401) {
          setIsAuthenticated(false)
          return
        }
        addToast('error', 'Could not open conversation', error.message)
      })
  }

  const handleDeleteConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id)
    const convTitle = conv?.title || 'this conversation'

    setConfirmDialog({
      isOpen: true,
      title: 'Delete this study chat?',
      itemName: convTitle,
      description: 'Are you sure you want to delete this study session?',
      consequence: 'This conversation and its message history will be removed.',
      confirmText: 'Delete Chat',
      cancelText: 'Cancel',
      isDestructive: true,
      iconType: 'trash',
      onConfirm: async () => {
        try {
          await api.deleteConversation(id)
          setConversations((prev) => prev.filter((c) => c.id !== id))
          if (activeConvId === id) setActiveConvId(null)
          addToast('info', 'Conversation deleted')
        } catch (error: any) {
          addToast('error', 'Could not delete conversation', error?.message || 'Failed to delete')
          throw error
        }
      },
    })
  }

  const handleClearHistory = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear study history?',
      description: 'Are you sure you want to clear all conversations?',
      consequence:
        'All chat sessions and discussion history will be reset. Uploaded study materials and saved notes will be preserved.',
      confirmText: 'Clear All History',
      cancelText: 'Cancel',
      isDestructive: true,
      iconType: 'warning',
      onConfirm: async () => {
        try {
          await api.clearConversations(conversations)
          setConversations([])
          setActiveConvId(null)
          addToast('info', 'History Cleared', 'All study chats have been reset.')
        } catch (error: any) {
          addToast('error', 'Could not clear history', error?.message || 'Failed to clear')
          throw error
        }
      },
    })
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

    setConfirmDialog({
      isOpen: true,
      title: 'Delete this document?',
      itemName: docName,
      description: 'Are you sure you want to permanently delete this document?',
      consequence:
        'This will remove the original file, its indexed content, and its associated records.',
      confirmText: 'Delete Document',
      cancelText: 'Cancel',
      isDestructive: true,
      iconType: 'document',
      onConfirm: async () => {
        try {
          await api.deleteDocument(id)
          setDocs((prev) => prev.filter((d) => d.id !== id))
          if (activePreviewDoc?.id === id) {
            setActivePreviewDoc(null)
          }
          addToast('success', 'Document Deleted', `"${docName}" has been permanently removed.`)
        } catch (error: any) {
          addToast('error', 'Could not delete document', error?.message || 'Failed to delete document')
          throw error
        }
      },
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
        if ((error as any)?.status === 401) {
          setIsAuthenticated(false)
          return
        }

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

  const handleToggleSaveNote = (
    message: Message,
    cleanContent: string,
    sources: SourceReference[]
  ) => {
    const isAlreadySaved = savedNotes.some(
      (n) => n.messageId === message.id || n.id === message.id
    )

    if (isAlreadySaved) {
      const updated = savedNotes.filter(
        (n) => n.messageId !== message.id && n.id !== message.id
      )
      setSavedNotes(updated)
      try {
        localStorage.setItem('syllabix_saved_notes', JSON.stringify(updated))
      } catch {
        // Ignore
      }
      addToast('info', 'Note Removed', 'Removed from your saved study notes.')
    } else {
      // Find the associated user question for note title
      let questionTitle = 'Exam Study Note'
      if (activeConversation) {
        const msgIndex = activeConversation.messages.findIndex((m) => m.id === message.id)
        if (msgIndex > 0) {
          const priorUser = [...activeConversation.messages.slice(0, msgIndex)]
            .reverse()
            .find((m) => m.role === 'user')
          if (priorUser) {
            questionTitle = priorUser.content.slice(0, 80)
          }
        } else {
          const lastUser = [...activeConversation.messages].reverse().find((m) => m.role === 'user')
          if (lastUser) {
            questionTitle = lastUser.content.slice(0, 80)
          }
        }
      }

      const newNote: SavedNote = {
        id: `note-${Date.now()}-${message.id}`,
        messageId: message.id,
        conversationId: activeConvId || undefined,
        question: questionTitle,
        content: cleanContent,
        sources: sources || [],
        additionalKnowledge: message.additionalKnowledge,
        createdAt: new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      }

      const updated = [newNote, ...savedNotes]
      setSavedNotes(updated)
      try {
        localStorage.setItem('syllabix_saved_notes', JSON.stringify(updated))
      } catch {
        // Ignore
      }
      addToast('success', 'Saved to Study Notes', 'Clean academic content and sources preserved.')
    }
  }

  const handleDeleteNote = (id: string) => {
    const note = savedNotes.find((n) => n.id === id || n.messageId === id)
    const noteSnippet =
      note?.title || (note?.content ? note.content.slice(0, 48) + '...' : 'this study note')

    setConfirmDialog({
      isOpen: true,
      title: 'Delete saved study note?',
      itemName: noteSnippet,
      description: 'Are you sure you want to delete this saved note?',
      consequence: 'This note will be permanently removed from your personal study notes collection.',
      confirmText: 'Delete Note',
      cancelText: 'Cancel',
      isDestructive: true,
      iconType: 'trash',
      onConfirm: () => {
        const updated = savedNotes.filter((n) => n.id !== id && n.messageId !== id)
        setSavedNotes(updated)
        try {
          localStorage.setItem('syllabix_saved_notes', JSON.stringify(updated))
        } catch {
          // Ignore
        }
        addToast('info', 'Note Deleted', 'Removed from your study collection.')
      },
    })
  }

  const handleCopyNote = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      addToast('success', 'Copied to Clipboard!', 'Note content copied.')
    }
  }

  // Initial authentication check state
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#fbf9fe]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-[#7763d9] border-t-transparent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#797298]">
            Loading Syllabix...
          </span>
        </div>
      </div>
    )
  }

  // When unauthenticated or locked: render the PinEntryScreen.
  // Sensitive dashboard contents, notes, and documents are completely omitted from the DOM.
  if (isAuthenticated === false) {
    return (
      <PinEntryScreen
        onUnlockSuccess={handleUnlockSuccess}
        autoLockNotice={autoLockNotice}
      />
    )
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
        savedNotes={savedNotes}
        onDeleteNote={handleDeleteNote}
        onCopyNote={handleCopyNote}
        onViewSource={handleViewSource}
        onOpenNotesModal={() => setIsNotesModalOpen(true)}
        onLock={handleManualLock}
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
            {/* Saved Study Notes Trigger */}
            <button
              onClick={() => setIsNotesModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e3deef] bg-white px-3 py-1.5 text-xs font-semibold text-[#5d567c] transition hover:bg-[#f8f6ff] hover:text-[#7763d9]"
              title="View saved study notes"
            >
              <Bookmark className="size-3.5 fill-[#7763d9] text-[#7763d9]" />
              <span className="hidden md:inline">Notes</span>
              {savedNotes.length > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f1edfe] px-1 text-[10px] font-bold text-[#6853cc]">
                  {savedNotes.length}
                </span>
              )}
            </button>

            {/* Quick Upload Button */}
            <button
              onClick={() => hiddenUploadRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e3deef] bg-white px-3 py-1.5 text-xs font-semibold text-[#5d567c] transition hover:bg-[#f8f6ff] hover:text-[#7763d9]"
              title="Upload study material (.pdf, .docx, .pptx)"
            >
              <Upload className="size-3.5" />
              <span className="hidden md:inline">Upload Files</span>
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

            {/* Quick Workspace Lock */}
            <button
              onClick={handleManualLock}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e3deef] bg-white px-3 py-1.5 text-xs font-semibold text-[#5d567c] transition hover:bg-[#f8f6ff] hover:text-[#7763d9]"
              title="Lock workspace immediately"
            >
              <Lock className="size-3.5" />
              <span className="hidden sm:inline">Lock</span>
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
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:px-12 content-scroll">
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
                  loadingAnimation={settings.loadingAnimation}
                  savedNotes={savedNotes}
                  onSaveNote={handleToggleSaveNote}
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
          if (newVals.loadingAnimation) {
            try {
              localStorage.setItem('syllabix_loading_animation', newVals.loadingAnimation)
            } catch {
              // Ignore
            }
          }
          void api.updateSettings(nextSettings).catch((error: Error) => addToast('error', 'Could not save settings', error.message))
          if (newVals.defaultMode) {
            setMode(newVals.defaultMode)
          }
        }}
        onClearHistory={handleClearHistory}
        onLock={handleManualLock}
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

      {/* Saved Study Notes Modal */}
      <StudyNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        notes={savedNotes}
        onDeleteNote={handleDeleteNote}
        onCopyNote={handleCopyNote}
        onViewSource={handleViewSource}
      />

      {/* Reusable Custom Confirmation Modal */}
      <ConfirmModal
        state={confirmDialog}
        onClose={() => setConfirmDialog(null)}
      />

      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
