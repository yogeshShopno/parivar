import React from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, title, children, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl shadow-glass-lg p-6 w-full max-w-3xl max-h-[92vh] overflow-hidden text-text">
        <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-border">
          <h2 className="text-base font-bold text-text tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-secondary hover:text-text hover:bg-surface-secondary transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
