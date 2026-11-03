'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Sliders,
  Type,
  BookOpen,
  Trash2,
  Check,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { UserSettings } from './types'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: UserSettings
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void
  onClearHistory: () => void
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearHistory,
}: SettingsModalProps) {
  if (!isOpen) return null

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
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-[#eee9ff] text-[#7763d9]">
                <Sliders className="size-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-[#282344]">Study Workspace Settings</h3>
                <p className="text-xs text-[#8a849e]">Personalize your study companion</p>
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
          <div className="mt-5 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            {/* Reading Comfort Font Size */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7e7697]">
                <Type className="size-3.5 text-[#7763d9]" /> Reading Comfort & Font Size
              </label>
              <p className="text-[11px] text-[#aaa4bc] mt-0.5">
                Optimize text size for comfortable, fatigue-free study sessions.
              </p>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {(['compact', 'normal', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => onUpdateSettings({ readingFontSize: size })}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold capitalize transition ${
                      settings.readingFontSize === size
                        ? 'border-[#7763d9] bg-[#f5f1fe] text-[#6555be]'
                        : 'border-[#e8e3f4] bg-white text-[#5d567c] hover:bg-[#faf9fd]'
                    }`}
                  >
                    {settings.readingFontSize === size && <Check className="size-3 text-[#7763d9]" />}
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Answering Mode */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7e7697]">
                <Sparkles className="size-3.5 text-[#7763d9]" /> Default Answering Mode
              </label>
              <p className="text-[11px] text-[#aaa4bc] mt-0.5">
                Choose the retrieval behavior for new study sessions.
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateSettings({ defaultMode: 'Syllabus + AI' })}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition ${
                    settings.defaultMode === 'Syllabus + AI'
                      ? 'border-[#7763d9] bg-[#f5f1fe] text-[#6555be]'
                      : 'border-[#e8e3f4] bg-white text-[#5d567c] hover:bg-[#faf9fd]'
                  }`}
                >
                  <Sparkles className="size-4 shrink-0 text-[#8172d2]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold leading-tight">Syllabus + AI</p>
                    <p className="text-[10px] text-[#8a849e] mt-0.5">Notes + broad insights</p>
                  </div>
                  {settings.defaultMode === 'Syllabus + AI' && <Check className="size-3.5 text-[#7763d9]" />}
                </button>

                <button
                  onClick={() => onUpdateSettings({ defaultMode: 'Strict Syllabus' })}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition ${
                    settings.defaultMode === 'Strict Syllabus'
                      ? 'border-[#2d9b75] bg-[#eefbf6] text-[#2d9b75]'
                      : 'border-[#e8e3f4] bg-white text-[#5d567c] hover:bg-[#faf9fd]'
                  }`}
                >
                  <ShieldCheck className="size-4 shrink-0 text-[#2d9b75]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold leading-tight">Strict Syllabus</p>
                    <p className="text-[10px] text-[#8a849e] mt-0.5">Strictly cited notes only</p>
                  </div>
                  {settings.defaultMode === 'Strict Syllabus' && <Check className="size-3.5 text-[#2d9b75]" />}
                </button>
              </div>
            </div>

            {/* Answer Structure Detail */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7e7697]">
                <BookOpen className="size-3.5 text-[#ee8a7a]" /> Answer Structure & Detail
              </label>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {(['concise', 'balanced', 'comprehensive'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => onUpdateSettings({ answerDetail: level })}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition ${
                      settings.answerDetail === level
                        ? 'border-[#7763d9] bg-[#f5f1fe] text-[#6555be]'
                        : 'border-[#e8e3f4] bg-white text-[#5d567c] hover:bg-[#faf9fd]'
                    }`}
                  >
                    <span className="text-xs font-bold capitalize">{level}</span>
                    <span className="text-[10px] text-[#aaa4bc] mt-0.5">
                      {level === 'concise' ? 'Key points' : level === 'balanced' ? 'Standard' : '10-mark full'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 rounded-2xl border border-[#ebe7f4] bg-[#faf8fe] p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#302b4b]">
                    Exam Preparation Focus
                  </p>
                  <p className="text-[11px] text-[#8a849e]">
                    Structures answers with headings, marking schemes, and mnemonics.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.examPreparationFocus}
                  onChange={(e) =>
                    onUpdateSettings({ examPreparationFocus: e.target.checked })
                  }
                  className="size-4 accent-[#7763d9] cursor-pointer"
                />
              </div>

              <div className="border-t border-[#eee8f7] pt-2.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#302b4b]">
                    High-contrast Code & Math
                  </p>
                  <p className="text-[11px] text-[#8a849e]">
                    Highlights formulas and technical code blocks with stronger contrast.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.highContrastCode}
                  onChange={(e) =>
                    onUpdateSettings({ highContrastCode: e.target.checked })
                  }
                  className="size-4 accent-[#7763d9] cursor-pointer"
                />
              </div>
            </div>

            {/* Danger Zone: Clear History */}
            <div className="flex items-center justify-between border-t border-[#f0edf7] pt-4">
              <div>
                <p className="text-xs font-bold text-[#302b4b]">Conversation History</p>
                <p className="text-[11px] text-[#8a849e]">
                  Delete all local study conversations and notes.
                </p>
              </div>
              <button
                onClick={() => {
                  onClearHistory()
                  onClose()
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#fed4cd] bg-[#fff5f3] px-3 py-1.5 text-xs font-semibold text-[#e26d5a] transition hover:bg-[#ffece8]"
              >
                <Trash2 className="size-3.5" />
                Clear all chats
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl bg-[#282344] px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-[#3c3561]"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

