'use client'

import { useState, useEffect } from 'react'
import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Pet, EVOLUTION_TRAITS } from '@/types/game'
import { PixelPet } from '@/components/pixel-pet'
import { StatBar } from '@/components/stat-bar'
import { CreatePetForm } from './create-pet-form'
import { ThemeToggle } from '@/components/theme-toggle'

interface RelationshipWithPet {
  id: string
  pet_a_id: string
  pet_b_id: string
  type: 'love' | 'friend' | 'rival' | 'enemy'
  intensity: number
  otherPet: { id: string; name: string; stage: string; evolution_type: string | null } | null
}

interface DashboardClientProps {
  session: Session
  initialPet: Pet | null
  initialRelationships?: RelationshipWithPet[]
}

const STAGE_LABELS: Record<string, string> = {
  egg: '알',
  baby: '유아기',
  teen: '성숙기',
  adult: '완전체',
  ultimate: '궁극체',
  elder: '노년기',
}

const REL_ICONS: Record<string, string> = { love: '💘', friend: '🤝', rival: '⚔️', enemy: '😤' }
const REL_LABELS: Record<string, string> = { love: '사랑', friend: '우정', rival: '라이벌', enemy: '앙숙' }

function formatDuration(seconds: number): string {
  if (seconds <= 0) return '성장 준비!'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}시간 ${m}분`
  if (m > 0) return `${m}분 ${s}초`
  return `${s}초`
}

function GrowthTimer({ pet }: { pet: Pet }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (pet.stage === 'egg') {
    const remaining = Math.floor((new Date(pet.born_at).getTime() + 600_000 - now) / 1000)
    return (
      <p className="text-yellow-500 text-xs font-mono">
        {remaining > 0 ? `유아기까지: ${formatDuration(remaining)}` : '🎉 성장 준비!'}
      </p>
    )
  }

  if (pet.stage === 'baby') {
    const remaining = Math.floor((new Date(pet.stage_entered_at).getTime() + 48 * 3600_000 - now) / 1000)
    return (
      <p className="text-yellow-500 text-xs font-mono">
        {remaining > 0
          ? `성숙기까지: ${formatDuration(remaining)} (평균 스탯 60 이상 필요)`
          : '🎉 성장 조건 충족!'}
      </p>
    )
  }

  if (pet.stage === 'teen') {
    const remaining = Math.floor((new Date(pet.stage_entered_at).getTime() + 72 * 3600_000 - now) / 1000)
    return (
      <p className="text-yellow-500 text-xs font-mono">
        {remaining > 0
          ? `완전체까지: ${formatDuration(remaining)} (평균 스탯 70 이상 필요)`
          : '🎉 성장 조건 충족!'}
      </p>
    )
  }

  if (pet.stage === 'ultimate') {
    if (!pet.ultimate_at) return null
    const remaining = Math.floor((new Date(pet.ultimate_at).getTime() + 259200_000 - now) / 1000)
    return (
      <p className="text-yellow-500 text-xs font-mono">
        {remaining > 0 ? `노년기까지: ${formatDuration(remaining)}` : '🎉 노년기 전환 준비!'}
      </p>
    )
  }

  if (pet.stage === 'elder') {
    const elderAt = pet.elder_at ? new Date(pet.elder_at).getTime() : now
    const ageDays = Math.floor((now - elderAt) / 86400000)
    const daysLeft = Math.max(0, 10 - ageDays)
    return (
      <p className="text-yellow-500 text-xs font-mono">
        최종 선택까지 D-{daysLeft}일
      </p>
    )
  }

  return null
}

export function DashboardClient({ session, initialPet, initialRelationships = [] }: DashboardClientProps) {
  const [pet, setPet] = useState<Pet | null>(initialPet)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!initialPet) return
    fetch(`/api/pets/${initialPet.id}/tick`, { method: 'POST', credentials: 'include' })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) {
          console.error('[tick] API error', res.status, data)
          setMessage(`[tick 오류 ${res.status}] ${data.error ?? '알 수 없는 오류'}`)
          return
        }
        if (data.pet) setPet(data.pet)
      })
      .catch(err => console.error('[tick] Fetch failed:', err))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function callPetAction(action: string) {
    if (!pet || actionLoading) return
    setActionLoading(action)
    setMessage('')

    try {
      const res = await fetch(`/api/pets/${pet.id}/${action}`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.pet) {
        setPet(data.pet)
        const msgs: Record<string, string> = {
          feed: '냠냠! 배가 불러졌어요 🍖',
          play: '신난다! 행복해졌어요 🎮',
          evolve: `✨ ${data.pet.name}이(가) 궁극체로 진화했어요!`,
        }
        setMessage(msgs[action] ?? '완료!')
      } else {
        setMessage(data.error ?? '오류가 발생했습니다')
      }
    } catch {
      setMessage('네트워크 오류가 발생했습니다')
    } finally {
      setActionLoading(null)
    }
  }

  async function callRebirth(type: 'rebirth' | 'reset') {
    if (!pet || actionLoading) return
    setActionLoading(type)
    setMessage('')

    try {
      const res = await fetch(`/api/pets/${pet.id}/rebirth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      const data = await res.json()
      if (res.ok && data.pet) {
        setPet(data.pet)
        setMessage(
          type === 'rebirth'
            ? `🥚 ${data.pet.name}이(가) 새로운 알로 부활했어요!`
            : '🔄 새로운 알이 생성되었어요!'
        )
      } else {
        setMessage(data.error ?? '오류가 발생했습니다')
      }
    } catch {
      setMessage('네트워크 오류가 발생했습니다')
    } finally {
      setActionLoading(null)
    }
  }

  if (!pet) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <h1
            className="text-yellow-400 font-bold text-xl tracking-widest"
            style={{ fontFamily: 'monospace', textShadow: '2px 2px 0 #92400e' }}
          >
            CIRCLE
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-green-700 hover:text-green-400 text-xs font-mono"
            >
              [로그아웃]
            </button>
          </div>
        </header>
        <div className="text-center space-y-4 py-8">
          <div className="text-6xl animate-bounce">🥚</div>
          <p className="text-green-300 font-mono">아직 다마고치가 없어요!</p>
          <p className="text-green-700 text-sm font-mono">첫 번째 알을 부화시켜 보세요</p>
        </div>
        <CreatePetForm onCreated={setPet} />
      </div>
    )
  }

  const evolutionInfo = pet.evolution_type ? EVOLUTION_TRAITS[pet.evolution_type] : null

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1
          className="text-yellow-400 font-bold text-xl tracking-widest"
          style={{ fontFamily: 'monospace', textShadow: '2px 2px 0 #92400e' }}
        >
          CIRCLE
        </h1>
        <nav className="flex items-center gap-3">
          <Link href="/garden" className="text-green-600 hover:text-green-300 text-xs font-mono">
            [가든]
          </Link>
          <ThemeToggle />
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-green-700 hover:text-green-400 text-xs font-mono"
          >
            [로그아웃]
          </button>
        </nav>
      </header>

      {/* Pet display */}
      <div className="pixel-card p-6 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <h2 className="text-green-300 font-mono font-bold text-xl">{pet.name}</h2>
          <span className="text-yellow-400 font-mono text-sm border border-yellow-400 px-2 py-0">
            {STAGE_LABELS[pet.stage] ?? pet.stage}
          </span>
          {evolutionInfo && (
            <span className={`font-mono text-sm border border-current px-2 py-0 ${evolutionInfo.color}`}>
              {evolutionInfo.emoji} {evolutionInfo.label}
            </span>
          )}
        </div>

        <div className="flex justify-center py-4">
          <PixelPet
            stage={pet.stage}
            evolutionType={pet.evolution_type}
            size="lg"
            animate
          />
        </div>

        <p className="text-green-800 text-xs font-mono">{pet.age_days}일차</p>

        <GrowthTimer pet={pet} />

        {message && (
          <p className="text-yellow-400 text-xs font-mono border border-yellow-900 py-1 px-2">
            {message}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="pixel-card p-4 space-y-3">
        <h3 className="text-green-600 font-mono text-xs uppercase tracking-widest">── 생명 지수 ──</h3>
        <StatBar label="배고픔" value={pet.hunger} color="bg-orange-400" />
        <StatBar label="행복" value={pet.happiness} color="bg-pink-400" />
        <StatBar label="에너지" value={pet.energy} color="bg-cyan-400" />
      </div>

      {(pet.stage === 'adult' || pet.stage === 'ultimate' || pet.stage === 'elder') && (
        <div className="pixel-card p-4 space-y-3">
          <h3 className="text-green-600 font-mono text-xs uppercase tracking-widest">── 능력치 ──</h3>
          <StatBar label="힘" value={pet.strength} color="bg-red-400" />
          <StatBar label="지혜" value={pet.wisdom} color="bg-blue-400" />
          <StatBar label="암흑" value={pet.dark} color="bg-purple-400" />
          <StatBar label="조화" value={pet.harmony} color="bg-green-400" />
        </div>
      )}

      {/* Relationships */}
      {initialRelationships.length > 0 && (
        <div className="pixel-card p-4 space-y-3">
          <h3 className="text-green-600 font-mono text-xs uppercase tracking-widest">── 관계 현황 ──</h3>
          <div className="space-y-2">
            {initialRelationships.map(rel => (
              <div key={rel.id} className="flex items-center gap-2">
                <span className="text-base">{REL_ICONS[rel.type] ?? '🤝'}</span>
                <span className="text-gray-300 font-mono text-xs w-16 shrink-0">{REL_LABELS[rel.type] ?? rel.type}</span>
                <span className="text-green-300 font-mono text-xs flex-1 truncate">
                  {rel.otherPet?.name ?? '???'}
                </span>
                <div className="w-16 h-1 bg-gray-800 rounded shrink-0">
                  <div className="h-1 bg-yellow-400 rounded" style={{ width: `${rel.intensity}%` }} />
                </div>
                <span className="text-gray-500 font-mono text-xs w-6 text-right shrink-0">{rel.intensity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final choice (elder 10일차) */}
      {pet.final_choice_required && (
        <div className="pixel-card p-4 space-y-3 border-yellow-400">
          <h3 className="text-yellow-400 font-mono text-xs uppercase tracking-widest">── ⚠️ 최종 선택 ──</h3>
          <p className="text-green-300 font-mono text-xs">
            {pet.name}의 생애가 마무리되어 가고 있어요. 다음 여정을 선택해주세요.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => callRebirth('rebirth')}
              disabled={!!actionLoading}
              className="pixel-btn font-mono text-yellow-400 border-yellow-700 hover:border-yellow-400 disabled:opacity-40 py-2 text-sm"
            >
              {actionLoading === 'rebirth' ? '...' : '🥚 알로 부활'}
            </button>
            <button
              onClick={() => callRebirth('reset')}
              disabled={!!actionLoading}
              className="pixel-btn font-mono text-red-400 border-red-700 hover:border-red-400 disabled:opacity-40 py-2 text-sm"
            >
              {actionLoading === 'reset' ? '...' : '🔄 완전 초기화'}
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => callPetAction('feed')}
          disabled={!!actionLoading}
          className="pixel-btn font-mono text-orange-400 border-orange-700 hover:border-orange-400 disabled:opacity-40 py-2"
        >
          {actionLoading === 'feed' ? '...' : '🍖 먹이기'}
        </button>
        <button
          onClick={() => callPetAction('play')}
          disabled={!!actionLoading}
          className="pixel-btn font-mono text-pink-400 border-pink-700 hover:border-pink-400 disabled:opacity-40 py-2"
        >
          {actionLoading === 'play' ? '...' : '🎮 놀아주기'}
        </button>
        {pet.stage === 'adult' && (
          <button
            onClick={() => callPetAction('evolve')}
            disabled={!!actionLoading}
            className="col-span-2 pixel-btn font-mono text-yellow-400 border-yellow-700 hover:border-yellow-400 disabled:opacity-40 py-2"
          >
            {actionLoading === 'evolve' ? '진화 중...' : '✨ 궁극체로 진화'}
          </button>
        )}
      </div>
    </div>
  )
}
