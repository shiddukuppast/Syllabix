'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Paperclip,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  FileText,
  X,
  UploadCloud,
  Check,
} from 'lucide-react'
import { StudyMode } from './types'

interface ChatInputProps {
  query: string
  setQuery: (val: string) => void
  onSubmit: () => void
  mode: StudyMode
  setMode: (mode: StudyMode) => void
  onFilesSelected: (files: FileList | File[]) => void
  isThinking?: boolean
  placeholder?: string
}

export function ChatInput({
  query,
  setQuery,
  onSubmit,
  mode,
  setMode,
  onFilesSelected,
  isThinking = false,
  placeholder = 'Ask a question about your syllabus, exam topics, or notes...',
}: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showModeMenu, setShowModeMenu] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const modeMenuRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea smoothly as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const newHeight = Math.min(textareaRef.current.scrollHeight, 180)
      textareaRef.current.style.height = `${Math.max(newHeight, 52)}px`
    }
  }, [query])

  // Close mode menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target as Node)) {
        setShowModeMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if (query.trim() && !isThinking) {
        handleSubmit()
      }
    }
  }

  const handleSubmit = () => {
    if ((query.trim() || attachedFiles.length > 0) && !isThinking) {
      onSubmit()
      setAttachedFiles([])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter((file) => {
        const ext = file.name.split('.').pop()?.toLowerCase()
        return ext === 'pdf' || ext === 'docx' || ext === 'pptx'
      })
      if (validFiles.length > 0) {
        setAttachedFiles((prev) => [...prev, ...validFiles])
        onFilesSelected(validFiles)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      setAttachedFiles((prev) => [...prev, ...files])
      onFilesSelected(files)
      // reset so same file can be re-selected if removed
      e.target.value = ''
    }
  }

  const removeAttachedFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative w-full"
    >
      {/* Hidden File Input supporting PDF, DOCX, PPTX */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Drag & Drop Visual Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed border-[#7763d9] bg-[#fbfaff]/95 p-6 backdrop-blur-md"
          >
            <div className="grid size-12 place-items-center rounded-2xl bg-[#eee9ff] text-[#7763d9] shadow-inner">
              <UploadCloud className="size-6 animate-bounce" />
            </div>
            <p className="mt-2 text-sm font-bold text-[#302b4b]">
              Drop your syllabus documents here
            </p>
            <p className="text-xs text-[#7763d9]">
              Accepts PDF, DOCX, and PPTX
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Composer Box with Animated Border Gradient when Focused */}
      <div
        className={`relative rounded-[1.75rem] p-[1.5px] transition-all duration-300 ${
          isFocused
            ? 'bg-gradient-to-r from-[#7763d9] via-[#ee8a7a] to-[#72bea0] shadow-xl shadow-[#7763d9]/15'
            : 'border border-[#ded6ef] bg-white shadow-lg shadow-[#8172c8]/5'
        }`}
      >
        <div className="relative rounded-[1.65rem] bg-white p-2.5 sm:p-3">
          {/* Attached Files Pills (if user attached before sending) */}
          {attachedFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2 px-2 pt-1">
              {attachedFiles.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2dcf5] bg-[#f7f5fd] px-3 py-1 text-xs font-semibold text-[#6555be]"
                >
                  <FileText className="size-3.5 text-[#7763d9]" />
                  <span className="max-w-[140px] truncate">{f.name}</span>
                  <button
                    onClick={() => removeAttachedFile(i)}
                    className="ml-1 rounded p-0.5 text-[#aaa4bc] hover:bg-[#e9e4f7] hover:text-[#282344]"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Smooth Auto-Expanding Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent px-3 py-2 text-sm text-[#282344] outline-none placeholder:text-[#a59fb6] leading-relaxed transition-all duration-200"
            style={{ minHeight: '52px' }}
          />

          {/* Bottom Bar: Attachment, Mode Selector, Send Button */}
          <div className="flex items-center justify-between border-t border-[#f4f1f9] px-2 pt-2.5">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Attachment Button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => fileInputRef.current?.click()}
                title="Attach notes or slides (PDF, DOCX, PPTX)"
                className="group relative flex items-center gap-1.5 rounded-xl p-2 text-[#9891ac] transition-colors hover:bg-[#f5f1fe] hover:text-[#7763d9]"
              >
                <Paperclip className="size-4" />
                <span className="hidden text-xs font-medium sm:inline">Attach</span>
              </motion.button>

              {/* Mode Selector Dropdown */}
              <div className="relative" ref={modeMenuRef}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowModeMenu(!showModeMenu)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#f6f3ff] px-3 py-1.5 text-xs font-semibold text-[#6555be] transition hover:bg-[#ede8fc]"
                >
                  {mode === 'Syllabus + AI' ? (
                    <Sparkles className="size-3.5 text-[#8172d2]" />
                  ) : (
                    <ShieldCheck className="size-3.5 text-[#2d9b75]" />
                  )}
                  <span>{mode}</span>
                  <ChevronDown
                    className={`size-3 text-[#8172d2] transition-transform duration-200 ${
                      showModeMenu ? 'rotate-180' : ''
                    }`}
                  />
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showModeMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-0 bottom-full mb-2 z-40 w-64 rounded-2xl border border-[#ebe7f4] bg-white p-2 shadow-xl shadow-[#7763d9]/10 backdrop-blur-md"
                    >
                      <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#aaa4bc]">
                        Study Retrieval Mode
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('Syllabus + AI')
                          setShowModeMenu(false)
                        }}
                        className={`flex w-full items-start gap-2.5 rounded-xl p-2.5 text-left transition ${
                          mode === 'Syllabus + AI'
                            ? 'bg-[#f5f1fe] text-[#6555be]'
                            : 'hover:bg-[#faf9fd] text-[#4a4369]'
                        }`}
                      >
                        <Sparkles className="mt-0.5 size-4 shrink-0 text-[#8172d2]" />
                        <div className="flex-1">
                          <p className="text-xs font-bold">Syllabus + AI</p>
                          <p className="mt-0.5 text-[11px] leading-tight text-[#8a849e]">
                            Synthesizes uploaded notes with broader AI explanations and exam tips.
                          </p>
                        </div>
                        {mode === 'Syllabus + AI' && (
                          <Check className="size-4 text-[#7763d9]" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMode('Strict Syllabus')
                          setShowModeMenu(false)
                        }}
                        className={`flex w-full items-start gap-2.5 rounded-xl p-2.5 text-left transition ${
                          mode === 'Strict Syllabus'
                            ? 'bg-[#eefbf6] text-[#2d9b75]'
                            : 'hover:bg-[#faf9fd] text-[#4a4369]'
                        }`}
                      >
                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#2d9b75]" />
                        <div className="flex-1">
                          <p className="text-xs font-bold">Strict Syllabus</p>
                          <p className="mt-0.5 text-[11px] leading-tight text-[#8a849e]">
                            Restricts answers strictly to text cited directly inside your uploaded materials.
                          </p>
                        </div>
                        {mode === 'Strict Syllabus' && (
                          <Check className="size-4 text-[#2d9b75]" />
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Animated Send Button */}
            <div className="flex items-center gap-2">
              <span className="hidden text-[10px] font-medium text-[#b5afc4] md:inline">
                Enter ↵ to send
              </span>
              <motion.button
                type="button"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                disabled={(!query.trim() && attachedFiles.length === 0) || isThinking}
                onClick={handleSubmit}
                aria-label="Send question"
                className={`relative grid size-9 place-items-center rounded-xl transition-all duration-200 ${
                  query.trim() || attachedFiles.length > 0
                    ? 'bg-[#282344] text-white shadow-md shadow-[#282344]/20 hover:bg-[#3c3561]'
                    : 'bg-[#f0edf6] text-[#aaa4bc] cursor-not-allowed'
                }`}
              >
                <Send className="size-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
