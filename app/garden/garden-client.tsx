'use client'

import { useState } from 'react'
import { Session } from 'next-auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PixelPet } from '@/components/pixel-pet'
import { StatBar } from '@/components/stat-bar'
import { STAGE_LABELS } from '@/lib/constants'
import { Pet } from '@/types/game'
import { BattleResultModal } from '@/components/battle-result-modal'
import { generateBattleStory } from '@/lib/battle-story'
import { ThemeToggle } from '@/components/theme-toggle'

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

const REL_COLORS: Record<string, string> = {
  love: 'text-pink-400 border-pink-800',
  friend: 'text-yellow-400 border-yellow-800',
  rival: 'text-orange-400 border-orange-800',
  enemy: 'text-red-400 border-red-800',
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

function UserAvatar({ name, image, size = 'sm' }: { name?: string | null; image?: string | null; size?: 'sm' | 'md' }) {
  const sz = size === 'md' ? 'w-10 h-10 text-base' : 'w-7 h-7 text-xs'
  const initials = (name ?? '?').slice(0, 2).toUpperCase()
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={name ?? ''} className={`${sz} rounded-full object-cover border border-green-800`} />
  }
  return (
    <div className={`${sz} rounded-full bg-green-900 border border-green-700 flex items-center justify-center font-mono font-bold text-green-300`}>
      {initials}
    </div>
  )
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
  const [fightCountLeft, setFightCountLeft] = useState<number | null>(null)

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
        setInviteMsg('친구 요청을 보냈어요! ✉️')
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
        if (typeof data.fightCountLeft === 'number') setFightCountLeft(data.fightCountLeft)
        const baseStory = generateBattleStory(myPet, targetPet, data.won)
        const story = data.sneakAttack
          ? `자고 있던 ${targetPet.name}을(를) 급습했다!!\n${baseStory}`
          : baseStory
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <BattleResultModal
        open={!!battleResult}
        story={battleResult?.story ?? ''}
        won={battleResult?.won ?? false}
        statChanges={battleResult?.statChanges ?? []}
        onClose={() => setBattleResult(null)}
      />

      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-green-700 hover:text-green-400 font-mono text-sm">
            ← 내 다마고치
          </Link>
          <h1 className="text-green-300 font-mono font-bold text-xl">👥 소셜</h1>
          <span className="text-green-700 font-mono text-xs border border-green-900 px-2">{friends.length}명</span>
        </div>
        <ThemeToggle />
      </header>

      {/* My status bar */}
      {myPet && (
        <div className="pixel-card p-3 flex items-center gap-3">
          <PixelPet stage={myPet.stage} evolutionType={myPet.evolution_type} size="sm" animate={false} />
          <div className="flex-1 min-w-0">
            <p className="text-green-300 font-mono text-sm font-bold truncate">{myPet.name}</p>
            <p className="text-green-700 font-mono text-xs">{STAGE_LABELS[myPet.stage] ?? myPet.stage}</p>
          </div>
          <UserAvatar name={session.user?.name} image={session.user?.image} />
        </div>
      )}

      {/* Action result message */}
      {actionMsg && (
        <div className="pixel-card px-4 py-2 border-yellow-900">
          <p className="text-yellow-400 text-xs font-mono">{actionMsg}</p>
        </div>
      )}

      {/* Fight count */}
      {fightCountLeft !== null && (
        <div className="pixel-card px-4 py-2 border-red-900">
          <p className="text-red-400 text-xs font-mono">⚔️ 오늘 싸움 남은 횟수: {fightCountLeft}회</p>
        </div>
      )}

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="pixel-card p-4 space-y-3 border-yellow-900">
          <h2 className="text-yellow-400 font-mono text-xs uppercase tracking-widest">── 받은 친구 요청 ({pending.length}) ──</h2>
          <div className="space-y-2">
            {pending.map(p => (
              <div key={p.friendshipId} className="flex items-center gap-3">
                <UserAvatar name={p.user.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-green-300 font-mono text-sm truncate">{p.user.name ?? '알 수 없음'}</p>
                  <p className="text-green-700 text-xs font-mono truncate">{p.user.email}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => acceptFriend(p.friendshipId)}
                    disabled={actionLoading === p.friendshipId}
                    className="pixel-btn font-mono text-green-400 border-green-700 hover:border-green-400 disabled:opacity-40 px-2 py-1 text-xs"
                  >
                    수락
                  </button>
                  <button
                    onClick={() => rejectFriend(p.friendshipId)}
                    disabled={actionLoading === p.friendshipId}
                    className="pixel-btn font-mono text-red-400 border-red-700 hover:border-red-400 disabled:opacity-40 px-2 py-1 text-xs"
                  >
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friend invite */}
      <div className="pixel-card p-4 space-y-3">
        <h2 className="text-green-600 font-mono text-xs uppercase tracking-widest">── 친구 초대 ──</h2>
        <form onSubmit={sendInvite} className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="친구 이메일 입력"
            className="flex-1 bg-transparent border border-green-900 focus:border-green-500 rounded-none px-3 py-2 text-green-300 text-sm font-mono placeholder:text-green-900 focus:outline-none"
          />
          <button
            type="submit"
            disabled={inviteLoading}
            className="pixel-btn font-mono text-green-400 border-green-700 hover:border-green-400 disabled:opacity-40 px-4 py-2 text-sm"
          >
            {inviteLoading ? '...' : '초대'}
          </button>
        </form>
        {inviteMsg && (
          <p className="text-yellow-400 text-xs font-mono">{inviteMsg}</p>
        )}
      </div>

      {/* Friends list */}
      {friends.length === 0 ? (
        <div className="pixel-card p-8 text-center space-y-3">
          <p className="text-4xl">👥</p>
          <p className="text-green-700 font-mono text-sm">아직 친구가 없어요</p>
          <p className="text-green-900 text-xs font-mono">이메일로 친구를 초대해보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-green-600 font-mono text-xs uppercase tracking-widest">── 친구 목록 ──</h2>
          <div className="grid grid-cols-1 gap-3">
            {friends.map(f => (
              <FriendCard
                key={f.friendshipId}
                entry={f}
                myPet={myPet}
                onRemove={() => removeFriend(f.friendshipId)}
                removing={actionLoading === f.friendshipId}
                onFight={(petId, pet) => callFight(petId, pet)}
                onLetter={() => {}}
                myPetId={myPet?.id ?? null}
                onLetterSent={() => { setActionMsg('💌 편지를 보냈어요!'); router.refresh() }}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent events */}
      {recentEvents.length > 0 && (
        <div className="pixel-card p-4 space-y-3">
          <h2 className="text-green-600 font-mono text-xs uppercase tracking-widest">── 최근 소셜 이벤트 ──</h2>
          <div className="space-y-2">
            {recentEvents.map(ev => (
              <div key={ev.id} className="flex items-start gap-2">
                <span className="text-base shrink-0">{EVENT_ICONS[ev.event_type] ?? '📌'}</span>
                <p className="text-green-800 font-mono text-xs flex-1 leading-relaxed">{ev.description}</p>
                <span className="text-green-900 font-mono text-xs shrink-0 whitespace-nowrap">
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

const LETTER_TYPES_CONFIG = [
  { key: 'mock', label: '조롱하기', emoji: '😈' },
  { key: 'apologize', label: '사과하기', emoji: '🙏' },
  { key: 'love', label: '사랑을 속삭임', emoji: '💕' },
  { key: 'encourage', label: '격려하기', emoji: '🌟' },
]

function FriendCard({
  entry,
  myPet,
  myPetId,
  onRemove,
  removing,
  onFight,
  onLetter,
  onLetterSent,
  actionLoading,
}: {
  entry: FriendEntry
  myPet: Pet | null
  myPetId: string | null
  onRemove: () => void
  removing: boolean
  onFight: (targetPetId: string, pet: Pet) => void
  onLetter: (targetPetId: string) => void
  onLetterSent: () => void
  actionLoading: string | null
}) {
  const [letterStep, setLetterStep] = useState<null | 'select' | 'preview'>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [letterLoading, setLetterLoading] = useState(false)

  const rel = entry.relationship

  async function handleTypeSelect(type: string) {
    if (!myPetId || !entry.pet) return
    setSelectedType(type)
    setLetterLoading(true)
    try {
      const res = await fetch(
        `/api/pets/${myPetId}/letter?targetPetId=${entry.pet.id}&letterType=${type}`
      )
      const data = await res.json()
      setPreviewContent(data.content)
      setLetterStep('preview')
    } finally {
      setLetterLoading(false)
    }
  }

  async function handleSend() {
    if (!myPetId || !entry.pet || !selectedType) return
    setLetterLoading(true)
    try {
      const res = await fetch(`/api/pets/${myPetId}/letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPetId: entry.pet.id, letterType: selectedType }),
      })
      if (res.ok) {
        setLetterStep(null)
        setSelectedType(null)
        setPreviewContent(null)
        onLetterSent()
      }
    } finally {
      setLetterLoading(false)
    }
  }

  return (
    <div className="pixel-card p-4 space-y-3">
      {/* User header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserAvatar name={entry.user.name} image={entry.user.image} size="md" />
          <div>
            <p className="text-green-300 font-mono font-bold text-sm">{entry.user.name ?? '알 수 없음'}</p>
            <p className="text-green-800 text-xs font-mono">{entry.user.email}</p>
          </div>
        </div>
        <button
          onClick={onRemove}
          disabled={removing}
          className="text-green-900 hover:text-red-400 text-xs font-mono disabled:opacity-40"
        >
          [삭제]
        </button>
      </div>

      {entry.pet ? (
        <>
          {/* Pet info */}
          <div className="flex items-center gap-3 border-t border-green-900 pt-3">
            <PixelPet stage={entry.pet.stage} evolutionType={entry.pet.evolution_type} size="md" animate={false} />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-green-300 font-mono text-sm font-bold">{entry.pet.name}</span>
                <span className="text-green-700 font-mono text-xs border border-green-900 px-1">
                  {STAGE_LABELS[entry.pet.stage] ?? entry.pet.stage}
                </span>
                {entry.pet.is_sleeping && <span className="text-xs">💤</span>}
              </div>
              <StatBar label="배고픔" value={entry.pet.hunger} color="bg-orange-400" />
              <StatBar label="행복" value={entry.pet.happiness} color="bg-pink-400" />
              <StatBar label="에너지" value={entry.pet.energy} color="bg-cyan-400" />
            </div>
          </div>

          {/* Relationship badge */}
          {rel && (
            <div className="flex items-center gap-2">
              <span className={`font-mono text-xs border px-2 py-0.5 ${REL_COLORS[rel.type] ?? 'text-green-400 border-green-800'}`}>
                {REL_ICONS[rel.type]} {REL_LABELS[rel.type] ?? rel.type}
              </span>
              <div className="flex-1 h-1 bg-green-950">
                <div className="h-1 bg-yellow-500 transition-all" style={{ width: `${rel.intensity}%` }} />
              </div>
              <span className="text-green-700 font-mono text-xs">{rel.intensity}</span>
            </div>
          )}

          {/* Actions */}
          {myPet && (
            <div className="space-y-2">
              {letterStep === null && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onFight(entry.pet!.id, entry.pet!)}
                    disabled={!!actionLoading}
                    className="flex-1 pixel-btn font-mono text-red-400 border-red-800 hover:border-red-400 disabled:opacity-40 py-1.5 text-xs"
                  >
                    {actionLoading === `fight-${entry.pet.id}` ? '...' : '⚔️ 싸움걸기'}
                  </button>
                  <button
                    onClick={() => setLetterStep('select')}
                    disabled={!!actionLoading || letterLoading}
                    className="flex-1 pixel-btn font-mono text-pink-400 border-pink-800 hover:border-pink-400 disabled:opacity-40 py-1.5 text-xs"
                  >
                    💌 편지보내기
                  </button>
                </div>
              )}

              {letterStep === 'select' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-pink-400 font-mono text-xs">편지 종류 선택:</p>
                    <button onClick={() => setLetterStep(null)} className="text-green-800 font-mono text-xs hover:text-green-400">✕ 취소</button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {LETTER_TYPES_CONFIG.map(t => (
                      <button
                        key={t.key}
                        onClick={() => handleTypeSelect(t.key)}
                        disabled={letterLoading}
                        className="pixel-btn font-mono text-xs text-pink-300 border-pink-900 hover:border-pink-500 py-2 disabled:opacity-40"
                      >
                        {letterLoading ? '...' : `${t.emoji} ${t.label}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {letterStep === 'preview' && previewContent && (
                <div className="space-y-2">
                  <p className="text-pink-400 font-mono text-xs">미리보기:</p>
                  <pre className="text-green-300 font-mono text-xs whitespace-pre-wrap leading-relaxed pixel-card p-3 max-h-36 overflow-y-auto">
                    {previewContent}
                  </pre>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setLetterStep('select'); setPreviewContent(null) }}
                      className="flex-1 pixel-btn font-mono text-green-600 border-green-800 py-1.5 text-xs"
                    >
                      다시 선택
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={letterLoading}
                      className="flex-1 pixel-btn font-mono text-pink-400 border-pink-700 hover:border-pink-400 disabled:opacity-40 py-1.5 text-xs"
                    >
                      {letterLoading ? '...' : '💌 발송'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {myPet && !rel && (
            <p className="text-green-900 text-xs font-mono border-t border-green-950 pt-2">
              아직 관계가 형성되지 않았어요
            </p>
          )}
        </>
      ) : (
        <p className="text-green-900 text-xs font-mono border-t border-green-950 pt-2">펫이 없어요</p>
      )}
    </div>
  )
}
