'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export interface ToastMessage {
  id: string
  type: 'success' | 'info' | 'error'
  title: string
  description?: string
}

interface ToastProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-[#ebe7f4] bg-white p-3.5 shadow-xl shadow-[#7763d9]/10"
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && (
                <CheckCircle2 className="size-4 text-[#2d9b75]" />
              )}
              {toast.type === 'info' && (
                <Info className="size-4 text-[#7763d9]" />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="size-4 text-[#ee8a7a]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#282344]">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-[11px] text-[#736c8d]">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#aaa4bc] hover:text-[#282344] rounded p-1"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

