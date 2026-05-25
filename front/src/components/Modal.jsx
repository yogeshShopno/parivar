import React from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, title, children, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1325] border border-white/[0.08] rounded-2xl shadow-glass-lg p-6 w-full max-w-3xl max-h-[92vh] overflow-hidden text-slate-100">
        <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-white/[0.06]">
          <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
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
