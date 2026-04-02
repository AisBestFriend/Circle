'use client'

import { useState } from 'react'
import { Session } from 'next-auth'
import Link from 'next/link'
import { PixelPet } from '@/components/pixel-pet'
import { StatBar } from '@/components/stat-bar'
import { Badge } from '@/components/ui/badge'
import { STAGE_LABELS } from '@/lib/constants'
import { Pet } from '@/types/game'

const REL_ICONS: Record<string, string> = {
  love: '💘',
  friend: '🤝',
  rival: '⚔️',
  enemy: '😤',
}

const REL_LABELS: Record<string, string> = {
  love: '사랑',
  friend: '우정',
  rival: '라이벌',
  enemy: '앙숙',
}

interface FriendEntry {
  friendshipId: string
  user: { id: string; name?: string | null; email?: string; image?: string | null }
  pet: Pet | null
  relationship: { type: string; intensity: number } | null
}

interface PendingEntry {
  friendshipId: string
  user: { id: string; name?: string | null; email?: string }
  created_at: string
}

interface GardenClientProps {
  session: Session
  acceptedFriends: FriendEntry[]
  pendingReceived: PendingEntry[]
  myPet: Pet | null
}

export function GardenClient({ session, acceptedFriends, pendingReceived, myPet }: GardenClientProps) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMsg, setInviteMsg] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [pending, setPending] = useState(pendingReceived)
  const [friends, setFriends] = useState(acceptedFriends)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim() || inviteLoading) return
    setInviteLoading(true)
    setInviteMsg('')
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setInviteMsg('친구 요청을 보냈어요!')
        setInviteEmail('')
      } else {
        setInviteMsg(data.error ?? '오류가 발생했습니다')
      }
    } catch {
      setInviteMsg('네트워크 오류가 발생했습니다')
    } finally {
      setInviteLoading(false)
    }
  }

  async function acceptFriend(friendshipId: string) {
    if (actionLoading) return
    setActionLoading(friendshipId)
    try {
      const res = await fetch(`/api/friends/${friendshipId}/accept`, { method: 'POST' })
      if (res.ok) {
        setPending(prev => prev.filter(p => p.friendshipId !== friendshipId))
        // Reload page to get updated friends list with pet data
        window.location.reload()
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function rejectFriend(friendshipId: string) {
    if (actionLoading) return
    setActionLoading(friendshipId)
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, { method: 'DELETE' })
      if (res.ok) {
        setPending(prev => prev.filter(p => p.friendshipId !== friendshipId))
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function removeFriend(friendshipId: string) {
    if (actionLoading) return
    setActionLoading(friendshipId)
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, { method: 'DELETE' })
      if (res.ok) {
        setFriends(prev => prev.filter(f => f.friendshipId !== friendshipId))
      }
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white font-mono text-sm">
            ← 내 다마고치
          </Link>
          <h1 className="text-yellow-400 font-mono font-bold text-xl">🌸 가든</h1>
        </div>
        <p className="text-gray-500 text-xs font-mono">{friends.length}명의 친구</p>
      </header>

      {/* Friend invite form */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
        <h2 className="text-green-400 font-mono text-sm font-bold">── 친구 초대 ──</h2>
        <form onSubmit={sendInvite} className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="친구 이메일 입력"
            className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-green-500"
          />
          <button
            type="submit"
            disabled={inviteLoading}
            className="pixel-btn font-mono text-green-400 border-green-700 hover:border-green-400 disabled:opacity-40 px-4 py-2 text-sm"
          >
            {inviteLoading ? '...' : '보내기'}
          </button>
        </form>
        {inviteMsg && (
          <p className="text-yellow-400 text-xs font-mono">{inviteMsg}</p>
        )}
      </div>

      {/* Pending received requests */}
      {pending.length > 0 && (
        <div className="bg-gray-900 border border-yellow-700/40 rounded-lg p-4 space-y-3">
          <h2 className="text-yellow-400 font-mono text-sm font-bold">── 받은 친구 요청 ({pending.length}) ──</h2>
          <div className="space-y-2">
            {pending.map(p => (
              <div key={p.friendshipId} className="flex items-center justify-between">
                <div>
                  <span className="text-white font-mono text-sm">{p.user.name ?? '알 수 없음'}</span>
                  <span className="text-gray-500 text-xs font-mono ml-2">{p.user.email}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptFriend(p.friendshipId)}
                    disabled={actionLoading === p.friendshipId}
                    className="pixel-btn font-mono text-green-400 border-green-700 hover:border-green-400 disabled:opacity-40 px-3 py-1 text-xs"
                  >
                    수락
                  </button>
                  <button
                    onClick={() => rejectFriend(p.friendshipId)}
                    disabled={actionLoading === p.friendshipId}
                    className="pixel-btn font-mono text-red-400 border-red-700 hover:border-red-400 disabled:opacity-40 px-3 py-1 text-xs"
                  >
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      {friends.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-gray-400 font-mono">아직 친구가 없어요...</p>
          <p className="text-gray-600 text-sm font-mono">이메일로 친구를 초대해보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-green-600 font-mono text-sm">── 친구 목록 ──</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {friends.map(f => (
              <FriendCard
                key={f.friendshipId}
                entry={f}
                myPet={myPet}
                onRemove={() => removeFriend(f.friendshipId)}
                removing={actionLoading === f.friendshipId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FriendCard({
  entry,
  myPet,
  onRemove,
  removing,
}: {
  entry: FriendEntry
  myPet: Pet | null
  onRemove: () => void
  removing: boolean
}) {
  const rel = entry.relationship

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-white font-mono font-bold text-sm">{entry.user.name ?? '알 수 없음'}</span>
          <p className="text-gray-600 text-xs font-mono">{entry.user.email}</p>
        </div>
        <button
          onClick={onRemove}
          disabled={removing}
          className="text-gray-600 hover:text-red-400 text-xs font-mono disabled:opacity-40"
        >
          [삭제]
        </button>
      </div>

      {entry.pet ? (
        <>
          <div className="flex items-center gap-4">
            <PixelPet stage={entry.pet.stage} evolutionType={entry.pet.evolution_type} size="md" animate={false} />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-green-300 font-mono text-sm">{entry.pet.name}</span>
                <span className="text-gray-500 font-mono text-xs border border-gray-700 px-1">
                  {STAGE_LABELS[entry.pet.stage] ?? entry.pet.stage}
                </span>
              </div>
              <StatBar label="배고픔" value={entry.pet.hunger} color="bg-orange-400" />
              <StatBar label="행복" value={entry.pet.happiness} color="bg-pink-400" />
              <StatBar label="에너지" value={entry.pet.energy} color="bg-cyan-400" />
            </div>
          </div>

          {myPet && rel && (
            <div className="flex items-center gap-2 pt-1 border-t border-gray-800">
              <span className="text-lg">{REL_ICONS[rel.type] ?? '🤝'}</span>
              <span className="text-gray-300 font-mono text-xs">{REL_LABELS[rel.type] ?? rel.type}</span>
              <div className="flex-1 h-1 bg-gray-800 rounded">
                <div
                  className="h-1 bg-yellow-400 rounded"
                  style={{ width: `${rel.intensity}%` }}
                />
              </div>
              <span className="text-gray-500 font-mono text-xs">{rel.intensity}</span>
            </div>
          )}

          {myPet && !rel && (
            <p className="text-gray-600 text-xs font-mono border-t border-gray-800 pt-1">
              아직 관계가 형성되지 않았어요
            </p>
          )}
        </>
      ) : (
        <p className="text-gray-600 text-xs font-mono">펫이 없어요</p>
      )}
    </div>
  )
}
