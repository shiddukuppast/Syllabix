'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, CheckCircle2, BookOpen, ArrowRight } from 'lucide-react'
import { DocumentItem, SourceReference } from './types'

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  doc: DocumentItem | null
  source?: SourceReference | null
  onAskAboutDoc?: (docName: string) => void
}

export function DocumentModal({
  isOpen,
  onClose,
  doc,
  source,
  onAskAboutDoc,
}: DocumentModalProps) {
  if (!isOpen || (!doc && !source)) return null

  const title = doc?.name || source?.docName || 'Study Material'
  const page = source?.page || doc?.pages || 'Syllabus Module'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#282344]/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-lg rounded-3xl border border-[#ebe7f4] bg-white p-6 shadow-2xl shadow-[#7763d9]/15"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#f0edf7] pb-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#eee9ff] text-[#7763d9]">
                <FileText className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#282344] truncate max-w-[280px]">
                  {title}
                </h3>
                <p className="text-[11px] text-[#8a849e]">
                  {page} · Indexed for AI Grounding
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="grid size-8 place-items-center rounded-xl text-[#aaa4bc] transition hover:bg-[#f5f1fe] hover:text-[#282344]"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Body */}
          <div className="mt-5 space-y-4">
            {source?.snippet ? (
              <div className="rounded-2xl border border-[#e8e2f4] bg-[#faf8fe] p-4">
                <div className="flex items-center justify-between text-xs font-bold text-[#7763d9] mb-2">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="size-3.5" /> Cited Excerpt
                  </span>
                  <span className="text-[10px] text-[#2d9b75] bg-[#dff7ee] px-2 py-0.5 rounded-full font-semibold">
                    {source.matchScore ? `${source.matchScore}% relevance` : 'High match'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[#4a4369] italic">
                  “{source.snippet}”
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#ebe7f4] bg-[#faf8fe] p-4 text-xs text-[#524b70]">
                <p className="font-semibold text-[#282344] mb-1">
                  Document Overview
                </p>
                <p className="leading-relaxed">
                  This document is stored and indexed for retrieval in your active session.
                </p>
                {doc && (
                  <div className="mt-3 flex gap-2">
                    <span className="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-[#7763d9] border border-[#e8e2f4]">
                      Size: {doc.size}
                    </span>
                    <span className="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-[#2d9b75] border border-[#e8e2f4]">
                      Status: {doc.status === 'ready' ? 'Indexed' : doc.status === 'failed' ? 'Failed' : 'Processing'}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-xl border border-[#f0edf7] p-3 text-xs flex items-center gap-2 text-[#686184]">
              <CheckCircle2 className="size-4 text-[#2d9b75] shrink-0" />
              <span>Document loaded in current session</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-[#e3deef] px-4 py-2 text-xs font-semibold text-[#5d567c] hover:bg-[#faf9fd]"
            >
              Close
            </button>
            {onAskAboutDoc && (
              <button
                onClick={() => {
                  onAskAboutDoc(title)
                  onClose()
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#7763d9] px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#6552c7]"
              >
                <span>Ask question about this doc</span>
                <ArrowRight className="size-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
