'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bookmark,
  FileText,
  Copy,
  Check,
  Trash2,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { SavedNote, SourceReference } from './types'
import { FormattedMessage } from './formatted-message'
import { SourceViewer } from './source-viewer'
import { stripInlineSources, mergeSources } from '@/lib/source-utils'

interface SavedNoteCardProps {
  note: SavedNote
  onDelete: (id: string) => void
  onCopy: (text: string) => void
  onViewSource?: (source: SourceReference) => void
  compact?: boolean
}

export function SavedNoteCard({
  note,
  onDelete,
  onCopy,
  onViewSource,
  compact = false,
}: SavedNoteCardProps) {
  const [copied, setCopied] = useState(false)
  const [showSources, setShowSources] = useState(false)

  // Backward compatibility + guarantee clean academic text:
  // If an older saved note contains inline "Source: ...", strip it cleanly
  const { cleanText, extractedSources } = stripInlineSources(note.content)
  const effectiveSources = mergeSources(note.sources, extractedSources)
  const hasSources = effectiveSources && effectiveSources.length > 0

  const handleCopy = () => {
    onCopy(cleanText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group rounded-2xl border border-[#ebe5f7] bg-white p-4 sm:p-5 shadow-2xs transition hover:border-[#cfc3f5] hover:shadow-xs">
      {/* Note Header */}
      <div className="mb-3 flex items-start justify-between gap-3 border-b border-[#f2edf9] pb-3">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#eee9ff] text-[#7763d9] mt-0.5 shadow-2xs">
            <Bookmark className="size-3.5 fill-[#7763d9]" />
          </span>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-[#282144] text-xs sm:text-sm line-clamp-2 leading-snug">
              {note.question || 'Exam Study Note'}
            </h4>
            <span className="text-[10px] text-[#aaa4bc] block mt-0.5">
              {note.createdAt}
            </span>
          </div>
        </div>

        {/* Delete note button */}
        <button
          onClick={() => onDelete(note.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-[#aaa4bc] hover:text-[#e26d5a] hover:bg-[#fff0ed] rounded-lg transition"
          title="Delete saved note"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* Note Clean Content */}
      <div
        className={`text-[#342d4d] text-xs sm:text-[13px] leading-relaxed ${
          compact ? 'line-clamp-4' : ''
        }`}
      >
        <FormattedMessage content={cleanText} />
      </div>

      {/* Additional AI Insights if present */}
      {note.additionalKnowledge && !compact && (
        <div className="mt-3.5 rounded-xl border border-[#e9e1f7] bg-[#faf8fe] border-l-[3px] border-l-[#7763d9] p-3 text-xs leading-relaxed text-[#483d6e]">
          <div className="mb-1.5 flex items-center gap-1.5 font-bold text-[#44386e] text-[11px]">
            <Sparkles className="size-3 text-[#7763d9]" />
            <span>Additional AI Insights</span>
          </div>
          <FormattedMessage
            content={note.additionalKnowledge}
            variant="insights"
          />
        </div>
      )}

      {/* Note Footer Action Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#f2edf9] pt-3 text-xs">
        <div className="flex items-center gap-2">
          {/* Copy Note Button */}
          <button
            onClick={handleCopy}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-[#e8e2f4] bg-white px-2.5 text-[11px] font-medium text-[#5a5276] shadow-2xs transition hover:bg-[#f6f2fd] hover:text-[#7763d9] hover:border-[#cfc3f5] active:scale-[0.98]"
            title="Copy note content"
          >
            {copied ? (
              <>
                <Check className="size-3 text-[#2d9b75]" />
                <span className="text-[#2d9b75] font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3 text-[#736c8d]" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* On-Demand View Sources Button for Note */}
          {hasSources && (
            <button
              onClick={() => setShowSources((prev) => !prev)}
              className={`inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium transition active:scale-[0.98] ${
                showSources
                  ? 'border-[#7763d9] bg-[#f2effd] text-[#6555be] font-semibold'
                  : 'border-[#e8e2f4] bg-white text-[#5a5276] hover:bg-[#f6f2fd] hover:text-[#7763d9] hover:border-[#cfc3f5]'
              }`}
              title={
                showSources
                  ? 'Hide verified sources'
                  : 'View grounded syllabus sources for this note'
              }
            >
              <FileText
                className={`size-3 ${
                  showSources ? 'text-[#7763d9]' : 'text-[#736c8d]'
                }`}
              />
              <span>View Sources</span>
              <ChevronDown
                className={`size-2.5 text-[#89849e] transition-transform duration-200 ${
                  showSources ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>

        <span className="text-[10px] text-[#aaa4bc] font-medium">
          Study Note
        </span>
      </div>

      {/* On-demand expandable Sources panel for the note */}
      <AnimatePresence>
        {showSources && hasSources && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <SourceViewer
              sources={effectiveSources}
              onViewSource={onViewSource}
              variant="note"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

