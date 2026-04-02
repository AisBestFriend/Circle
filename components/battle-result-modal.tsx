'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface StatChange {
  label: string
  change: number
}

interface BattleResultModalProps {
  open: boolean
  story: string
  won: boolean
  statChanges: StatChange[]
  onClose: () => void
}

export function BattleResultModal({ open, story, won, statChanges, onClose }: BattleResultModalProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    if (!open) return
    setDisplayedText('')
    setTyping(true)
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayedText(story.slice(0, i))
      if (i >= story.length) {
        clearInterval(interval)
        setTyping(false)
      }
    }, 35)
    return () => clearInterval(interval)
  }, [open, story])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 border-2 border-yellow-400 rounded-lg p-6 max-w-sm w-full mx-4 space-y-4"
            style={{ fontFamily: 'monospace' }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <div className="text-center">
              <h2 className={`font-bold text-lg ${won ? 'text-yellow-400' : 'text-red-400'}`}>
                {won ? '⚔️ 승리!' : '⚔️ 패배...'}
              </h2>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded p-3 min-h-[80px]">
              <p className="text-gray-200 text-xs leading-relaxed">
                {displayedText}
                {typing && <span className="animate-pulse">▌</span>}
              </p>
            </div>

            {statChanges.length > 0 && (
              <div className="space-y-1 border-t border-gray-800 pt-2">
                <p className="text-gray-500 text-xs">── 스탯 변화 ──</p>
                {statChanges.map((s, i) => (
                  <div key={i} className="flex justify-between text-xs font-mono">
                    <span className="text-gray-400">{s.label}</span>
                    <span className={s.change > 0 ? 'text-green-400' : 'text-red-400'}>
                      {s.change > 0 ? `+${s.change}` : s.change}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={onClose}
              disabled={typing}
              className="w-full pixel-btn font-mono text-yellow-400 border-yellow-700 hover:border-yellow-400 disabled:opacity-40 py-2 text-sm"
            >
              {typing ? '...' : '확인'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
