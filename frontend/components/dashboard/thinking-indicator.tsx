'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Brain, Search, BookOpen } from 'lucide-react'

const THINKING_PHRASES = [
  'Going through your study materials...',
  'Finding the most relevant explanation...',
  'Connecting syllabus topics and exam notes...',
  'Structuring a clear, grounded answer...',
]

export function ThinkingIndicator() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % THINKING_PHRASES.length)
    }, 1800)
    return () => clearInterval(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex items-start gap-3.5 my-4"
    >
      {/* Subtle Glowing Assistant Icon */}
      <div className="relative grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#7763d9] to-[#ee8a7a] text-white shadow-md shadow-[#7763d9]/25">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-2xl bg-[#7763d9] blur-md -z-10"
        />
        <Sparkles className="size-5 animate-pulse" />
      </div>

      {/* Thinking Bubble */}
      <div className="flex-1 max-w-xl rounded-2xl border border-[#ebe7f4] bg-white/90 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Animated 3 dots */}
          <div className="flex items-center gap-1.5 px-1 py-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{
                  y: [0, -5, 0],
                  scale: [1, 1.25, 1],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
                className="size-2 rounded-full bg-[#7763d9]"
              />
            ))}
          </div>

          {/* Cycling text */}
          <div className="h-5 overflow-hidden flex-1">
            <AnimatePresence mode="wait">
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-xs font-semibold text-[#5d567c] flex items-center gap-1.5"
              >
                {index % 2 === 0 ? (
                  <Search className="size-3 text-[#ee8a7a]" />
                ) : (
                  <Brain className="size-3 text-[#7763d9]" />
                )}
                <span>{THINKING_PHRASES[index]}</span>
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Subtle shimmer progress line */}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#f3effb]">
          <motion.div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#7763d9] via-[#ee8a7a] to-[#7763d9]"
            animate={{
              x: ['-100%', '350%'],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}

