'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Check, FileText, ExternalLink, ChevronDown } from 'lucide-react'
import { SourceReference } from './types'
import { groupAndDeduplicateSources } from '@/lib/source-utils'

interface SourceViewerProps {
  sources: SourceReference[]
  onViewSource?: (source: SourceReference) => void
  variant?: 'chat' | 'note'
  className?: string
}

export function SourceViewer({
  sources,
  onViewSource,
  variant = 'chat',
  className = '',
}: SourceViewerProps) {
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({})

  const groupedDocs = groupAndDeduplicateSources(sources)

  if (groupedDocs.length === 0) {
    return null
  }

  const totalUniquePages = groupedDocs.reduce(
    (acc, doc) => acc + doc.uniquePages.length,
    0
  )

  const toggleDocExcerpt = (key: string) => {
    setExpandedDocs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const isNoteVariant = variant === 'note'

  return (
    <div
      className={`rounded-2xl border border-[#ece4f7] bg-gradient-to-br from-[#faf8fe] via-[#fdfcff] to-[#f7f3fd] p-4 sm:p-5 shadow-2xs ${className}`}
    >
      {/* Sources Header Bar */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#f0ebf8] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#736c8d] flex items-center gap-1.5">
            <BookOpen className="size-3.5 text-[#7763d9]" /> SOURCES
          </span>
          <span className="rounded-full bg-[#f1edfe] px-2.5 py-0.5 text-[10px] font-semibold text-[#6853cc]">
            {groupedDocs.length}{' '}
            {groupedDocs.length === 1 ? 'document' : 'documents'} ·{' '}
            {totalUniquePages}{' '}
            {totalUniquePages === 1 ? 'unique page' : 'unique pages'}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#24966d] bg-[#e8f8f2] px-2.5 py-0.5 rounded-full">
          <Check className="size-3" /> GROUNDED IN SYLLABUS
        </span>
      </div>

      {/* Document Citation Cards List */}
      <div className="flex flex-col gap-2.5">
        {groupedDocs.map((group, i) => {
          const docKey = `${group.docName}-${i}`
          const isExpanded = Boolean(expandedDocs[docKey])

          // Collect the primary non-empty snippet across unique pages
          const primarySnippet = group.uniquePages
            .map((p) => p.primarySource.snippet?.trim())
            .find((s) => Boolean(s))

          const hasAnySnippet = Boolean(primarySnippet)

          return (
            <div
              key={docKey}
              className="rounded-xl border border-[#ebe4f7] bg-white p-3.5 text-xs transition hover:border-[#cfc3f5] shadow-2xs"
            >
              {/* Document Name Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#eee9ff] text-[#7763d9]">
                    <FileText className="size-4" />
                  </span>
                  <h5 className="font-bold text-[#282144] text-xs sm:text-[13px] truncate">
                    {group.docName}
                  </h5>
                </div>

                {onViewSource && (
                  <button
                    onClick={() => onViewSource(group.uniquePages[0]?.primarySource || group.allSources[0])}
                    className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-[#7763d9] hover:underline"
                    title={`Open ${group.docName} in document viewer`}
                  >
                    <span>View doc</span>
                    <ExternalLink className="size-2.5" />
                  </button>
                )}
              </div>

              {/* Pages Referenced Section */}
              <div className="mt-2.5">
                <span className="text-[11px] font-medium text-[#7d7598] block mb-1.5">
                  Pages referenced
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {group.uniquePages.map((page) => (
                    <button
                      key={page.label}
                      onClick={() => onViewSource && onViewSource(page.primarySource)}
                      className={`inline-flex items-center gap-1 rounded-md border border-[#e2d8f7] bg-[#fbf9fe] px-2.5 py-1 text-[11px] font-semibold text-[#6853cc] transition hover:bg-[#ede8ff] hover:text-[#523eb0] shadow-2xs active:scale-[0.98] ${
                        !onViewSource ? 'cursor-default' : ''
                      }`}
                      title={onViewSource ? `Click to inspect ${page.label}` : page.label}
                    >
                      <span>{page.label}</span>
                      {onViewSource && <ExternalLink className="size-2.5 opacity-50" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Excerpts (Expandable / Collapsible with natural wrapping) */}
              {hasAnySnippet && (
                <div className="mt-3 pt-2.5 border-t border-[#f0eaf8]">
                  {/* Collapsed Preview */}
                  {!isExpanded && (
                    <p
                      onClick={() => toggleDocExcerpt(docKey)}
                      className="text-xs leading-relaxed text-[#5e567a] italic line-clamp-2 cursor-pointer hover:text-[#282144] transition"
                      title="Click to expand full source excerpt"
                    >
                      &ldquo;{primarySnippet}&rdquo;
                    </p>
                  )}

                  {/* Expanded Full Excerpts */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2 mt-1 overflow-hidden"
                      >
                        {group.uniquePages.map((page) => {
                          const snippets = Array.from(
                            new Set(
                              page.allSources
                                .map((s) => s.snippet?.trim())
                                .filter(Boolean)
                            )
                          )
                          if (snippets.length === 0) return null

                          return (
                            <div
                              key={page.label}
                              className="rounded-xl border border-[#ece4f7] bg-[#faf8fe] p-3 text-xs shadow-2xs"
                            >
                              <div className="mb-1.5 flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 rounded-md bg-[#f4effe] px-2 py-0.5 text-[10px] font-bold text-[#6853cc]">
                                  {page.label}
                                </span>
                                {onViewSource && (
                                  <button
                                    onClick={() => onViewSource(page.primarySource)}
                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#7763d9] hover:underline"
                                  >
                                    <span>Open in viewer</span>
                                    <ExternalLink className="size-2.5" />
                                  </button>
                                )}
                              </div>
                              <div className="space-y-1.5">
                                {snippets.map((snip, sIdx) => (
                                  <p
                                    key={sIdx}
                                    className="text-xs leading-relaxed text-[#453d63] italic whitespace-normal break-words"
                                  >
                                    &ldquo;{snip}&rdquo;
                                  </p>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleDocExcerpt(docKey)}
                    className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#6853cc] hover:text-[#523eb0] transition"
                  >
                    <span>
                      {isExpanded
                        ? 'Hide source excerpt'
                        : 'View source excerpt'}
                    </span>
                    <ChevronDown
                      className={`size-3.5 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

