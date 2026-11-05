'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trash2,
  FileText,
  AlertTriangle,
  Loader2,
  X,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react'

export interface ConfirmDialogState {
  isOpen: boolean
  title: string
  itemName?: string
  description?: string
  consequence?: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  iconType?: 'trash' | 'document' | 'warning'
  onConfirm: () => Promise<void> | void
}

interface ConfirmModalProps {
  state: ConfirmDialogState | null
  onClose: () => void
}

export function ConfirmModal({ state, onClose }: ConfirmModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  // Handle ESC key to dismiss dialog safely
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state?.isOpen && !isProcessing) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state?.isOpen, isProcessing, onClose])

  if (!state?.isOpen) return null

  const {
    title,
    itemName,
    description,
    consequence,
    confirmText = 'Delete',
    cancelText = 'Cancel',
    isDestructive = true,
    iconType = 'trash',
    onConfirm,
  } = state

  const handleExecute = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    try {
      await onConfirm()
      onClose()
    } catch {
      // Keep modal open or let caller display toast
    } finally {
      setIsProcessing(false)
    }
  }

  const renderIcon = () => {
    if (iconType === 'document') {
      return (
        <div className="grid size-11 place-items-center rounded-2xl bg-[#f0ecfc] text-[#7763d9] shadow-xs">
          <FileText className="size-5" />
        </div>
      )
    }
    if (iconType === 'warning') {
      return (
        <div className="grid size-11 place-items-center rounded-2xl bg-[#fff7ed] text-[#ea580c] shadow-xs">
          <AlertTriangle className="size-5" />
        </div>
      )
    }
    return (
      <div className="grid size-11 place-items-center rounded-2xl bg-[#fff0ed] text-[#ea5d5d] shadow-xs">
        <Trash2 className="size-5" />
      </div>
    )
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        {/* Soft atmospheric backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            if (!isProcessing) onClose()
          }}
          className="fixed inset-0 bg-[#1c1635]/40 backdrop-blur-xs"
        />

        {/* Dialog card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-[22px] border border-[#ece6f7] bg-white p-6 shadow-2xl shadow-[#20183b]/18"
        >
          {/* Header area with icon and close button */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {renderIcon()}
              <div>
                <h3
                  id="confirm-dialog-title"
                  className="text-base font-bold text-[#282344] tracking-tight"
                >
                  {title}
                </h3>
                <p className="text-xs text-[#827a9e] mt-0.5">
                  {description || 'Please confirm this action to proceed.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!isProcessing) onClose()
              }}
              disabled={isProcessing}
              className="grid size-8 place-items-center rounded-xl text-[#9b94b0] transition hover:bg-[#f6f2fd] hover:text-[#282344] disabled:opacity-40"
              aria-label="Close dialog"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Target Item Name (if provided) */}
          {itemName && (
            <div className="mt-4 rounded-xl border border-[#ebe5f8] bg-[#faf8fe] px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <FileText className="size-3.5 shrink-0 text-[#7763d9]" />
                <span className="text-xs font-semibold text-[#373059] truncate break-all">
                  {itemName}
                </span>
              </div>
            </div>
          )}

          {/* Consequence explanation */}
          {consequence && (
            <p className="mt-3 text-xs leading-relaxed text-[#736c8d]">
              {consequence}
            </p>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="rounded-xl border border-[#e3deef] bg-white px-4 py-2 text-xs font-semibold text-[#5d567c] transition hover:bg-[#f8f6ff] hover:text-[#282344] disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={handleExecute}
              disabled={isProcessing}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-xs transition disabled:opacity-60 ${
                isDestructive
                  ? 'bg-[#ea5d5d] hover:bg-[#d94e4e] active:bg-[#c93f3f]'
                  : 'bg-[#7763d9] hover:bg-[#6853cc] active:bg-[#5945ba]'
              }`}
            >
              {isProcessing && <Loader2 className="size-3.5 animate-spin" />}
              <span>{isProcessing ? 'Processing...' : confirmText}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

