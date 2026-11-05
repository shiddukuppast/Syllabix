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
  Film,
  Lock,
} from 'lucide-react'
import { UserSettings, LoadingAnimationTheme } from './types'
import { WalkingIllustration } from './walking-illustration'
import { PenguinIllustration } from './penguin-illustration'
import { WarriorIllustration } from './warrior-illustration'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: UserSettings
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void
  onClearHistory: () => void
  onLock?: () => void
}

const ANIMATION_OPTIONS: Array<{
  id: LoadingAnimationTheme
  name: string
  description: string
}> = [
  {
    id: 'couple',
    name: 'Boy & Girl',
    description: 'A peaceful walking story.',
  },
  {
    id: 'penguin',
    name: 'Penguin Adventure',
    description: 'Keep climbing, no matter how difficult the journey.',
  },
  {
    id: 'warrior',
    name: 'The Lone Warrior',
    description: 'One warrior against all odds.',
  },
]

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearHistory,
  onLock,
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
          className="relative z-10 w-full max-w-xl rounded-3xl border border-[#ebe7f4] bg-white p-6 shadow-2xl shadow-[#7763d9]/15"
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
          <div className="mt-5 space-y-5 max-h-[72vh] overflow-y-auto pr-1 sidebar-scroll">
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

            {/* AI Loading Animation Selection */}
            <div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7e7697]">
                  <Film className="size-3.5 text-[#7763d9]" /> AI Loading Animation
                </label>
                <span className="text-[10px] font-semibold text-[#7763d9] bg-[#f2effd] px-2 py-0.5 rounded-full">
                  3 Options
                </span>
              </div>
              <p className="text-[11px] text-[#aaa4bc] mt-0.5">
                Choose the animation that accompanies your AI while it prepares your answers.
              </p>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {ANIMATION_OPTIONS.map((option) => {
                  const isSelected = (settings.loadingAnimation || 'couple') === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onUpdateSettings({ loadingAnimation: option.id })}
                      className={`group relative flex flex-col rounded-2xl border text-left transition-all overflow-hidden p-2.5 ${
                        isSelected
                          ? 'border-[#7763d9] bg-[#f7f4fe] ring-2 ring-[#7763d9]/25 shadow-sm'
                          : 'border-[#e8e2f4] bg-white hover:border-[#cfc3f5] hover:bg-[#faf9fd]'
                      }`}
                    >
                      {/* Mini Live Preview Stage */}
                      <div className="relative h-20 w-full overflow-hidden rounded-xl bg-[#1d1733] flex items-center justify-center border border-[#35295c]/30 shadow-inner">
                        {option.id === 'couple' && <WalkingIllustration isPreview />}
                        {option.id === 'penguin' && <PenguinIllustration isPreview />}
                        {option.id === 'warrior' && <WarriorIllustration isPreview />}
                      </div>

                      {/* Card Content & Selection Indicator */}
                      <div className="mt-2.5 flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#2a2448] truncate">
                            {option.name}
                          </p>
                          <p className="text-[10px] text-[#837b9d] line-clamp-2 mt-0.5 leading-snug">
                            {option.description}
                          </p>
                        </div>

                        <div
                          className={`flex size-4 shrink-0 items-center justify-center rounded-full mt-0.5 transition ${
                            isSelected
                              ? 'bg-[#7763d9] text-white'
                              : 'border border-[#dcd6ec] bg-white group-hover:border-[#7763d9]'
                          }`}
                        >
                          {isSelected && <Check className="size-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  )
                })}
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

            {/* Personal Workspace Security & Lock */}
            {onLock && (
              <div className="flex items-center justify-between border-t border-[#f0edf7] pt-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-[#2d9b75]" />
                    <p className="text-xs font-bold text-[#302b4b]">Personal Workspace Lock</p>
                  </div>
                  <p className="text-[11px] text-[#8a849e] mt-0.5">
                    Locks automatically after 5m of inactivity or manually.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose()
                    onLock()
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2d8f7] bg-[#fbf9fe] px-3 py-1.5 text-xs font-semibold text-[#6853cc] transition hover:bg-[#ede8ff] hover:text-[#523eb0] shadow-2xs"
                >
                  <Lock className="size-3.5" />
                  Lock Workspace
                </button>
              </div>
            )}

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
