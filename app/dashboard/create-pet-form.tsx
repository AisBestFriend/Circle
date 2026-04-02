'use client'

import { useState } from 'react'
import { Pet } from '@/types/game'

interface CreatePetFormProps {
  onCreated: (pet: Pet) => void
}

export function CreatePetForm({ onCreated }: CreatePetFormProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    if (!name.trim()) {
      setError('이름을 입력해주세요')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? '오류가 발생했습니다')
      onCreated(data.pet as Pet)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pixel-card p-6 space-y-4">
      <h3 className="text-yellow-400 font-mono font-bold text-center">[ 알 이름 짓기 ]</h3>
      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="다마고치 이름..."
          maxLength={20}
          className="w-full bg-black border-2 border-green-900 focus:border-green-400 px-3 py-2 text-green-300 font-mono text-sm outline-none placeholder:text-green-900"
        />
        {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-yellow-400 text-black font-mono font-bold py-2 px-4 border-b-4 border-yellow-700 hover:bg-yellow-300 active:border-b-0 active:mt-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? '생성 중...' : '🥚 알 부화시키기'}
        </button>
      </div>
    </div>
  )
}
