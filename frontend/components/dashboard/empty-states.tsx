'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquareDashed, FileSearch, SearchX, Plus, Upload, X } from 'lucide-react'

interface EmptyConversationsProps {
  onNewChat: () => void
}

export function EmptyConversations({ onNewChat }: EmptyConversationsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="relative mb-3 grid size-12 place-items-center rounded-2xl bg-[#eee9ff] text-[#7763d9]">
        <MessageSquareDashed className="size-6" />
      </div>
      <h3 className="text-xs font-bold text-[#302b4b]">No past conversations</h3>
      <p className="mt-1 max-w-[190px] text-[11px] leading-relaxed text-[#8a849e]">
        Start your first study session to review topics and save your questions.
      </p>
      <button
        onClick={onNewChat}
        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#7763d9] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#6552c7]"
      >
        <Plus className="size-3.5" />
        New conversation
      </button>
    </motion.div>
  )
}

interface EmptyDocumentsProps {
  onUpload: () => void
}

export function EmptyDocuments({ onUpload }: EmptyDocumentsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="relative mb-3 grid size-12 place-items-center rounded-2xl bg-[#dff7ee] text-[#2d9b75]">
        <FileSearch className="size-6" />
      </div>
      <h3 className="text-xs font-bold text-[#302b4b]">No study materials yet</h3>
      <p className="mt-1 max-w-[190px] text-[11px] leading-relaxed text-[#8a849e]">
        Add lecture slides or textbook chapters in PDF, DOCX, or PPTX format.
      </p>
      <button
        onClick={onUpload}
        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#282344] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3c3561]"
      >
        <Upload className="size-3.5" />
        Upload material
      </button>
    </motion.div>
  )
}

interface EmptySearchProps {
  searchTerm: string
  onClear: () => void
}

export function EmptySearch({ searchTerm, onClear }: EmptySearchProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-5 text-center"
    >
      <div className="relative mb-3 grid size-11 place-items-center rounded-2xl bg-[#ffe5df] text-[#e26d5a]">
        <SearchX className="size-5" />
      </div>
      <h3 className="text-xs font-bold text-[#302b4b]">No results found</h3>
      <p className="mt-1 max-w-[180px] text-[11px] leading-relaxed text-[#8a849e]">
        No conversations matching <span className="font-semibold text-[#282344]">"{searchTerm}"</span>.
      </p>
      <button
        onClick={onClear}
        className="mt-3 inline-flex items-center gap-1 rounded-lg border border-[#e3deef] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#6555be] shadow-sm hover:bg-[#f8f6ff]"
      >
        <X className="size-3" />
        Clear filter
      </button>
    </motion.div>
  )
}

