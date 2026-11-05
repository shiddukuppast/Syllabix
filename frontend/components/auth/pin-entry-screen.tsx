'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  X,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { api } from '@/lib/api'
import { StudyIllustration } from './study-illustration'

interface PinEntryScreenProps {
  onUnlockSuccess: () => void
  autoLockNotice?: string | null
}

export function PinEntryScreen({
  onUnlockSuccess,
  autoLockNotice,
}: PinEntryScreenProps) {
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lockoutRemaining, setLockoutRemaining] = useState(0)
  const [isSuccessUnlocked, setIsSuccessUnlocked] = useState(false)
  const [shouldShake, setShouldShake] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input automatically on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Check auth & lockout status on mount
  useEffect(() => {
    let timer: NodeJS.Timeout
    api.getAuthStatus()
      .then((status) => {
        if (status.authenticated) {
          onUnlockSuccess()
          return
        }
        if (status.locked_out && status.lockout_remaining_seconds > 0) {
          setLockoutRemaining(status.lockout_remaining_seconds)
          setErrorMessage(
            `Too many incorrect attempts. Please wait ${status.lockout_remaining_seconds}s.`
          )
        }
      })
      .catch(() => {
        // Backend offline or checking
      })

    return () => clearInterval(timer)
  }, [onUnlockSuccess])

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setErrorMessage(null)
          return 0
        }
        const next = prev - 1
        setErrorMessage(`Too many incorrect attempts. Please wait ${next}s.`)
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [lockoutRemaining])

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (lockoutRemaining > 0 || isLoading) return
    const val = e.target.value.replace(/\D/g, '') // strictly digits only
    if (val.length <= 8) {
      setPin(val)
      if (errorMessage && !lockoutRemaining) {
        setErrorMessage(null)
      }
    }
  }

  const handleClear = () => {
    setPin('')
    setErrorMessage(null)
    inputRef.current?.focus()
  }

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (lockoutRemaining > 0 || isLoading || !pin.trim()) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = await api.verifyPin(pin.trim())
      if (res.success) {
        setIsSuccessUnlocked(true)
        setTimeout(() => {
          onUnlockSuccess()
        }, 400)
      }
    } catch (err: unknown) {
      const error = err as { message?: string; status?: number }
      setShouldShake(true)
      setTimeout(() => setShouldShake(false), 500)
      setPin('')

      if (error?.status === 429) {
        setLockoutRemaining(60)
        setErrorMessage('Too many incorrect attempts. Workspace locked for 60s.')
      } else {
        setErrorMessage('Incorrect PIN. Please try again.')
      }

      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeypadDigit = (digit: string) => {
    if (lockoutRemaining > 0 || isLoading) return
    if (pin.length < 8) {
      const next = pin + digit
      setPin(next)
      if (errorMessage && !lockoutRemaining) setErrorMessage(null)
    }
  }

  const handleKeypadBackspace = () => {
    if (lockoutRemaining > 0 || isLoading) return
    setPin((prev) => prev.slice(0, -1))
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#f8f5fe] via-[#faf4fc] to-[#fcf1f3] text-[#282144] flex flex-col justify-between select-none">
      {/* Decorative Atmospheric Lighting Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-[500px] rounded-full bg-gradient-to-br from-[#8b74f5]/25 to-[#fca5a5]/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 size-[450px] rounded-full bg-gradient-to-tl from-[#c084fc]/20 via-[#f9a8d4]/15 to-[#fed7aa]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 size-[550px] rounded-full bg-gradient-to-tr from-[#818cf8]/20 to-[#f472b6]/15 blur-3xl" />

      {/* Floating Animated Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-[10%] size-2.5 rounded-full bg-[#7763d9]/30"
          animate={{ y: [-15, 15, -15], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-2/3 left-[18%] size-3 rounded-full bg-[#ee8a7a]/30"
          animate={{ y: [20, -20, 20], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-1/5 right-[15%] size-2 rounded-full bg-[#c084fc]/35"
          animate={{ y: [-18, 18, -18], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
        <motion.div
          className="absolute bottom-1/4 right-[25%] size-3.5 rounded-full bg-[#fbbf24]/30"
          animate={{ y: [16, -16, 16], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        />
      </div>

      {/* Top Brand Header */}
      <header className="relative z-10 w-full px-6 py-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#8b74f5] to-[#ef8c83] text-white shadow-lg shadow-[#8b74f5]/25">
            <Sparkles className="size-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-[#20193e]">
              SYLLABIX<span className="text-[#ee8a7a]">.</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-[#8b7fa9]">
              Your syllabus. Your AI. Your answers.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#e8dff7] bg-white/70 px-3.5 py-1.5 backdrop-blur-md shadow-2xs">
          <ShieldCheck className="size-4 text-[#2d9b75]" />
          <span className="text-xs font-semibold text-[#5a4d7d]">
            Protected Workspace
          </span>
        </div>
      </header>

      {/* Main Center Content Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-4 sm:px-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Visual Artwork & Inspirational Messaging */}
          <div className="hidden lg:flex lg:col-span-6 flex-col items-center lg:items-start text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#efe9fd] to-[#fae9ea] px-3.5 py-1.5 border border-[#e4d6f8]">
              <Sparkles className="size-3.5 text-[#7763d9]" />
              <span className="text-xs font-bold text-[#6853cc] uppercase tracking-wider">
                Personal Academic Vault
              </span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-[#221a42] leading-tight mb-3">
              Welcome back to your <br />
              <span className="bg-gradient-to-r from-[#7763d9] via-[#9d7cf5] to-[#ee8a7a] bg-clip-text text-transparent">
                Personal Learning Space
              </span>
            </h1>

            <p className="text-sm text-[#665a88] leading-relaxed max-w-md mb-6">
              Your syllabus documents, semester exam notes, and grounded AI study sessions are securely guarded. Enter your private PIN passcode to unlock.
            </p>

            {/* Aesthetic Study Scene Illustration */}
            <StudyIllustration className="w-full" />
          </div>

          {/* Right Column: PIN Authentication Card */}
          <div className="w-full lg:col-span-6 flex justify-center">
            <motion.div
              animate={shouldShake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.45 }}
              className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-[#7763d9]/10"
            >
              {/* Card Title & Icon */}
              <div className="text-center mb-6">
                <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-[#8b74f5] to-[#7763d9] text-white shadow-lg shadow-[#7763d9]/30">
                  {isSuccessUnlocked ? (
                    <Unlock className="size-6 text-white" />
                  ) : (
                    <Lock className="size-6 text-white" />
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#221a42]">
                  {isSuccessUnlocked ? 'Workspace Unlocked!' : 'Enter Access PIN'}
                </h2>
                <p className="text-xs text-[#7e739f] mt-1">
                  {autoLockNotice || 'Please enter your numeric passcode to continue'}
                </p>
              </div>

              {/* Inactivity Notice if present */}
              {autoLockNotice && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#fff5f2] border border-[#fcd5cd] p-3 text-xs text-[#c2410c]">
                  <AlertCircle className="size-4 shrink-0 text-[#e26d5a]" />
                  <span>{autoLockNotice}</span>
                </div>
              )}

              {/* Error Message Alert */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mb-4 flex items-center gap-2 rounded-xl bg-[#fff0f0] border border-[#ffcfcf] p-3 text-xs text-[#d32f2f] shadow-xs"
                  >
                    <AlertCircle className="size-4 shrink-0 text-[#e53935]" />
                    <span className="font-semibold">{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PIN Digits Dots / Display Box */}
              <form onSubmit={handleUnlock} className="space-y-5">
                <div className="relative">
                  {/* Hidden Real Input for keyboard input accessibility */}
                  <input
                    ref={inputRef}
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={8}
                    value={pin}
                    onChange={handlePinChange}
                    disabled={lockoutRemaining > 0 || isLoading}
                    className="sr-only"
                    autoComplete="off"
                    autoFocus
                  />

                  {/* Clickable Display Field */}
                  <div
                    onClick={() => inputRef.current?.focus()}
                    className="flex h-14 w-full cursor-text items-center justify-between rounded-2xl border-2 border-[#e7def7] bg-[#fbf9fe] px-4 py-2 transition-all hover:border-[#cfc3f5] focus-within:border-[#7763d9] focus-within:bg-white shadow-2xs"
                  >
                    {/* Visual PIN Dots */}
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {pin.length === 0 ? (
                        <span className="text-xs sm:text-sm text-[#aaa3bf] italic select-none">
                          Type your PIN (6–8 digits)...
                        </span>
                      ) : (
                        Array.from({ length: Math.max(6, pin.length) }).map((_, i) => {
                          const isFilled = i < pin.length
                          const digitChar = pin[i]

                          return (
                            <div
                              key={i}
                              className={`flex size-6 sm:size-7 items-center justify-center rounded-lg border transition-all ${
                                isFilled
                                  ? 'border-[#7763d9] bg-[#f1edfe] text-[#6555be] font-bold shadow-2xs scale-105'
                                  : 'border-[#ebe4f7] bg-white text-transparent'
                              }`}
                            >
                              {isFilled ? (
                                showPin ? (
                                  <span className="text-xs sm:text-sm font-mono font-bold">
                                    {digitChar}
                                  </span>
                                ) : (
                                  <span className="size-2 rounded-full bg-[#7763d9]" />
                                )
                              ) : null}
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* Actions on display field: Show/Hide & Clear */}
                    <div className="flex items-center gap-1">
                      {pin.length > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowPin((prev) => !prev)
                            }}
                            className="p-1.5 rounded-lg text-[#8b82a7] hover:bg-[#eee8fc] hover:text-[#7763d9] transition"
                            title={showPin ? 'Hide PIN digits' : 'Show PIN digits'}
                          >
                            {showPin ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleClear()
                            }}
                            className="p-1.5 rounded-lg text-[#8b82a7] hover:bg-[#fff0ed] hover:text-[#e26d5a] transition"
                            title="Clear input"
                          >
                            <X className="size-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Touch / Clickable Numeric Keypad (0-9) */}
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      disabled={lockoutRemaining > 0 || isLoading}
                      onClick={() => handleKeypadDigit(num)}
                      className="flex h-11 sm:h-12 items-center justify-center rounded-xl border border-[#ece4f7] bg-white font-mono text-base font-bold text-[#352c56] shadow-2xs transition hover:border-[#cfc3f5] hover:bg-[#f8f5fe] active:scale-95 disabled:opacity-40"
                    >
                      {num}
                    </button>
                  ))}

                  {/* Clear Button */}
                  <button
                    type="button"
                    disabled={lockoutRemaining > 0 || isLoading || pin.length === 0}
                    onClick={handleClear}
                    className="flex h-11 sm:h-12 items-center justify-center rounded-xl border border-[#ece4f7] bg-[#fdfcff] text-xs font-semibold text-[#8a7f9e] shadow-2xs transition hover:bg-[#fff0ed] hover:text-[#e26d5a] active:scale-95 disabled:opacity-40"
                  >
                    Clear
                  </button>

                  {/* Digit 0 */}
                  <button
                    type="button"
                    disabled={lockoutRemaining > 0 || isLoading}
                    onClick={() => handleKeypadDigit('0')}
                    className="flex h-11 sm:h-12 items-center justify-center rounded-xl border border-[#ece4f7] bg-white font-mono text-base font-bold text-[#352c56] shadow-2xs transition hover:border-[#cfc3f5] hover:bg-[#f8f5fe] active:scale-95 disabled:opacity-40"
                  >
                    0
                  </button>

                  {/* Backspace Button */}
                  <button
                    type="button"
                    disabled={lockoutRemaining > 0 || isLoading || pin.length === 0}
                    onClick={handleKeypadBackspace}
                    className="flex h-11 sm:h-12 items-center justify-center rounded-xl border border-[#ece4f7] bg-[#fdfcff] text-xs font-semibold text-[#8a7f9e] shadow-2xs transition hover:bg-[#f8f5fe] hover:text-[#7763d9] active:scale-95 disabled:opacity-40"
                    title="Backspace"
                  >
                    ⌫
                  </button>
                </div>

                {/* Primary Unlock Button */}
                <button
                  type="submit"
                  disabled={lockoutRemaining > 0 || isLoading || pin.length < 4}
                  className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#7763d9] via-[#846fe2] to-[#ee8a7a] text-sm font-bold text-white shadow-lg shadow-[#7763d9]/25 transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Verifying Passcode...</span>
                    </>
                  ) : isSuccessUnlocked ? (
                    <>
                      <Unlock className="size-4" />
                      <span>Workspace Unlocked</span>
                    </>
                  ) : (
                    <>
                      <span>Unlock My Workspace</span>
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Security Note */}
              <div className="mt-5 text-center">
                <span className="text-[11px] text-[#9c93b6]">
                  Single-user personal security · Constant-time authentication
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-4 text-center text-xs text-[#9d93b8]">
        <span>Syllabix Security &copy; {new Date().getFullYear()} · All documents encrypted locally</span>
      </footer>
    </div>
  )
}

