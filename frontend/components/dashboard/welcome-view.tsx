'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Layers,
  Database,
  Cpu,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Upload,
  FileText,
  Quote,
  ChevronLeft,
  ChevronRight,
  Compass,
} from 'lucide-react'
import { DocumentItem } from './types'
import { MOTIVATIONAL_MESSAGES, STUDY_STARTER_PROMPTS } from './constants'

interface WelcomeViewProps {
  onSelectPrompt: (prompt: string) => void
  docs: DocumentItem[]
  onOpenUpload: () => void
  onPreviewDoc: (doc: DocumentItem) => void
}

export function WelcomeView({
  onSelectPrompt,
  docs,
  onOpenUpload,
  onPreviewDoc,
}: WelcomeViewProps) {
  const [quoteIndex, setQuoteIndex] = useState(0)

  // Rotating study-related motivational messages
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_MESSAGES.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [])

  const nextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_MESSAGES.length)
  }

  const prevQuote = () => {
    setQuoteIndex(
      (prev) => (prev - 1 + MOTIVATIONAL_MESSAGES.length) % MOTIVATIONAL_MESSAGES.length
    )
  }

  return (
    <div className="relative flex flex-col items-center justify-center py-6 sm:py-10">
      {/* Background Subtle Floating Shapes */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Soft violet blob */}
        <motion.div
          animate={{
            x: [0, 25, 0],
            y: [0, -18, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-12 left-1/4 size-72 rounded-full bg-gradient-to-tr from-[#ede8ff] to-[#f4edff] opacity-70 blur-3xl"
        />

        {/* Soft coral blob */}
        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-6 right-1/4 size-64 rounded-full bg-gradient-to-bl from-[#ffece8] to-[#fff3ed] opacity-60 blur-3xl"
        />

        {/* Soft mint floating circle */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-1/3 left-6 size-12 rounded-2xl border border-[#d2f3e5]/60 bg-[#eafaf3]/40 backdrop-blur-sm"
        />

        {/* Soft violet floating diamond */}
        <motion.div
          animate={{
            y: [0, 14, 0],
            rotate: [45, 90, 45],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 right-8 size-9 rounded-xl border border-[#dfd7fa]/60 bg-[#f1edfe]/40 backdrop-blur-sm"
        />
      </div>

      {/* Main Friendly Mascot Illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-6"
      >
        <div className="relative mx-auto flex size-24 items-center justify-center sm:size-28">
          {/* Pulsing Aura Rings */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.35, 0.7, 0.35],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#8b74f5] via-[#ee8a7a] to-[#72bea0] opacity-40 blur-xl"
          />

          {/* Core Mascot Orb Container */}
          <motion.div
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative z-10 flex size-20 items-center justify-center rounded-3xl border border-white/80 bg-gradient-to-br from-[#ffffff] via-[#f8f6ff] to-[#ffece8] shadow-xl shadow-[#7763d9]/15 sm:size-24"
          >
            {/* Friendly Mascot SVG Face & Book */}
            <svg
              className="size-12 text-[#282344] sm:size-14"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Floating Graduation Cap */}
              <motion.g
                animate={{
                  y: [0, -2, 0],
                  rotate: [0, -3, 0],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <path
                  d="M32 10L14 19L32 28L50 19L32 10Z"
                  fill="url(#cap-grad)"
                />
                <path
                  d="M20 23V31C20 34 25.4 36.5 32 36.5C38.6 36.5 44 34 44 31V23"
                  stroke="#7763d9"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle cx="48" cy="24" r="2" fill="#ee8a7a" />
                <path
                  d="M48 24V32"
                  stroke="#ee8a7a"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </motion.g>

              {/* Expressive Friendly Eyes */}
              <motion.ellipse
                animate={{
                  scaleY: [1, 0.15, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
                cx="26"
                cy="44"
                rx="2.6"
                ry="3.6"
                fill="#282344"
              />
              <motion.ellipse
                animate={{
                  scaleY: [1, 0.15, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
                cx="38"
                cy="44"
                rx="2.6"
                ry="3.6"
                fill="#282344"
              />

              {/* Soft Blushing Cheeks */}
              <circle cx="21" cy="48" r="2.5" fill="#fbb6a7" opacity="0.8" />
              <circle cx="43" cy="48" r="2.5" fill="#fbb6a7" opacity="0.8" />

              {/* Cheerful Smile */}
              <path
                d="M28.5 49C29.8 51.2 34.2 51.2 35.5 49"
                stroke="#282344"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Defs */}
              <defs>
                <linearGradient
                  id="cap-grad"
                  x1="14"
                  y1="10"
                  x2="50"
                  y2="28"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#8172d2" />
                  <stop offset="1" stopColor="#5d49bd" />
                </linearGradient>
              </defs>
            </svg>

            {/* Orbiting Sparkle 1 */}
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute -top-1 -right-1"
            >
              <span className="grid size-6 place-items-center rounded-full bg-gradient-to-br from-[#ffe5df] to-[#ffded6] text-[#e26d5a] shadow-sm">
                <Sparkles className="size-3.5" />
              </span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Welcome Headline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-[#e1dcfa] bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#7763d9] shadow-sm backdrop-blur-sm mb-3">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ee8a7a] opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-[#ee8a7a]" />
          </span>
          AI Study Companion Active
        </div>

        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#282344] sm:text-5xl">
          Hey! Ready to learn something{' '}
          <span className="bg-gradient-to-r from-[#7763d9] via-[#b477d8] to-[#ee8a7a] bg-clip-text text-transparent">
            new today?
          </span>
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#736c8d] sm:text-base">
          Ask questions directly against your syllabus, lecture notes, and slide decks.
          Every answer is strictly organized and grounded in your materials.
        </p>
      </motion.div>

      {/* Rotating Study-Related Motivational Messages Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6 w-full max-w-xl"
      >
        <div className="relative overflow-hidden rounded-2xl border border-[#ebe4f7] bg-white/80 p-3.5 shadow-sm backdrop-blur-sm sm:px-5 sm:py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-[#eee9ff] text-[#7763d9]">
              <Quote className="size-3.5" />
            </div>

            <div className="relative min-h-[38px] flex-1 flex items-center justify-center text-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={quoteIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="text-xs sm:text-[13px] font-medium leading-snug text-[#4a4369]"
                >
                  “{MOTIVATIONAL_MESSAGES[quoteIndex]}”
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={prevQuote}
                aria-label="Previous motivational message"
                className="grid size-6 place-items-center rounded-lg text-[#aaa4bc] transition hover:bg-[#f3effb] hover:text-[#7763d9]"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <button
                onClick={nextQuote}
                aria-label="Next motivational message"
                className="grid size-6 place-items-center rounded-lg text-[#aaa4bc] transition hover:bg-[#f3effb] hover:text-[#7763d9]"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Small Example Question Cards with Attractive Icons and Hover Animations */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 w-full max-w-3xl"
      >
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#9b94b0] flex items-center gap-1.5">
            <Compass className="size-3.5 text-[#7763d9]" /> Suggested Study Starters
          </span>
          <span className="text-[11px] font-medium text-[#aaa4bc]">
            Click to load prompt
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {STUDY_STARTER_PROMPTS.map((item) => {
            const Icon =
              item.icon === 'Layers'
                ? Layers
                : item.icon === 'Database'
                ? Database
                : item.icon === 'Cpu'
                ? Cpu
                : GraduationCap

            const colorClasses =
              item.color === 'violet'
                ? 'bg-[#eee9ff] text-[#7763d9] group-hover:bg-[#7763d9] group-hover:text-white'
                : item.color === 'mint'
                ? 'bg-[#dff7ee] text-[#2d9b75] group-hover:bg-[#2d9b75] group-hover:text-white'
                : item.color === 'coral'
                ? 'bg-[#ffe5df] text-[#e26d5a] group-hover:bg-[#e26d5a] group-hover:text-white'
                : 'bg-[#fff1c7] text-[#c88716] group-hover:bg-[#c88716] group-hover:text-white'

            return (
              <motion.button
                key={item.title}
                onClick={() => onSelectPrompt(item.title)}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="group flex items-start gap-3.5 rounded-2xl border border-[#ebe7f4] bg-white p-3.5 text-left shadow-sm transition-all hover:border-[#cfc6f4] hover:shadow-md hover:shadow-[#7763d9]/10"
              >
                <div
                  className={`grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-200 ${colorClasses}`}
                >
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block rounded-md bg-[#f6f3fc] px-2 py-0.5 text-[10px] font-semibold text-[#8172c8]">
                    {item.tag}
                  </span>
                  <p className="mt-1 text-xs font-semibold leading-snug text-[#302b4b] transition group-hover:text-[#6555be]">
                    {item.title}
                  </p>
                </div>
                <div className="grid size-6 place-items-center rounded-full text-[#cfc9dc] opacity-0 transition group-hover:opacity-100 group-hover:text-[#7763d9]">
                  <ArrowRight className="size-3.5" />
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Uploaded Documents Quick Access Shelf */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12 w-full max-w-3xl"
      >
        <div className="mb-4 flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-bold text-[#302b4b]">
              Your Grounded Materials
            </h2>
            <p className="text-xs text-[#9d97b0]">
              {docs.length} documents ready to cite and explain
            </p>
          </div>
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#e3deef] bg-white px-3 py-1.5 text-xs font-semibold text-[#6555be] shadow-sm transition hover:bg-[#f6f3ff] hover:border-[#b6a9ef]"
          >
            <Upload className="size-3.5" />
            Upload Document
          </button>
        </div>

        {docs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#ddd6ef] bg-[#faf8ff] p-8 text-center">
            <BookOpen className="mx-auto size-8 text-[#aaa4c2]" />
            <p className="mt-2 text-sm font-semibold text-[#4a4369]">
              No study materials yet
            </p>
            <p className="mt-1 text-xs text-[#89849e]">
              Upload PDFs, DOCX, or PPTX to start asking grounded questions.
            </p>
            <button
              onClick={onOpenUpload}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#282344] px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#3c3561]"
            >
              <Upload className="size-3.5" /> Upload now
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {docs.map((d) => (
              <motion.div
                key={d.id}
                whileHover={{ y: -2 }}
                onClick={() => onPreviewDoc(d)}
                className="group cursor-pointer rounded-2xl border border-[#ebe7f4] bg-white p-3.5 shadow-sm transition hover:border-[#cfc6f4] hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`grid size-8 place-items-center rounded-lg ${
                      d.color === 'coral'
                        ? 'bg-[#ffe5df] text-[#e26d5a]'
                        : d.color === 'violet'
                        ? 'bg-[#eee9ff] text-[#7763d9]'
                        : 'bg-[#dff7ee] text-[#2d9b75]'
                    }`}
                  >
                    <FileText className="size-4" />
                  </span>
                  <span className="rounded-full bg-[#f4f1fa] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#7e7697]">
                    {d.type}
                  </span>
                </div>
                <p className="mt-3 truncate text-xs font-semibold text-[#302b4b] group-hover:text-[#7763d9]">
                  {d.name}
                </p>
                <p className="mt-1 text-[11px] text-[#aaa4bc]">{d.size} · {d.pages}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

