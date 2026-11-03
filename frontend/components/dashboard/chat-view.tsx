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

interface ChatViewProps {
  messages: Message[]
  isThinking: boolean
  onCopyAnswer: (text: string) => void
  onRegenerate: () => void
  onViewSource: (source: SourceReference) => void
  fontSize?: 'normal' | 'large' | 'compact'
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

  return (
    <div className="flex flex-col gap-8 pb-10">
      <AnimatePresence initial={false}>
        {messages.map((msg, index) => {
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

          // Assistant Response
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="flex items-start gap-3.5 sm:gap-4"
            >
              {/* Syllabix Assistant Avatar */}
              <div className="grid size-9 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#ffe5df] to-[#fdeae6] text-[#e17863] shadow-sm">
                <Sparkles className="size-4" />
              </div>

              {/* Main Answer Card */}
              <div className="flex-1 max-w-3xl">
                <div className="rounded-2xl border border-[#ebe7f4] bg-white p-5 sm:p-6 shadow-sm">
                  {/* Message Content */}
                  <div className={`text-[#3f3956] ${textSizeClass}`}>
                    <FormattedMessageContent content={msg.content} />
                  </div>

                  {/* Grounded Source References */}
                  {msg.sources && msg.sources.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.35 }}
                      className="mt-6 border-t border-[#f0ebf8] pt-4"
                    >
                      <div className="mb-2.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-[#4c446c]">
                          <BookOpen className="size-3.5 text-[#7763d9]" /> Grounded In Syllabus
                        </span>
                        <span className="text-[11px] font-semibold text-[#2d9b75] bg-[#e6f8f1] px-2 py-0.5 rounded-full">
                          Verified match
                        </span>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        {msg.sources.map((src, i) => (
                          <div
                            key={i}
                            className="group flex flex-col justify-between rounded-xl border border-[#e8e2f4] bg-[#faf8fe] p-3 text-xs transition hover:border-[#bdaff2] hover:bg-white sm:flex-row sm:items-center gap-2"
                          >
                            <div className="flex items-start gap-2.5">
                              <span
                                className={`mt-0.5 grid size-6 place-items-center rounded-md ${
                                  src.color === 'coral'
                                    ? 'bg-[#ffe5df] text-[#e26d5a]'
                                    : src.color === 'violet'
                                    ? 'bg-[#eee9ff] text-[#7763d9]'
                                    : 'bg-[#dff7ee] text-[#2d9b75]'
                                }`}
                              >
                                <FileText className="size-3.5" />
                              </span>
                              <div>
                                <div className="flex items-center gap-2 font-semibold text-[#302b4b]">
                                  <span>{src.docName}</span>
                                  <span className="rounded bg-white px-1.5 py-0.2 text-[10px] text-[#7763d9] border border-[#e8e2f4]">
                                    {src.page}
                                  </span>
                                </div>
                                <p className="mt-1 text-[11px] text-[#7e7795] line-clamp-2">
                                  “{src.snippet}”
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => onViewSource(src)}
                              className="self-end sm:self-auto inline-flex items-center gap-1 text-[11px] font-semibold text-[#7763d9] hover:underline"
                            >
                              <span>View extract</span>
                              <ExternalLink className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Additional AI Knowledge Visually Distinct Card */}
                  {msg.additionalKnowledge && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.35 }}
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

                  {/* Action Bar: Copy, Regenerate, Like */}
                  <div className="mt-5 flex items-center justify-between border-t border-[#f4effa] pt-3.5 text-xs">
                    <span className="text-[11px] text-[#aaa4bc]">{msg.timestamp}</span>

                    <div className="flex items-center gap-2">
                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e2f4] bg-white px-2.5 py-1.5 text-xs text-[#6e6888] transition hover:bg-[#f6f2fd] hover:text-[#7763d9]"
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
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e2f4] bg-white px-2.5 py-1.5 text-xs text-[#6e6888] transition hover:bg-[#f6f2fd] hover:text-[#7763d9] disabled:opacity-50"
                      >
                        <RotateCw
                          className={`size-3.5 ${isThinking ? 'animate-spin' : ''}`}
                        />
                        <span>Regenerate</span>
                      </button>

                      {/* Helpful Button */}
                      <button
                        onClick={() => toggleLike(msg.id)}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition ${
                          likedMap[msg.id]
                            ? 'border-[#7763d9] bg-[#f2effd] text-[#7763d9]'
                            : 'border-[#e8e2f4] bg-white text-[#6e6888] hover:bg-[#f6f2fd]'
                        }`}
                        title="Helpful for revision"
                      >
                        <ThumbsUp className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* AI Thinking Animation */}
      {isThinking && <ThinkingIndicator />}
    </div>
  )
}

// Simple Markdown-style clean rendering for exam answers
function FormattedMessageContent({ content }: { content: string }) {
  const lines = content.split('\n')

  return (
    <div className="space-y-3">
      {lines.map((line, idx) => {
        const trimmed = line.trim()

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-base sm:text-lg font-bold text-[#282344] mt-2 mb-1">
              {trimmed.replace('### ', '')}
            </h3>
          )
        }

        if (trimmed.startsWith('#### ')) {
          return (
            <h4 key={idx} className="text-sm font-bold text-[#443b66] mt-2 mb-0.5">
              {trimmed.replace('#### ', '')}
            </h4>
          )
        }

        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          // Table separator or row
          if (trimmed.includes('---')) return null
          const cells = trimmed
            .split('|')
            .filter((c, i, a) => i !== 0 && i !== a.length - 1)
            .map((c) => c.trim())
          return (
            <div
              key={idx}
              className="grid grid-cols-3 gap-2 rounded-lg bg-[#fbf9fe] p-2 text-xs border border-[#eee8f7]"
            >
              {cells.map((cell, cIdx) => (
                <div key={cIdx} className={cIdx === 0 ? 'font-bold text-[#282344]' : 'text-[#5d567c]'}>
                  {cell.replace(/\*\*/g, '')}
                </div>
              ))}
            </div>
          )
        }

        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#7763d9]" />
              <div
                className="flex-1"
                dangerouslySetInnerHTML={{
                  __html: formatInlineMarkdown(trimmed.substring(2)),
                }}
              />
            </div>
          )
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const num = trimmed.match(/^\d+\./)?.[0]
          const rest = trimmed.replace(/^\d+\.\s*/, '')
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="font-bold text-[#7763d9] shrink-0 text-xs mt-0.5">{num}</span>
              <div
                className="flex-1"
                dangerouslySetInnerHTML={{
                  __html: formatInlineMarkdown(rest),
                }}
              />
            </div>
          )
        }

        if (!trimmed) {
          return <div key={idx} className="h-1" />
        }

        return (
          <p
            key={idx}
            dangerouslySetInnerHTML={{
              __html: formatInlineMarkdown(line),
            }}
          />
        )
      })}
    </div>
  )
}

function formatInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/`(.*?)`/g, '<code class="bg-[#eee9ff] text-[#7763d9] px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/\$(.*?)\$/g, '<span class="font-mono bg-[#f4effe] text-[#6555be] px-1 py-0.5 rounded text-xs">$1</span>')
}

