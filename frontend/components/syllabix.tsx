'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Check,
  FileText,
  GraduationCap,
  Lightbulb,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

const features = [
  ['Ask anything', 'Turn confusing notes into clear, conversational answers.', MessageCircle, 'bg-[#eee9ff] text-[#7763d9]'],
  ['Document-grounded', 'Every answer points you back to the material you trust.', ShieldCheck, 'bg-[#dff7ee] text-[#2d9b75]'],
  ['Exam-ready', 'Get structured answers for 2, 5, 10 and 15-mark questions.', GraduationCap, 'bg-[#ffe5df] text-[#e26d5a]'],
  ['Understand better', 'Simplify difficult concepts with examples that stick.', Lightbulb, 'bg-[#fff1c7] text-[#c88716]'],
]

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-[#1f2440]">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#8b74f5] to-[#ef8c83] text-white shadow-lg shadow-[#8b74f5]/20">
        <Sparkles className="size-4" />
      </span>
      <span className="text-[19px]">
        syllabix<span className="text-[#ef8c83]">.</span>
      </span>
    </Link>
  )
}

function Button({
  children,
  href,
  secondary = false,
  onClick,
  className = '',
}: {
  children: React.ReactNode
  href?: string
  secondary?: boolean
  onClick?: () => void
  className?: string
}) {
  const c = `inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
    secondary
      ? 'border border-[#dedbef] bg-white/70 text-[#4c466d] hover:bg-white'
      : 'bg-[#282344] text-white shadow-xl shadow-[#282344]/15 hover:bg-[#3c3561]'
  } ${className}`
  return href ? (
    <Link href={href} className={c}>
      {children}
    </Link>
  ) : (
    <button onClick={onClick} className={c}>
      {children}
    </button>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfaff] text-[#282344]">
      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#77728e] md:flex">
          <a href="#features" className="hover:text-[#282344]">
            Features
          </a>
          <a href="#how" className="hover:text-[#282344]">
            How it works
          </a>
          <Link href="/dashboard" className="hover:text-[#282344]">
            Workspace
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button href="/dashboard" className="px-4 py-2.5">
            Open Syllabix <ArrowUpRight className="size-4" />
          </Button>
        </div>
      </header>

      {/* Main Hero */}
      <main>
        <section className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:pb-28 lg:pt-24">
          <div className="absolute -left-28 top-0 size-72 rounded-full bg-[#e5ddff] blur-3xl" />
          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e1dcfa] bg-white/80 px-3.5 py-2 text-xs font-semibold text-[#7763d9] shadow-sm">
              <span className="size-1.5 rounded-full bg-[#ee917f]" /> Personal Study Companion
            </div>
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-.055em] text-[#25203f] sm:text-6xl">
              Your study materials.
              <br />
              <span className="bg-gradient-to-r from-[#7763d9] via-[#b477d8] to-[#ee8a7a] bg-clip-text text-transparent">
                One intelligent
              </span>{' '}
              assistant.
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#77728e]">
              Stop searching through endless notes. Upload your syllabus, ask anything, and get
              answers grounded in your academic materials.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/dashboard">
                Start Learning <ArrowUpRight className="size-4" />
              </Button>
              <Button href="#features" secondary>
                Explore Features
              </Button>
            </div>
          </div>
          <PreviewCard />
        </section>

        {/* Features Section */}
        <section id="features" className="mx-auto max-w-6xl px-5 py-20 lg:px-8 scroll-mt-10">
          <div className="mb-12 max-w-xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-[#ee8a7a]">
              Everything you need
            </p>
            <h2 className="text-4xl font-semibold tracking-[-.04em] text-[#282344]">
              Less searching.
              <br />
              More understanding.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([title, desc, Icon, color]) => (
              <div
                key={title as string}
                className="rounded-3xl border border-[#ebe7f4] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#8172c8]/10"
              >
                <div className={`mb-5 grid size-11 place-items-center rounded-2xl ${color}`}>
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold text-[#302b4b]">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-[#89849e]">{desc as string}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how" className="border-y border-[#ebe7f4] bg-[#f5f2ff] px-5 py-20 scroll-mt-10">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-[#7763d9]">
                  How it works
                </p>
                <h2 className="text-4xl font-semibold tracking-[-.04em] text-[#282344]">
                  Your notes, now
                  <br />a conversation.
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ['01', 'Upload', 'Bring your notes, slides and readings together in your workspace.'],
                  ['02', 'Ask', 'Ask questions in the way that feels natural.'],
                  ['03', 'Understand', 'Learn with answers structured for your exam.'],
                ].map(([n, t, d]) => (
                  <div key={n} className="rounded-2xl bg-white/80 p-5">
                    <span className="text-sm font-bold text-[#ee8a7a]">{n}</span>
                    <h3 className="mt-5 font-semibold">{t}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#89849e]">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#282344] px-7 py-12 text-center text-white sm:px-16">
            <div className="absolute -right-8 -top-16 size-56 rounded-full bg-[#8172c8]/50 blur-2xl" />
            <div className="absolute -bottom-24 left-10 size-48 rounded-full bg-[#ee8a7a]/40 blur-3xl" />
            <div className="relative">
              <Sparkles className="mx-auto mb-5 size-6 text-[#f7c2a9]" />
              <h2 className="text-3xl font-semibold tracking-[-.03em] sm:text-4xl">
                Make this semester feel lighter.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#c8c2df]">
                Your next great study session is one question away.
              </p>
              <Button href="/dashboard" className="mt-7 bg-white text-[#282344] hover:bg-[#f8f5ff]">
                Start Learning <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mx-auto flex max-w-6xl flex-col gap-4 border-t border-[#ebe7f4] px-5 py-7 text-sm text-[#89849e] sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <Logo />
        <span>© 2026 Syllabix. Learn with clarity.</span>
      </footer>
    </div>
  )
}

function PreviewCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative mx-auto w-full max-w-[510px]"
    >
      <div className="absolute -right-4 -top-8 rounded-2xl border border-white/80 bg-white px-3 py-2 shadow-lg shadow-[#7763d9]/10">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6c6682]">
          <span className="grid size-7 place-items-center rounded-lg bg-[#e1f7ed] text-[#3da47d]">
            <Check className="size-3.5" />
          </span>{' '}
          Grounded in your notes
        </div>
      </div>
      <div className="rounded-[2rem] border border-[#e6e0f4] bg-white p-3 shadow-2xl shadow-[#7d6ac4]/15">
        <div className="rounded-[1.5rem] bg-[#f8f6ff] p-5">
          <div className="mb-7 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-[#282344] text-white">
                <Sparkles className="size-3.5" />
              </span>
              <span className="text-xs font-bold">Syllabix AI</span>
            </div>
            <span className="rounded-full bg-[#e8e4f8] px-2.5 py-1 text-[10px] font-semibold text-[#7763d9]">
              Syllabus + AI
            </span>
          </div>
          <div className="ml-auto max-w-[290px] rounded-2xl rounded-tr-md bg-[#8172d2] px-4 py-3 text-sm leading-5 text-white">
            Explain the OSI model in simple terms
          </div>
          <div className="mt-5 flex gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#ffe3db] text-[#e17863]">
              <Sparkles className="size-3.5" />
            </span>
            <div className="text-sm leading-6 text-[#59536f]">
              <p className="font-semibold text-[#302b4b]">The OSI model is like a delivery journey.</p>
              <p className="mt-2">
                It breaks network communication into <b>seven layers</b>, each with a specific job.
              </p>
              <div className="mt-3 rounded-xl border border-[#e7e1f3] bg-white p-3 text-xs">
                <div className="flex items-center gap-2 font-semibold text-[#7763d9]">
                  <FileText className="size-3.5" /> Computer Networks Unit 2.pdf{' '}
                  <span className="ml-auto text-[#9d98ad]">p. 14</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export { Dashboard } from './dashboard/dashboard'
