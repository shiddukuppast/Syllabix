'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Bookmark,
  FileText,
  ChevronDown,
} from 'lucide-react'
import { Message, SourceReference, LoadingAnimationTheme, SavedNote } from './types'
import { ThinkingIndicator } from './thinking-indicator'
import { FormattedMessage } from './formatted-message'
import { SourceViewer } from './source-viewer'
import { stripInlineSources, mergeSources } from '@/lib/source-utils'

interface ChatViewProps {
  messages: Message[]
  isThinking: boolean
  onCopyAnswer: (text: string) => void
  onRegenerate: () => void
  onViewSource: (source: SourceReference) => void
  fontSize?: 'normal' | 'large' | 'compact'
  loadingAnimation?: LoadingAnimationTheme
  savedNotes?: SavedNote[]
  onSaveNote?: (msg: Message, cleanContent: string, sources: SourceReference[]) => void
}

export function ChatView({
  messages,
  isThinking,
  onCopyAnswer,
  onRegenerate,
  onViewSource,
  fontSize = 'normal',
  loadingAnimation = 'couple',
  savedNotes = [],
  onSaveNote,
}: ChatViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({})
  const [openSources, setOpenSources] = useState<Record<string, boolean>>({})

  const handleCopy = (id: string, text: string) => {
    onCopyAnswer(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleSources = (id: string) => {
    setOpenSources((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleSaveFallback = (id: string) => {
    setSavedMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const textSizeClass =
    fontSize === 'large'
      ? 'text-base leading-relaxed'
      : fontSize === 'compact'
      ? 'text-[13px] leading-normal'
      : 'text-sm leading-7'

  return (
    <div className="flex flex-col gap-8 pb-10">
      <AnimatePresence initial={false}>
        {messages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex justify-end"
              >
                <div className="max-w-[85%] rounded-[1.4rem] rounded-tr-md bg-gradient-to-r from-[#7763d9] to-[#8172d2] px-5 py-3.5 text-sm leading-relaxed text-white shadow-md shadow-[#7763d9]/15">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="mt-1 block text-right text-[10px] text-white/70">
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            )
          }

          // Strip any inline "Source: ..." lines from the answer for a clean academic reading experience
          const { cleanText, extractedSources } = stripInlineSources(msg.content)
          const effectiveSources = mergeSources(msg.sources, extractedSources)
          const hasSources = effectiveSources && effectiveSources.length > 0
          const isSourcesOpen = Boolean(openSources[msg.id])

          const isSaved =
            savedNotes.some((n) => n.messageId === msg.id || n.id === msg.id) ||
            Boolean(savedMap[msg.id])

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="flex items-start gap-3.5 sm:gap-4"
            >
              {/* Syllabix Assistant Avatar */}
              <div className="grid size-9 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#f1edfe] to-[#e4dcfc] text-[#7763d9] shadow-xs">
                <Sparkles className="size-4" />
              </div>

              {/* Main Study Note Answer Card */}
              <div className="flex-1 max-w-3xl">
                <div className="rounded-2xl border border-[#ece7f6] bg-white p-5 sm:p-7 shadow-xs transition-all hover:border-[#ded5f2]">
                  {/* Clean Answer Header */}
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#f2edf9] pb-3.5">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5dcfa] bg-[#f8f5fe] px-2.5 py-1 text-xs font-semibold text-[#6853cc]">
                        <BookOpen className="size-3.5 text-[#7763d9]" />
                        <span>From Your Syllabus</span>
                      </div>
                      <span className="hidden sm:inline-block rounded-full bg-[#f3effe] px-2 py-0.5 text-[10px] font-medium text-[#736a93]">
                        Study Note
                      </span>
                    </div>

                    <span className="text-[11px] font-medium text-[#aaa4bc]">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Formatted Academic Answer Content (Clean text, uninterrupted by citation lines) */}
                  <div className={`text-[#342d4d] ${textSizeClass}`}>
                    <FormattedMessage content={cleanText} />
                  </div>

                  {/* Additional AI Knowledge / Supplementary Insights Card */}
                  {msg.additionalKnowledge && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.35 }}
                      className="mt-5 rounded-2xl border border-[#e9e1f7] bg-gradient-to-br from-[#faf8fe] via-[#f9f6fd] to-[#f4effc] border-l-[4px] border-l-[#7763d9] p-4 sm:p-5 shadow-2xs"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex size-6 items-center justify-center rounded-lg bg-[#eee9ff] text-[#7763d9] shadow-2xs">
                            <Sparkles className="size-3.5" />
                          </div>
                          <h4 className="text-xs sm:text-[13px] font-bold text-[#44386e] tracking-tight">
                            Additional AI Insights
                          </h4>
                          <span className="rounded-full bg-[#eee9ff] px-2 py-0.5 text-[10px] font-semibold text-[#6853cc]">
                            Supplementary
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-[#9a91b4] hidden sm:inline">
                          Beyond Syllabus
                        </span>
                      </div>

                      <div className="text-xs sm:text-[13px] text-[#473e65] leading-relaxed">
                        <FormattedMessage
                          content={msg.additionalKnowledge}
                          variant="insights"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Action Toolbar: Copy, Regenerate, View Sources, Save note */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#f2edf9] pt-3.5 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopy(msg.id, cleanText)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#e8e2f4] bg-white px-3 text-xs font-medium text-[#5a5276] shadow-2xs transition hover:bg-[#f6f2fd] hover:text-[#7763d9] hover:border-[#cfc3f5] active:scale-[0.98]"
                        title="Copy clean answer to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="size-3.5 text-[#2d9b75]" />
                            <span className="text-[#2d9b75] font-semibold">
                              Copied!
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5 text-[#736c8d]" />
                            <span>Copy answer</span>
                          </>
                        )}
                      </button>

                      {/* Regenerate Button */}
                      <button
                        onClick={onRegenerate}
                        disabled={isThinking}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#e8e2f4] bg-white px-3 text-xs font-medium text-[#5a5276] shadow-2xs transition hover:bg-[#f6f2fd] hover:text-[#7763d9] hover:border-[#cfc3f5] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Regenerate this answer using updated context"
                      >
                        <RotateCcw
                          className={`size-3.5 text-[#736c8d] ${
                            isThinking ? 'animate-spin' : ''
                          }`}
                        />
                        <span>Regenerate</span>
                      </button>

                      {/* On-Demand View Sources Button (Displayed only when sources are available) */}
                      {hasSources && (
                        <button
                          onClick={() => toggleSources(msg.id)}
                          className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition active:scale-[0.98] ${
                            isSourcesOpen
                              ? 'border-[#7763d9] bg-[#f2effd] text-[#6555be] font-semibold shadow-2xs'
                              : 'border-[#e8e2f4] bg-white text-[#5a5276] hover:bg-[#f6f2fd] hover:text-[#7763d9] hover:border-[#cfc3f5]'
                          }`}
                          title={
                            isSourcesOpen
                              ? 'Hide grounded syllabus sources'
                              : 'View grounded syllabus sources'
                          }
                        >
                          <FileText
                            className={`size-3.5 ${
                              isSourcesOpen ? 'text-[#7763d9]' : 'text-[#736c8d]'
                            }`}
                          />
                          <span>View Sources</span>
                          <ChevronDown
                            className={`size-3 text-[#89849e] transition-transform duration-200 ${
                              isSourcesOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Save Note Button */}
                    <button
                      onClick={() => {
                        if (onSaveNote) {
                          onSaveNote(msg, cleanText, effectiveSources)
                        } else {
                          toggleSaveFallback(msg.id)
                        }
                      }}
                      className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition active:scale-[0.98] ${
                        isSaved
                          ? 'border-[#7763d9] bg-[#f2effd] text-[#7763d9] font-semibold'
                          : 'border-[#e8e2f4] bg-white text-[#6e6888] hover:bg-[#f6f2fd] hover:text-[#7763d9] hover:border-[#cfc3f5]'
                      }`}
                      title={
                        isSaved
                          ? 'Saved to study notes'
                          : 'Save note for exam revision'
                      }
                    >
                      <Bookmark
                        className={`size-3.5 ${
                          isSaved
                            ? 'fill-[#7763d9] text-[#7763d9]'
                            : 'text-[#736c8d]'
                        }`}
                      />
                      <span>
                        {isSaved ? 'Saved note' : 'Save note'}
                      </span>
                    </button>
                  </div>

                  {/* Expandable Grounded Source References Panel (Hidden by default, shown on demand) */}
                  <AnimatePresence>
                    {isSourcesOpen && hasSources && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <SourceViewer
                          sources={effectiveSources}
                          onViewSource={onViewSource}
                          variant="chat"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* AI Thinking Animation with Selected Theme */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            key="thinking-indicator-wrapper"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
          >
            <ThinkingIndicator animationTheme={loadingAnimation} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
