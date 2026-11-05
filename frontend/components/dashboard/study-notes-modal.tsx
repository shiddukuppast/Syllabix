'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bookmark,
  X,
  Search,
  BookOpen,
} from 'lucide-react'
import { SavedNote, SourceReference } from './types'
import { SavedNoteCard } from './saved-note-card'

interface StudyNotesModalProps {
  isOpen: boolean
  onClose: () => void
  notes: SavedNote[]
  onDeleteNote: (id: string) => void
  onCopyNote: (text: string) => void
  onViewSource?: (source: SourceReference) => void
}

export function StudyNotesModal({
  isOpen,
  onClose,
  notes,
  onDeleteNote,
  onCopyNote,
  onViewSource,
}: StudyNotesModalProps) {
  const [searchTerm, setSearchTerm] = useState('')

  if (!isOpen) return null

  const filteredNotes = notes.filter((n) => {
    const q = (n.question || '').toLowerCase()
    const c = (n.content || '').toLowerCase()
    const term = searchTerm.toLowerCase()
    return q.includes(term) || c.includes(term)
  })

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#282344]/40 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative flex flex-col w-full max-w-4xl max-h-[88vh] rounded-3xl border border-[#ebe5f7] bg-white shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0ebf8] bg-[#fbfaff]">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#8b74f5] to-[#7763d9] text-white shadow-md shadow-[#8b74f5]/20">
                <Bookmark className="size-5 fill-white" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-[#282344]">
                    Saved Study Notes
                  </h3>
                  <span className="rounded-full bg-[#f1edfe] px-2.5 py-0.5 text-xs font-semibold text-[#6853cc]">
                    {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                  </span>
                </div>
                <p className="text-xs text-[#7e7697]">
                  Clean exam revision notes with on-demand syllabus verification.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="grid size-8 place-items-center rounded-xl text-[#89849e] hover:bg-[#f5f2fb] hover:text-[#282344] transition"
              aria-label="Close notes modal"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Search Bar */}
          {notes.length > 0 && (
            <div className="px-6 py-3 border-b border-[#f4f0fa] bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#a8a1bd]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search saved notes by question or keyword..."
                  className="w-full rounded-xl border border-[#ebe7f4] bg-[#fbf9fe] py-2 pl-9 pr-8 text-xs sm:text-sm text-[#282344] outline-none transition focus:border-[#7763d9] focus:bg-white placeholder:text-[#aaa4bc]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa4bc] hover:text-[#282344]"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 content-scroll">
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="grid size-14 place-items-center rounded-2xl bg-[#f5f2fb] text-[#7763d9] mb-4">
                  <BookOpen className="size-7" />
                </div>
                <h4 className="text-base font-bold text-[#282344] mb-1">
                  No Saved Notes Yet
                </h4>
                <p className="text-xs sm:text-sm text-[#7e7697] max-w-sm">
                  Click the <span className="font-semibold text-[#7763d9]">Save note</span> button on any AI answer in chat to store it here for your exams.
                </p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-[#7e7697]">
                <p className="text-sm font-medium">No notes match &ldquo;{searchTerm}&rdquo;</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-xs font-semibold text-[#7763d9] hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredNotes.map((note) => (
                  <SavedNoteCard
                    key={note.id}
                    note={note}
                    onDelete={onDeleteNote}
                    onCopy={onCopyNote}
                    onViewSource={onViewSource}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

