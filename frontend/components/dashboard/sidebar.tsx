'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Plus,
  FileText,
  Search,
  Settings,
  X,
  PanelLeftClose,
  PanelLeft,
  Trash2,
  BookOpen,
  MessageCircle,
  Upload,
  Loader2,
  Bookmark,
  Maximize2,
  Lock,
} from 'lucide-react'
import { Conversation, DocumentItem, SavedNote, SourceReference } from './types'
import { EmptyConversations, EmptyDocuments, EmptySearch } from './empty-states'
import { SavedNoteCard } from './saved-note-card'

interface SidebarProps {
  conversations: Conversation[]
  activeConvId: string | null
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  onDeleteConversation: (id: string) => void
  docs: DocumentItem[]
  onOpenUpload: () => void
  onPreviewDoc: (doc: DocumentItem) => void
  onDeleteDoc: (id: string) => void
  onOpenSettings: () => void
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void
  savedNotes?: SavedNote[]
  onDeleteNote?: (id: string) => void
  onCopyNote?: (text: string) => void
  onViewSource?: (source: SourceReference) => void
  onOpenNotesModal?: () => void
  onLock?: () => void
}

/** Floating tooltip displayed to the right of rail icons */
function RailTooltip({ label, shortcut }: { label: string; shortcut?: string }) {
  return (
    <div className="pointer-events-none absolute left-full ml-3.5 z-50 hidden group-hover:flex items-center">
      <div className="rounded-lg bg-[#282344] px-2.5 py-1 text-[11px] font-medium text-white shadow-xl shadow-[#282344]/30 whitespace-nowrap flex items-center gap-1.5">
        <span>{label}</span>
        {shortcut && (
          <span className="rounded bg-white/20 px-1 py-0.5 text-[9px] font-mono text-white/80">
            {shortcut}
          </span>
        )}
      </div>
    </div>
  )
}

export function Sidebar({
  conversations,
  activeConvId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  docs,
  onOpenUpload,
  onPreviewDoc,
  onDeleteDoc,
  onOpenSettings,
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
  savedNotes = [],
  onDeleteNote,
  onCopyNote,
  onViewSource,
  onOpenNotesModal,
  onLock,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'chats' | 'materials'>('chats')
  const [materialsSubTab, setMaterialsSubTab] = useState<'notes' | 'files'>('notes')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle collapse state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setIsCollapsed((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setIsCollapsed])

  const handleSearchRailClick = () => {
    setIsCollapsed(false)
    setActiveTab('chats')
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 180)
  }

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSavedNotes = savedNotes.filter(
    (n) =>
      (n.question || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.content || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDocs = docs.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalNotesAndDocs = savedNotes.length + docs.length

  // ==========================================
  // 1. COLLAPSED NAVIGATION RAIL VIEW (70px)
  // ==========================================
  const collapsedContent = (
    <div className="flex h-full w-[70px] flex-col justify-between py-3 items-center select-none">
      {/* Top Header: Logo + Discoverable Expand Button */}
      <div className="flex flex-col items-center gap-2.5 w-full px-2">
        {/* Syllabix Brand Icon */}
        <Link
          href="/"
          className="relative group grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#8b74f5] to-[#ef8c83] text-white shadow-md shadow-[#8b74f5]/25 hover:scale-105 transition-transform"
          aria-label="Syllabix Home"
        >
          <Sparkles className="size-4" />
          <RailTooltip label="Syllabix Home" />
        </Link>

        {/* Visible & Discoverable Expand Button */}
        <button
          onClick={() => setIsCollapsed(false)}
          className="relative group grid size-9 place-items-center rounded-xl bg-[#f7f5fd] hover:bg-[#eee8fc] text-[#7763d9] hover:text-[#5e4bbd] transition border border-[#ebe4f8] shadow-2xs"
          aria-label="Expand sidebar"
        >
          <PanelLeft className="size-4" />
          <RailTooltip label="Expand sidebar" shortcut="Ctrl+B" />
        </button>

        <div className="h-px w-8 bg-[#f0edf7] my-0.5" />
      </div>

      {/* Center Action & Navigation Icons */}
      <div className="flex flex-col items-center gap-2.5 w-full px-2">
        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="relative group grid size-10 place-items-center rounded-xl bg-[#282344] text-white shadow-md shadow-[#282344]/15 hover:bg-[#3c3561] transition"
          aria-label="New chat"
        >
          <Plus className="size-4 transition-transform group-hover:rotate-90 duration-200" />
          <RailTooltip label="New chat" />
        </button>

        {/* Search Button */}
        <button
          onClick={handleSearchRailClick}
          className="relative group grid size-10 place-items-center rounded-xl text-[#736c8d] hover:bg-[#f6f2fd] hover:text-[#7763d9] transition"
          aria-label="Search conversations"
        >
          <Search className="size-4" />
          <RailTooltip label="Search conversations" />
        </button>

        {/* Chats Navigation */}
        <button
          onClick={() => {
            setActiveTab('chats')
            setIsCollapsed(false)
          }}
          className={`relative group grid size-10 place-items-center rounded-xl transition ${activeTab === 'chats'
              ? 'bg-[#f1eeff] text-[#7763d9] font-medium'
              : 'text-[#736c8d] hover:bg-[#f6f2fd] hover:text-[#7763d9]'
            }`}
          aria-label={`Chats (${conversations.length})`}
        >
          <MessageCircle className="size-4" />
          {conversations.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#7763d9] px-1 text-[9px] font-bold text-white shadow-2xs">
              {conversations.length}
            </span>
          )}
          <RailTooltip label={`Chats (${conversations.length})`} />
        </button>

        {/* Notes & Materials Navigation */}
        <button
          onClick={() => {
            setActiveTab('materials')
            setIsCollapsed(false)
          }}
          className={`relative group grid size-10 place-items-center rounded-xl transition ${activeTab === 'materials'
              ? 'bg-[#ebfaf3] text-[#2d9b75] font-medium'
              : 'text-[#736c8d] hover:bg-[#ebfaf3] hover:text-[#2d9b75]'
            }`}
          aria-label={`Notes (${totalNotesAndDocs})`}
        >
          <BookOpen className="size-4" />
          {totalNotesAndDocs > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#7763d9] px-1 text-[9px] font-bold text-white shadow-2xs">
              {totalNotesAndDocs}
            </span>
          )}
          <RailTooltip label={`Notes (${totalNotesAndDocs})`} />
        </button>

        {/* Quick Upload Notes */}
        <button
          onClick={onOpenUpload}
          className="relative group grid size-10 place-items-center rounded-xl text-[#736c8d] hover:bg-[#f6f2fd] hover:text-[#7763d9] transition"
          aria-label="Upload study material"
        >
          <Upload className="size-4" />
          <RailTooltip label="Upload study material" />
        </button>
      </div>

      {/* Bottom Section: Workspace Indicator & Settings */}
      <div className="flex flex-col items-center gap-2 w-full px-2 pt-2 border-t border-[#f0edf7]">
        {/* Personal Workspace Indicator */}
        <div
          className="relative group grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#faf8fe] to-[#f4f0fd] border border-[#ebe5f7] text-[#7763d9] shadow-2xs cursor-default"
          aria-label="Personal Workspace"
        >
          <Sparkles className="size-4" />
          <RailTooltip label="Personal Workspace" />
        </div>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="relative group grid size-10 place-items-center rounded-xl text-[#89849e] hover:bg-[#f6f3fe] hover:text-[#7763d9] transition"
          aria-label="Settings"
        >
          <Settings className="size-4" />
          <RailTooltip label="Settings" />
        </button>

        {/* Lock Button */}
        {onLock && (
          <button
            onClick={onLock}
            className="relative group grid size-10 place-items-center rounded-xl text-[#89849e] hover:bg-[#fff0ed] hover:text-[#e26d5a] transition"
            aria-label="Lock workspace"
          >
            <Lock className="size-4" />
            <RailTooltip label="Lock workspace" />
          </button>
        )}
      </div>
    </div>
  )

  // ==========================================
  // 2. EXPANDED FULL SIDEBAR VIEW (280px)
  // ==========================================
  const expandedContent = (
    <div className="flex h-full w-[280px] flex-col justify-between overflow-hidden select-none">
      <div className="flex flex-col min-h-0 flex-1">
        {/* Top Header: Logo & Collapse Button */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#f0edf7]">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold tracking-tight text-[#1f2440] group"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#8b74f5] to-[#ef8c83] text-white shadow-md shadow-[#8b74f5]/20 group-hover:scale-105 transition-transform">
              <Sparkles className="size-4" />
            </span>
            <span className="text-[19px]">
              syllabix<span className="text-[#ef8c83]">.</span>
            </span>
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-[#89849e] hover:text-[#282344] p-1.5 rounded-xl hover:bg-[#f6f3ff]"
            aria-label="Close mobile navigation"
          >
            <X className="size-5" />
          </button>

          {/* Desktop Collapse Toggle with Tooltip */}
          <div className="relative group hidden lg:block">
            <button
              onClick={() => setIsCollapsed(true)}
              aria-label="Collapse sidebar"
              className="grid size-8 place-items-center rounded-xl text-[#89849e] transition hover:bg-[#f6f3ff] hover:text-[#7763d9]"
            >
              <PanelLeftClose className="size-4" />
            </button>
            <div className="pointer-events-none absolute right-0 top-full mt-1.5 z-50 hidden group-hover:flex items-center">
              <div className="rounded-lg bg-[#282344] px-2.5 py-1 text-[11px] font-medium text-white shadow-xl shadow-[#282344]/30 whitespace-nowrap flex items-center gap-1.5">
                <span>Collapse sidebar</span>
                <span className="rounded bg-white/20 px-1 py-0.5 text-[9px] font-mono text-white/80">
                  Ctrl+B
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewChat}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#282344] py-3 px-4 text-white shadow-lg shadow-[#282344]/15 transition-all hover:bg-[#3c3561]"
          >
            <Plus className="size-4 transition-transform duration-200 group-hover:rotate-90" />
            <span className="text-sm font-semibold">New chat</span>
          </motion.button>
        </div>

        {/* Search Input & Section Tabs */}
        <div className="px-3 pt-1 pb-2">
          {/* Search Input */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#a8a1bd]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === 'chats'
                  ? 'Search conversations...'
                  : materialsSubTab === 'notes'
                  ? 'Search study notes...'
                  : 'Search course files...'
              }
              className="w-full rounded-xl border border-[#ebe7f4] bg-[#fbf9fe] py-2 pl-9 pr-7 text-xs text-[#282344] outline-none transition focus:border-[#8b74f5] focus:bg-white placeholder:text-[#aaa4bc]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#aaa4bc] hover:text-[#282344]"
                aria-label="Clear search"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Section Navigation Tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#f5f2fb] p-1">
            <button
              onClick={() => setActiveTab('chats')}
              className={`relative flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${activeTab === 'chats' ? 'text-[#6555be]' : 'text-[#89849e] hover:text-[#282344]'
                }`}
            >
              {activeTab === 'chats' && (
                <motion.div
                  layoutId="activeSidebarTab"
                  className="absolute inset-0 rounded-lg bg-white shadow-sm"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <MessageCircle className="size-3.5" />
                <span>Chats ({conversations.length})</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('materials')}
              className={`relative flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${activeTab === 'materials' ? 'text-[#6555be]' : 'text-[#89849e] hover:text-[#282344]'
                }`}
            >
              {activeTab === 'materials' && (
                <motion.div
                  layoutId="activeSidebarTab"
                  className="absolute inset-0 rounded-lg bg-white shadow-sm"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <BookOpen className="size-3.5" />
                <span>Notes ({totalNotesAndDocs})</span>
              </span>
            </button>
          </div>
        </div>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-2 py-2 sidebar-scroll">
          {activeTab === 'chats' ? (
            <div>
              {searchTerm && filteredConversations.length === 0 ? (
                <EmptySearch
                  searchTerm={searchTerm}
                  onClear={() => setSearchTerm('')}
                />
              ) : conversations.length === 0 ? (
                <EmptyConversations onNewChat={onNewChat} />
              ) : (
                <div className="flex flex-col gap-1">
                  {filteredConversations.map((c) => {
                    const isActive = activeConvId === c.id
                    return (
                      <div
                        key={c.id}
                        className={`group relative flex items-center justify-between rounded-xl p-2.5 transition-colors cursor-pointer ${isActive
                            ? 'bg-[#f1eeff] text-[#6555be] font-medium'
                            : 'text-[#5f587b] hover:bg-[#f8f6ff]'
                          }`}
                        onClick={() => {
                          onSelectConversation(c.id)
                          setIsMobileOpen(false)
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <MessageCircle
                            className={`size-3.5 shrink-0 ${isActive ? 'text-[#7763d9]' : 'text-[#aaa4bc]'
                              }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs leading-snug">{c.title}</p>
                            <span className="text-[10px] text-[#aaa4bc] block">
                              {c.updatedAt}
                            </span>
                          </div>
                        </div>

                        {/* Delete Conversation Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteConversation(c.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#aaa4bc] hover:text-[#e26d5a] rounded transition"
                          title="Delete conversation"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Materials & Study Notes Sub-tabs */}
              <div className="mb-2.5 flex items-center justify-between rounded-xl bg-[#f5f2fb] p-1">
                <button
                  onClick={() => setMaterialsSubTab('notes')}
                  className={`flex-1 rounded-lg py-1 text-[11px] font-semibold transition ${
                    materialsSubTab === 'notes'
                      ? 'bg-white text-[#7763d9] shadow-xs'
                      : 'text-[#89849e] hover:text-[#282344]'
                  }`}
                >
                  Study Notes ({savedNotes.length})
                </button>
                <button
                  onClick={() => setMaterialsSubTab('files')}
                  className={`flex-1 rounded-lg py-1 text-[11px] font-semibold transition ${
                    materialsSubTab === 'files'
                      ? 'bg-white text-[#2d9b75] shadow-xs'
                      : 'text-[#89849e] hover:text-[#282344]'
                  }`}
                >
                  Course Files ({docs.length})
                </button>
              </div>

              {materialsSubTab === 'notes' ? (
                <div>
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#aaa4bc] flex items-center gap-1">
                      <Bookmark className="size-3 fill-[#7763d9] text-[#7763d9]" /> Saved Notes
                    </span>
                    {onOpenNotesModal && savedNotes.length > 0 && (
                      <button
                        onClick={onOpenNotesModal}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#7763d9] hover:underline"
                        title="Open study notes dialog"
                      >
                        <Maximize2 className="size-3" /> View All
                      </button>
                    )}
                  </div>

                  {filteredSavedNotes.length === 0 ? (
                    savedNotes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 px-3 text-center">
                        <div className="grid size-10 place-items-center rounded-xl bg-[#f5f2fb] text-[#7763d9] mb-2">
                          <Bookmark className="size-4 fill-[#7763d9]" />
                        </div>
                        <p className="text-xs font-bold text-[#282344]">No Saved Notes Yet</p>
                        <p className="text-[11px] text-[#89849e] mt-1 leading-relaxed">
                          Click &ldquo;Save note&rdquo; on any answer to review it here for exams.
                        </p>
                      </div>
                    ) : (
                      <EmptySearch
                        searchTerm={searchTerm}
                        onClear={() => setSearchTerm('')}
                      />
                    )
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {filteredSavedNotes.map((note) => (
                        <SavedNoteCard
                          key={note.id}
                          note={note}
                          onDelete={onDeleteNote || (() => {})}
                          onCopy={onCopyNote || (() => {})}
                          onViewSource={onViewSource}
                          compact={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="mb-2 flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#aaa4bc]">
                      Indexed Materials
                    </span>
                    <button
                      onClick={onOpenUpload}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#7763d9] hover:underline"
                    >
                      <Plus className="size-3" /> Add
                    </button>
                  </div>

                  {filteredDocs.length === 0 ? (
                    docs.length === 0 ? (
                      <EmptyDocuments onUpload={onOpenUpload} />
                    ) : (
                      <EmptySearch
                        searchTerm={searchTerm}
                        onClear={() => setSearchTerm('')}
                      />
                    )
                  ) : (
                    <div className="flex flex-col gap-2">
                  {docs.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => onPreviewDoc(d)}
                      className="group flex flex-col gap-1.5 rounded-xl border border-[#ebe7f4] bg-white p-2.5 shadow-2xs transition hover:border-[#cfc6f4] hover:bg-[#faf9fe] cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span
                            className={`grid size-7 shrink-0 place-items-center rounded-lg ${d.color === 'coral'
                                ? 'bg-[#ffe5df] text-[#e26d5a]'
                                : d.color === 'violet'
                                  ? 'bg-[#eee9ff] text-[#7763d9]'
                                  : 'bg-[#dff7ee] text-[#2d9b75]'
                              }`}
                          >
                            <FileText className="size-3.5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-[#302b4b]">
                              {d.name}
                            </p>
                            <p className="text-[10px] text-[#aaa4bc]">
                              {d.size} · {d.pages}
                            </p>
                          </div>
                        </div>

                        {/* Status / Delete */}
                        <div className="flex items-center gap-1">
                          {d.status === 'uploading' || d.status === 'indexing' ? (
                            <Loader2 className="size-3.5 animate-spin text-[#7763d9]" />
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteDoc(d.id)
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-[#aaa4bc] hover:text-[#e26d5a] rounded"
                              title="Delete file"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Animated Upload Status Bar if uploading or indexing */}
                      {(d.status === 'uploading' || d.status === 'indexing') && (
                        <div className="w-full bg-[#f0edf7] rounded-full h-1 overflow-hidden">
                          <motion.div
                            className="bg-[#7763d9] h-full"
                            initial={{ width: '0%' }}
                            animate={{ width: d.status === 'indexing' ? '100%' : `${d.uploadProgress || 65}%` }}
                            transition={{ duration: 0.4 }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
        </div>
      </div>

      {/* Footer: Personal Workspace Card & Settings */}
      <div className="border-t border-[#f0edf7] p-3 space-y-2">
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#faf8fe] to-[#f4f0fd] border border-[#ebe5f7] p-3 shadow-2xs">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#8b74f5] to-[#7763d9] text-white shadow-sm shadow-[#8b74f5]/25">
            <Sparkles className="size-4" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-[#282344]">
              Personal Workspace
            </p>
            <p className="truncate text-[10px] text-[#7e7697]">
              Your dedicated study space.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#524b70] transition hover:bg-[#f6f3fe] hover:text-[#7763d9]"
          title="Study Workspace Settings"
        >
          <Settings className="size-4 shrink-0 text-[#89849e]" />
          <span>Settings</span>
        </button>

        {onLock && (
          <button
            onClick={onLock}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#7e7399] transition hover:bg-[#fff0ed] hover:text-[#e26d5a]"
            title="Lock workspace immediately"
          >
            <Lock className="size-4 shrink-0 text-[#89849e]" />
            <span>Lock Workspace</span>
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Animated Sidebar Container */}
      <motion.aside
        animate={{ width: isCollapsed ? 70 : 280 }}
        transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
        className="hidden lg:flex shrink-0 flex-col border-r border-[#ebe7f4] bg-white h-screen sticky top-0 z-30 select-none"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isCollapsed ? (
            <motion.div
              key="collapsed-rail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="h-full w-[70px]"
            >
              {collapsedContent}
            </motion.div>
          ) : (
            <motion.div
              key="expanded-sidebar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="h-full w-[280px]"
            >
              {expandedContent}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

      {/* Mobile Drawer (Always Full Expanded 285px) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-[#282344]/30 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[285px] flex-col bg-white shadow-2xl lg:hidden"
            >
              {expandedContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
