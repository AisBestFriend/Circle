'use client'

import { useState } from 'react'
import { Session } from 'next-auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PixelPet } from '@/components/pixel-pet'
import { StatBar } from '@/components/stat-bar'
import { Badge } from '@/components/ui/badge'
import { STAGE_LABELS } from '@/lib/constants'
import { Pet } from '@/types/game'
import { BattleResultModal } from '@/components/battle-result-modal'
import { generateBattleStory } from '@/lib/battle-story'

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

const EVENT_ICONS: Record<string, string> = {
  relationship_formed: '🤝',
  fight: '⚔️',
  love: '💘',
  friendship: '🤝',
  level_up: '⭐',
  death: '💀',
  walk: '🚶',
  letter: '💌',
  random: '✨',
}

interface PetEvent {
  id: string
  event_type: string
  description: string
  created_at: string
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
  recentEvents: PetEvent[]
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days}일 전`
  if (hours > 0) return `${hours}시간 전`
  if (mins > 0) return `${mins}분 전`
  return '방금'
}

export function GardenClient({ session, acceptedFriends, pendingReceived, myPet, recentEvents }: GardenClientProps) {
  const router = useRouter()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMsg, setInviteMsg] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [pending, setPending] = useState(pendingReceived)
  const [friends, setFriends] = useState(acceptedFriends)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionMsg, setActionMsg] = useState('')
  const [battleResult, setBattleResult] = useState<{
    story: string
    won: boolean
    statChanges: { label: string; change: number }[]
  } | null>(null)

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
        router.refresh()
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
        router.refresh()
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

  async function callFight(targetPetId: string, targetPet: Pet) {
    if (!myPet || actionLoading) return
    setActionLoading(`fight-${targetPetId}`)
    setActionMsg('')
    try {
      const res = await fetch(`/api/pets/${myPet.id}/fight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPetId }),
      })
      const data = await res.json()
      if (res.ok) {
        const story = generateBattleStory(myPet, targetPet, data.won)
        const statChanges = data.won
          ? [{ label: '힘', change: 2 }, { label: '행복', change: 10 }]
          : [{ label: '에너지', change: -15 }]
        setBattleResult({ story, won: data.won, statChanges })
      } else {
        setActionMsg(data.error ?? '오류가 발생했습니다')
      }
    } catch {
      setActionMsg('네트워크 오류가 발생했습니다')
    } finally {
      setActionLoading(null)
    }
  }

  const [letterModal, setLetterModal] = useState<{
    targetPetId: string
    targetPetName: string
    step: 'select' | 'preview'
    letterType: string | null
    previewContent: string | null
    loading: boolean
  } | null>(null)

  function openLetterModal(targetPetId: string, targetPetName: string) {
    setLetterModal({ targetPetId, targetPetName, step: 'select', letterType: null, previewContent: null, loading: false })
  }

  async function previewLetter(letterType: string) {
    if (!myPet || !letterModal) return
    setLetterModal(prev => prev ? { ...prev, loading: true, letterType } : null)
    try {
      const res = await fetch(
        `/api/pets/${myPet.id}/letter?targetPetId=${letterModal.targetPetId}&letterType=${letterType}`
      )
      const data = await res.json()
      setLetterModal(prev => prev ? { ...prev, step: 'preview', previewContent: data.content, loading: false } : null)
    } catch {
      setLetterModal(prev => prev ? { ...prev, loading: false } : null)
    }
  }

  async function sendLetter() {
    if (!myPet || !letterModal?.letterType || actionLoading) return
    setActionLoading(`letter-${letterModal.targetPetId}`)
    setActionMsg('')
    setLetterModal(null)
    try {
      const res = await fetch(`/api/pets/${myPet.id}/letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPetId: letterModal.targetPetId, letterType: letterModal.letterType }),
      })
      const data = await res.json()
      if (res.ok) {
        setActionMsg(data.event ?? '💌 편지를 보냈어요!')
      } else {
        setActionMsg(data.error ?? '오류가 발생했습니다')
      }
    } catch {
      setActionMsg('네트워크 오류가 발생했습니다')
    } finally {
      setActionLoading(null)
    }
  }

  const LETTER_TYPES_CONFIG = [
    { key: 'mock', label: '조롱하기', emoji: '😈' },
    { key: 'apologize', label: '사과하기', emoji: '🙏' },
    { key: 'love', label: '사랑을 속삭임', emoji: '💕' },
    { key: 'encourage', label: '격려하기', emoji: '🌟' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* 편지 작성 모달 */}
      {letterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 border-2 border-pink-700 rounded-lg p-5 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-pink-400 font-mono text-sm font-bold">
                💌 {letterModal.targetPetName}에게 편지
              </h3>
              <button onClick={() => setLetterModal(null)} className="text-gray-500 font-mono text-xs hover:text-white">[닫기]</button>
            </div>

            {letterModal.step === 'select' && (
              <div className="space-y-2">
                <p className="text-gray-400 font-mono text-xs">편지 내용을 선택하세요:</p>
                {LETTER_TYPES_CONFIG.map(t => (
                  <button
                    key={t.key}
                    onClick={() => previewLetter(t.key)}
                    disabled={letterModal.loading}
                    className="w-full text-left px-3 py-2.5 font-mono text-sm text-gray-300 border border-gray-700 hover:border-pink-500 hover:text-pink-300 rounded disabled:opacity-40"
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            )}

            {letterModal.step === 'preview' && letterModal.previewContent && (
              <div className="space-y-3">
                <p className="text-gray-500 font-mono text-xs">미리보기:</p>
                <pre className="text-gray-300 font-mono text-xs whitespace-pre-wrap leading-relaxed bg-gray-800 p-3 rounded border border-gray-700 max-h-48 overflow-y-auto">
                  {letterModal.previewContent}
                </pre>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLetterModal(prev => prev ? { ...prev, step: 'select', previewContent: null } : null)}
                    className="flex-1 pixel-btn font-mono text-gray-400 border-gray-600 py-1.5 text-xs"
                  >
                    다시 선택
                  </button>
                  <button
                    onClick={sendLetter}
                    disabled={!!actionLoading}
                    className="flex-1 pixel-btn font-mono text-pink-400 border-pink-700 hover:border-pink-400 disabled:opacity-40 py-1.5 text-xs"
                  >
                    {actionLoading ? '...' : '💌 발송'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <BattleResultModal
        open={!!battleResult}
        story={battleResult?.story ?? ''}
        won={battleResult?.won ?? false}
        statChanges={battleResult?.statChanges ?? []}
        onClose={() => setBattleResult(null)}
      />
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

      {/* Action result message */}
      {actionMsg && (
        <div className="bg-gray-900 border border-yellow-700 rounded-lg px-4 py-2">
          <p className="text-yellow-400 text-xs font-mono">{actionMsg}</p>
        </div>
      )}

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
                onFight={(petId, pet) => callFight(petId, pet)}
                onLetter={(targetPetId) => openLetterModal(targetPetId, f.pet?.name ?? '???')}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent event log */}
      {recentEvents.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
          <h2 className="text-purple-400 font-mono text-sm font-bold">── 최근 이벤트 로그 ──</h2>
          <div className="space-y-2">
            {recentEvents.map(ev => (
              <div key={ev.id} className="flex items-start gap-2">
                <span className="text-base shrink-0">{EVENT_ICONS[ev.event_type] ?? '📌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 font-mono text-xs leading-relaxed">{ev.description}</p>
                </div>
                <span className="text-gray-600 font-mono text-xs shrink-0 whitespace-nowrap">
                  {formatRelativeTime(ev.created_at)}
                </span>
              </div>
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
  onFight,
  onLetter,
  actionLoading,
}: {
  entry: FriendEntry
  myPet: Pet | null
  onRemove: () => void
  removing: boolean
  onFight: (targetPetId: string, pet: Pet) => void
  onLetter: (targetPetId: string) => void
  actionLoading: string | null
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
            <div className="space-y-2 pt-1 border-t border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{REL_ICONS[rel.type] ?? '🤝'}</span>
                <span className="text-gray-300 font-mono text-xs">{REL_LABELS[rel.type] ?? rel.type}</span>
                <span className="text-gray-500 font-mono text-xs ml-auto">{rel.intensity}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded">
                <div
                  className="h-1.5 bg-yellow-400 rounded transition-all"
                  style={{ width: `${rel.intensity}%` }}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onFight(entry.pet!.id, entry.pet!)}
                  disabled={!!actionLoading}
                  className="flex-1 pixel-btn font-mono text-red-400 border-red-700 hover:border-red-400 disabled:opacity-40 py-1.5 text-xs"
                >
                  {actionLoading === `fight-${entry.pet.id}` ? '...' : '⚔️ 싸움걸기'}
                </button>
                <button
                  onClick={() => onLetter(entry.pet!.id)}
                  disabled={!!actionLoading}
                  className="flex-1 pixel-btn font-mono text-pink-400 border-pink-700 hover:border-pink-400 disabled:opacity-40 py-1.5 text-xs"
                >
                  {actionLoading === `letter-${entry.pet.id}` ? '...' : '💌 편지보내기'}
                </button>
              </div>
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
