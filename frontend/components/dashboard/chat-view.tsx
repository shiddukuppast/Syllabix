'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  FileText,
  Copy,
  Check,
  RotateCw,
  ExternalLink,
  ThumbsUp,
  BookOpen,
  Lightbulb,
} from 'lucide-react'
import { Message, SourceReference } from './types'
import { ThinkingIndicator } from './thinking-indicator'
import { FormattedMessage } from './formatted-message'

interface ChatViewProps {
  messages: Message[]
  isThinking: boolean
  onCopyAnswer: (text: string) => void
  onRegenerate: () => void
  onViewSource: (source: SourceReference) => void
  fontSize?: 'normal' | 'large' | 'compact'
}

interface GroupedSource {
  docName: string
  items: SourceReference[]
}

export function ChatView({
  messages,
  isThinking,
  onCopyAnswer,
  onRegenerate,
  onViewSource,
  fontSize = 'normal',
}: ChatViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({})

  const handleCopy = (id: string, text: string) => {
    onCopyAnswer(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleLike = (id: string) => {
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const textSizeClass =
    fontSize === 'large'
      ? 'text-base leading-relaxed'
      : fontSize === 'compact'
      ? 'text-[13px] leading-normal'
      : 'text-sm leading-7'

  // Helper to group citations by document name
  const getGroupedSources = (sources: SourceReference[]): GroupedSource[] => {
    const map: Record<string, SourceReference[]> = {}
    sources.forEach((src) => {
      const name = src.docName || 'Document'
      if (!map[name]) map[name] = []
      map[name].push(src)
    })
    return Object.entries(map).map(([docName, items]) => ({ docName, items }))
  }

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

          // Assistant Response Card (Academic Study Note Presentation)
          const groupedSources = msg.sources && msg.sources.length > 0 ? getGroupedSources(msg.sources) : []

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="flex items-start gap-3.5 sm:gap-4"
            >
              {/* Syllabix Assistant Avatar */}
              <div className="grid size-9 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#ffe5df] to-[#fdeae6] text-[#e17863] shadow-xs">
                <Sparkles className="size-4" />
              </div>

              {/* Main Study Note Answer Card */}
              <div className="flex-1 max-w-3xl">
                <div className="rounded-2xl border border-[#ebe7f4] bg-white p-5 sm:p-7 shadow-xs transition-all hover:border-[#dfd7f2]">
                  {/* Clean Answer Header */}
                  <div className="mb-4 flex items-center justify-between border-b border-[#f2edf9] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-5 items-center justify-center rounded-md bg-gradient-to-br from-[#7763d9] to-[#ee8a7a] text-white shadow-2xs">
                        <Sparkles className="size-3" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#7763d9]">
                        AI Answer
                      </span>
                      <span className="hidden sm:inline-block rounded-full bg-[#f3effe] px-2 py-0.5 text-[10px] font-semibold text-[#6853cc]">
                        Study Note
                      </span>
                    </div>

                    <span className="text-[11px] font-medium text-[#aaa4bc]">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Formatted Academic Answer Content */}
                  <div className={`text-[#383152] ${textSizeClass}`}>
                    <FormattedMessage content={msg.content} />
                  </div>

                  {/* Grounded Source References */}
                  {groupedSources.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.35 }}
                      className="mt-6 border-t border-[#f0ebf8] pt-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#3d3460] flex items-center gap-1.5">
                            <BookOpen className="size-3.5 text-[#7763d9]" /> Sources
                          </span>
                          <span className="rounded-full bg-[#f1edfe] px-2 py-0.5 text-[10px] font-semibold text-[#7763d9]">
                            {msg.sources!.length} {msg.sources!.length === 1 ? 'citation' : 'citations'}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2d9b75] bg-[#e6f8f1] px-2.5 py-0.5 rounded-full">
                          <Check className="size-3" /> Grounded in Syllabus
                        </span>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        {groupedSources.map((group, i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-[#ebe4f7] bg-[#fbf9fe] p-3.5 text-xs transition hover:border-[#cfc3f5] hover:bg-white shadow-2xs"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className="flex size-7 items-center justify-center rounded-lg bg-[#eee9ff] text-[#7763d9]">
                                  <FileText className="size-4" />
                                </span>
                                <div>
                                  <p className="font-bold text-[#2a2346] text-xs sm:text-[13px]">
                                    {group.docName}
                                  </p>
                                  <div className="mt-1 flex flex-wrap gap-1.5">
                                    {group.items.map((src, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => onViewSource(src)}
                                        className="inline-flex items-center gap-1 rounded-md border border-[#e5dcfa] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#6853cc] hover:bg-[#eee9ff] transition"
                                        title="Click to view extracted context"
                                      >
                                        <span>{src.page}</span>
                                        <ExternalLink className="size-2.5" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => onViewSource(group.items[0])}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#e8e2f4] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#7763d9] hover:bg-[#f3effe] transition shadow-2xs"
                              >
                                <span>View extract</span>
                                <ExternalLink className="size-3" />
                              </button>
                            </div>

                            {/* Snippet preview */}
                            {group.items[0].snippet && (
                              <p className="mt-2.5 text-[11px] text-[#6d6688] line-clamp-2 border-t border-[#f0eaf8] pt-2 italic">
                                “{group.items[0].snippet}”
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Additional AI Knowledge Card */}
                  {msg.additionalKnowledge && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.35 }}
                      className="mt-4 rounded-xl border border-[#fedecb] bg-gradient-to-br from-[#fffbf8] to-[#fff6f0] p-3.5 text-xs text-[#5c4a3e]"
                    >
                      <div className="mb-1 flex items-center gap-1.5 font-bold text-[#d9674f]">
                        <Lightbulb className="size-3.5" />
                        <span>Additional AI Knowledge & Synthesis</span>
                      </div>
                      <div className="leading-relaxed whitespace-pre-line text-[#6a5649]">
                        {msg.additionalKnowledge}
                      </div>
                    </motion.div>
                  )}

                  {/* Action Toolbar: Copy, Regenerate, Like */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#f2edf9] pt-3.5 text-xs">
                    <div className="flex items-center gap-2">
                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e2f4] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#5a5276] shadow-2xs transition hover:bg-[#f6f2fd] hover:text-[#7763d9] hover:border-[#cfc3f5]"
                        title="Copy answer to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="size-3.5 text-[#2d9b75]" />
                            <span className="text-[#2d9b75] font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            <span>Copy answer</span>
                          </>
                        )}
                      </button>

                      {/* Regenerate Button */}
                      <button
                        onClick={onRegenerate}
                        disabled={isThinking}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e2f4] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#5a5276] shadow-2xs transition hover:bg-[#f6f2fd] hover:text-[#7763d9] hover:border-[#cfc3f5] disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Regenerate this answer using updated context"
                      >
                        <RotateCw
                          className={`size-3.5 ${isThinking ? 'animate-spin' : ''}`}
                        />
                        <span>Regenerate</span>
                      </button>
                    </div>

                    {/* Helpful Button */}
                    <button
                      onClick={() => toggleLike(msg.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                        likedMap[msg.id]
                          ? 'border-[#7763d9] bg-[#f2effd] text-[#7763d9]'
                          : 'border-[#e8e2f4] bg-white text-[#6e6888] hover:bg-[#f6f2fd]'
                      }`}
                      title={likedMap[msg.id] ? 'Marked as helpful' : 'Mark as helpful for exam revision'}
                    >
                      <ThumbsUp className="size-3.5" />
                      <span className="hidden sm:inline">
                        {likedMap[msg.id] ? 'Helpful' : 'Save note'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* AI Thinking Animation */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            key="thinking-indicator-wrapper"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
          >
            <ThinkingIndicator />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
