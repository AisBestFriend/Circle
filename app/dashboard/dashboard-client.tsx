'use client'

import { useState, useEffect, useRef } from 'react'
import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Pet, EVOLUTION_TRAITS } from '@/types/game'
import { PixelPet } from '@/components/pixel-pet'
import { StatBar } from '@/components/stat-bar'
import { CreatePetForm } from './create-pet-form'
import { ThemeToggle } from '@/components/theme-toggle'
import { BattleResultModal } from '@/components/battle-result-modal'
import { generateBattleStory } from '@/lib/battle-story'

interface RelationshipWithPet {
  id: string
  pet_a_id: string
  pet_b_id: string
  type: 'love' | 'friend' | 'rival' | 'enemy'
  intensity: number
  otherPet: { id: string; name: string; stage: string; evolution_type: string | null } | null
}

interface PetEvent {
  id: string
  event_type: string
  description: string
  created_at: string
}

interface PendingLetter {
  id: string
  from_pet_id: string
  fromPetName: string
  letter_type: 'mock' | 'apologize' | 'love' | 'encourage'
  content: string
  created_at: string
}

interface DashboardClientProps {
  session: Session
  initialPet: Pet | null
  initialRelationships?: RelationshipWithPet[]
  recentEvents?: PetEvent[]
  initialPendingLetters?: PendingLetter[]
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

function EvolutionGauge({ pet }: { pet: Pet }) {
  const stats = [
    { key: 'strength', label: '힘', value: pet.strength, color: 'bg-red-400' },
    { key: 'wisdom', label: '지혜', value: pet.wisdom, color: 'bg-blue-400' },
    { key: 'dark', label: '암흑', value: pet.dark, color: 'bg-purple-400' },
    { key: 'harmony', label: '조화', value: pet.harmony, color: 'bg-green-400' },
  ]
  const maxVal = Math.max(...stats.map(s => s.value))
  const topStat = stats.find(s => s.value === maxVal)

  const evolutionHints: Record<string, string> = {
    strength: '전사형 ⚔️',
    wisdom: '현자형 ✨',
    dark: '다크형 🌑',
    harmony: '균형형 ☯️',
  }

  return (
    <div className="pixel-card p-4 space-y-3">
      <h3 className="text-green-600 font-mono text-xs uppercase tracking-widest">── 진화 게이지 ──</h3>
      {stats.map(s => (
        <div key={s.key} className="flex items-center gap-2">
          <span className={`font-mono text-xs w-8 shrink-0 ${s.value === maxVal ? 'text-yellow-400 font-bold' : 'text-gray-400'}`}>
            {s.label}
          </span>
          <div className="flex-1 h-2 bg-gray-800 rounded">
            <div className={`h-2 rounded ${s.color}`} style={{ width: `${s.value}%` }} />
          </div>
          <span className="text-gray-500 font-mono text-xs w-6 text-right">{s.value}</span>
        </div>
      ))}
      {topStat && (
        <p className="text-yellow-400 text-xs font-mono text-center pt-1">
          현재 방향: {evolutionHints[topStat.key]}
        </p>
      )}
    </div>
  )
}

// ── 애니메이션 오버레이 컴포넌트들 ──

function FloatingHearts() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {[0, 1, 2, 3].map(i => (
        <motion.span
          key={i}
          className="absolute text-xl"
          initial={{ opacity: 1, y: 0, x: (i - 1.5) * 22 }}
          animate={{ opacity: 0, y: -70, x: (i - 1.5) * 35 }}
          transition={{ duration: 1.2, delay: i * 0.15 }}
        >
          💖
        </motion.span>
      ))}
    </div>
  )
}

function SleepZzz() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="absolute font-bold text-cyan-300 font-mono"
          style={{ fontSize: `${14 + i * 5}px` }}
          initial={{ opacity: 0, y: 10, x: 18 + i * 14 }}
          animate={{ opacity: [0, 1, 1, 0], y: -30 - i * 18 }}
          transition={{ duration: 1.6, delay: i * 0.45 }}
        >
          Z
        </motion.span>
      ))}
    </div>
  )
}

function MeditationRings() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2 border-blue-400"
          style={{ width: 64, height: 64 }}
          initial={{ opacity: 0.9, scale: 0.4 }}
          animate={{ opacity: 0, scale: 2.8 }}
          transition={{ duration: 1.6, delay: i * 0.45, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

function FlyingFood() {
  return (
    <motion.div
      className="absolute pointer-events-none text-2xl"
      initial={{ opacity: 1, y: 40, x: -50, scale: 0.6 }}
      animate={{ opacity: [1, 1, 0], y: 0, x: 0, scale: [0.6, 1.3, 1] }}
      transition={{ duration: 0.7 }}
    >
      🍖
    </motion.div>
  )
}

function StrengthPopup() {
  return (
    <motion.div
      className="absolute top-2 pointer-events-none"
      initial={{ opacity: 0, scale: 0.3, y: 0 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.4, 1.2, 0.8], y: [0, -15] }}
      transition={{ duration: 1.0 }}
    >
      <span className="text-4xl">💪</span>
    </motion.div>
  )
}

function WalkFootprints() {
  return (
    <div className="absolute bottom-1 w-full pointer-events-none flex justify-around px-2">
      {[0, 1, 2, 3].map(i => (
        <motion.span
          key={i}
          className="text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5, delay: i * 0.3 }}
        >
          👣
        </motion.span>
      ))}
    </div>
  )
}

const LETTER_TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  mock: { label: '조롱', emoji: '😈' },
  apologize: { label: '사과', emoji: '🙏' },
  love: { label: '사랑', emoji: '💕' },
  encourage: { label: '격려', emoji: '🌟' },
}

const REACTION_OPTIONS = [
  { key: 'grateful', label: '감사', emoji: '🙏' },
  { key: 'angry', label: '분노', emoji: '😡' },
  { key: 'happy', label: '행복', emoji: '😊' },
  { key: 'love', label: '사랑', emoji: '💕' },
]

export function DashboardClient({ session, initialPet, initialRelationships = [], recentEvents = [], initialPendingLetters = [] }: DashboardClientProps) {
  const [pet, setPet] = useState<Pet | null>(initialPet)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [showFightSelect, setShowFightSelect] = useState(false)
  const [fightCountLeft, setFightCountLeft] = useState<number | null>(null)
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null)
  const [battleResult, setBattleResult] = useState<{
    story: string
    won: boolean
    statChanges: { label: string; change: number }[]
  } | null>(null)
  const [showEvolveEffect, setShowEvolveEffect] = useState(false)
  const [evolveText, setEvolveText] = useState('')
  const [eventPopup, setEventPopup] = useState<string | null>(null)
  const [pendingLetters, setPendingLetters] = useState<PendingLetter[]>(initialPendingLetters)
  const [openedLetter, setOpenedLetter] = useState<PendingLetter | null>(null)
  const [letterLoading, setLetterLoading] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(false)
  const prevStageRef = useRef<string>(initialPet?.stage ?? 'egg')

  function triggerAnimation(name: string, duration = 1500) {
    setActiveAnimation(name)
    setTimeout(() => setActiveAnimation(null), duration)
  }

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
        if (data.pet) {
          if (data.pet.stage !== prevStageRef.current) {
            const oldLabel = STAGE_LABELS[prevStageRef.current] ?? prevStageRef.current
            const newLabel = STAGE_LABELS[data.pet.stage] ?? data.pet.stage
            setEvolveText(`✨ 성장했어요! ${oldLabel} → ${newLabel}`)
            setShowEvolveEffect(true)
          }
          prevStageRef.current = data.pet.stage
          setPet(data.pet)
        }
        if (data.event) {
          setEventPopup(data.event)
          setTimeout(() => setEventPopup(null), 3000)
        }
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
        if (data.pet.stage !== prevStageRef.current) {
          const oldLabel = STAGE_LABELS[prevStageRef.current] ?? prevStageRef.current
          const newLabel = STAGE_LABELS[data.pet.stage] ?? data.pet.stage
          setEvolveText(`✨ 성장했어요! ${oldLabel} → ${newLabel}`)
          setShowEvolveEffect(true)
        }
        prevStageRef.current = data.pet.stage
        setPet(data.pet)

        const animMap: Record<string, string> = {
          feed: 'feed',
          play: 'play',
          sleep: 'sleep',
          walk: 'walk',
        }
        if (animMap[action]) triggerAnimation(animMap[action])

        const msgs: Record<string, string> = {
          feed: '냠냠! 배가 불러졌어요 🍖',
          play: '신난다! 행복해졌어요 🎮',
          sleep: '쿨쿨... 에너지가 회복됐어요 😴',
          walk: data.event ? data.event : '상쾌한 산책이었어요 🚶',
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

  async function callTrain(type: 'strength' | 'wisdom') {
    if (!pet || actionLoading) return
    setActionLoading(`train-${type}`)
    setMessage('')

    try {
      const res = await fetch(`/api/pets/${pet.id}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      const data = await res.json()
      if (res.ok && data.pet) {
        setPet(data.pet)
        triggerAnimation(`train-${type}`)
        setMessage(type === 'strength' ? '💪 근력훈련 완료! 힘이 강해졌어요!' : '🧘 명상 완료! 지혜가 깊어졌어요!')
      } else {
        setMessage(data.error ?? '오류가 발생했습니다')
      }
    } catch {
      setMessage('네트워크 오류가 발생했습니다')
    } finally {
      setActionLoading(null)
    }
  }

  async function callFight(targetPetId: string) {
    if (!pet || actionLoading) return
    setActionLoading('fight')
    setMessage('')
    setShowFightSelect(false)

    try {
      const res = await fetch(`/api/pets/${pet.id}/fight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPetId }),
      })
      const data = await res.json()
      if (res.ok && data.pet) {
        setPet(data.pet)
        if (typeof data.fightCountLeft === 'number') setFightCountLeft(data.fightCountLeft)
        const story = generateBattleStory(
          data.attacker ?? { name: pet.name, strength: pet.strength, wisdom: pet.wisdom, dark: pet.dark, harmony: pet.harmony },
          data.defender ?? { name: '상대', strength: 50, wisdom: 50, dark: 50, harmony: 50 },
          data.won
        )
        const statChanges = data.won
          ? [{ label: '힘', change: 2 }, { label: '행복', change: 10 }]
          : [{ label: '에너지', change: -15 }]
        setBattleResult({ story, won: data.won, statChanges })
      } else {
        setMessage(data.error ?? '오류가 발생했습니다')
      }
    } catch {
      setMessage('네트워크 오류가 발생했습니다')
    } finally {
      setActionLoading(null)
    }
  }

  async function reactToLetter(letterId: string, action: 'read' | 'discard', reaction?: string) {
    setLetterLoading(letterId)
    try {
      const res = await fetch(`/api/letters/${letterId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reaction }),
      })
      if (res.ok) {
        setPendingLetters(prev => prev.filter(l => l.id !== letterId))
        setOpenedLetter(null)
      }
    } finally {
      setLetterLoading(null)
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
  const isUltimateOrAbove = pet.stage === 'ultimate' || pet.stage === 'elder'
  const fightablePets = initialRelationships.filter(r => r.otherPet !== null)

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-4">
      {/* 진화 플래시 효과 */}
      <AnimatePresence>
        {showEvolveEffect && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.9, 0] }}
            transition={{ duration: 1.6 }}
            onAnimationComplete={() => setShowEvolveEffect(false)}
          >
            <div className="absolute inset-0 bg-yellow-300" />
            <motion.div
              className="relative z-10 text-center px-6 py-4 bg-gray-900 border-4 border-yellow-400 rounded-lg"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.4, 1.2, 1], opacity: [0, 1, 1] }}
              transition={{ duration: 1.0 }}
            >
              <p className="text-yellow-400 font-mono font-bold text-xl">{evolveText}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 이벤트 팝업 (말풍선) */}
      <AnimatePresence>
        {eventPopup && (
          <motion.div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-gray-900 border-2 border-yellow-400 rounded-lg px-4 py-2 max-w-xs w-full"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className="text-yellow-400 font-mono text-xs text-center">{eventPopup}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 싸움 결과 모달 */}
      <BattleResultModal
        open={!!battleResult}
        story={battleResult?.story ?? ''}
        won={battleResult?.won ?? false}
        statChanges={battleResult?.statChanges ?? []}
        onClose={() => setBattleResult(null)}
      />

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
          <button
            onClick={() => setShowStats(prev => !prev)}
            className="text-blue-400 hover:text-blue-300 text-xs font-mono"
          >
            [스탯]
          </button>
          <button
            onClick={() => setOpenedLetter(null)}
            className="relative text-pink-400 hover:text-pink-300 text-xs font-mono"
          >
            [편지함{pendingLetters.length > 0 && <span className="ml-0.5 text-yellow-400 font-bold">{pendingLetters.length}</span>}]
          </button>
          <ThemeToggle />
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-green-700 hover:text-green-400 text-xs font-mono"
          >
            [로그아웃]
          </button>
        </nav>
      </header>

      {/* 스탯 상세 패널 */}
      {showStats && (
        <div className="pixel-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-blue-400 font-mono text-xs uppercase tracking-widest">── 전체 스탯 ──</h3>
            <button onClick={() => setShowStats(false)} className="text-gray-500 font-mono text-xs hover:text-white">[닫기]</button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              { label: '배고픔', value: pet.hunger, color: 'text-orange-400' },
              { label: '행복', value: pet.happiness, color: 'text-pink-400' },
              { label: '에너지', value: pet.energy, color: 'text-cyan-400' },
              { label: '힘', value: pet.strength, color: 'text-red-400' },
              { label: '지혜', value: pet.wisdom, color: 'text-blue-400' },
              { label: '암흑', value: pet.dark, color: 'text-purple-400' },
              { label: '조화', value: pet.harmony, color: 'text-green-400' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-gray-400 font-mono text-xs w-10 shrink-0">{s.label}</span>
                <div className="flex-1 h-2 bg-gray-800 rounded">
                  <div className={`h-2 rounded bg-current ${s.color}`} style={{ width: `${s.value}%` }} />
                </div>
                <span className={`font-mono text-xs w-6 text-right shrink-0 ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-600 font-mono text-xs pt-1">나이: {pet.age_days}일 | 단계: {STAGE_LABELS[pet.stage] ?? pet.stage}</p>
        </div>
      )}

      {/* 편지함 */}
      {pendingLetters.length > 0 && (
        <div className="pixel-card p-4 space-y-3">
          <h3 className="text-pink-400 font-mono text-xs uppercase tracking-widest">── 받은 편지 ({pendingLetters.length}) ──</h3>
          <div className="space-y-2">
            {pendingLetters.map(letter => (
              <div key={letter.id} className="border border-gray-700 rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-mono text-xs">
                    {LETTER_TYPE_LABELS[letter.letter_type]?.emoji} {letter.fromPetName}의{' '}
                    <span className="text-yellow-400">{LETTER_TYPE_LABELS[letter.letter_type]?.label}</span> 편지
                  </span>
                  <span className="text-gray-600 font-mono text-xs">{formatRelativeTime(letter.created_at)}</span>
                </div>

                {openedLetter?.id === letter.id ? (
                  <div className="space-y-3">
                    <pre className="text-gray-300 font-mono text-xs whitespace-pre-wrap leading-relaxed bg-gray-900 p-3 rounded border border-gray-700">
                      {letter.content}
                    </pre>
                    <div>
                      <p className="text-gray-500 font-mono text-xs mb-2">반응을 선택하세요:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {REACTION_OPTIONS.map(r => (
                          <button
                            key={r.key}
                            onClick={() => reactToLetter(letter.id, 'read', r.key)}
                            disabled={letterLoading === letter.id}
                            className="pixel-btn font-mono text-xs disabled:opacity-40 py-1.5"
                          >
                            {r.emoji} {r.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => reactToLetter(letter.id, 'discard')}
                        disabled={letterLoading === letter.id}
                        className="w-full mt-2 text-gray-600 hover:text-red-400 font-mono text-xs disabled:opacity-40"
                      >
                        🗑️ 버리기
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOpenedLetter(letter)}
                      className="flex-1 pixel-btn font-mono text-pink-400 border-pink-700 hover:border-pink-400 py-1 text-xs"
                    >
                      📖 열람
                    </button>
                    <button
                      onClick={() => reactToLetter(letter.id, 'discard')}
                      disabled={letterLoading === letter.id}
                      className="flex-1 pixel-btn font-mono text-gray-500 border-gray-700 hover:border-red-500 hover:text-red-400 py-1 text-xs disabled:opacity-40"
                    >
                      🗑️ 버리기
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pet display */}
      <motion.div
        className="pixel-card p-6 text-center space-y-3"
        animate={activeAnimation === 'train-strength' ? { x: [0, -8, 8, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
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

        {/* 펫 + 애니메이션 오버레이 */}
        <div className="relative flex justify-center items-center py-4" style={{ minHeight: 140 }}>
          <motion.div
            animate={
              activeAnimation === 'walk'
                ? { x: [0, 55, -55, 0] }
                : activeAnimation === 'feed'
                ? { scale: [1, 1.18, 1] }
                : {}
            }
            transition={{
              duration: activeAnimation === 'walk' ? 1.1 : 0.5,
              ease: 'easeInOut',
            }}
          >
            <PixelPet
              stage={pet.stage}
              evolutionType={pet.evolution_type}
              size="lg"
              animate
            />
          </motion.div>

          <AnimatePresence>
            {activeAnimation === 'play' && <FloatingHearts key="hearts" />}
            {activeAnimation === 'sleep' && <SleepZzz key="zzz" />}
            {activeAnimation === 'train-wisdom' && <MeditationRings key="rings" />}
            {activeAnimation === 'feed' && <FlyingFood key="food" />}
            {activeAnimation === 'train-strength' && <StrengthPopup key="strength" />}
            {activeAnimation === 'walk' && <WalkFootprints key="walk" />}
          </AnimatePresence>
        </div>

        <p className="text-green-800 text-xs font-mono">{pet.age_days}일차</p>

        <GrowthTimer pet={pet} />

        {message && (
          <p className="text-yellow-400 text-xs font-mono border border-yellow-900 py-1 px-2">
            {message}
          </p>
        )}
      </motion.div>

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

      {/* Evolution gauge (adult stage only) */}
      {pet.stage === 'adult' && <EvolutionGauge pet={pet} />}

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

      {/* Recent event log */}
      {recentEvents.length > 0 && (
        <div className="pixel-card p-4 space-y-3">
          <h3 className="text-green-600 font-mono text-xs uppercase tracking-widest">── 최근 이벤트 ──</h3>
          <div className="space-y-2">
            {recentEvents.map(ev => (
              <div key={ev.id} className="flex items-start gap-2">
                <span className="text-sm shrink-0">{EVENT_ICONS[ev.event_type] ?? '📌'}</span>
                <p className="text-gray-400 font-mono text-xs flex-1 leading-relaxed">{ev.description}</p>
                <span className="text-gray-600 font-mono text-xs shrink-0 whitespace-nowrap">
                  {formatRelativeTime(ev.created_at)}
                </span>
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
        <button
          onClick={() => callTrain('strength')}
          disabled={!!actionLoading}
          className="pixel-btn font-mono text-red-400 border-red-700 hover:border-red-400 disabled:opacity-40 py-2"
        >
          {actionLoading === 'train-strength' ? '...' : '🏋️ 근력훈련'}
        </button>
        <button
          onClick={() => callTrain('wisdom')}
          disabled={!!actionLoading}
          className="pixel-btn font-mono text-blue-400 border-blue-700 hover:border-blue-400 disabled:opacity-40 py-2"
        >
          {actionLoading === 'train-wisdom' ? '...' : '🧘 명상'}
        </button>
        <button
          onClick={() => callPetAction('sleep')}
          disabled={!!actionLoading}
          className="pixel-btn font-mono text-cyan-400 border-cyan-700 hover:border-cyan-400 disabled:opacity-40 py-2"
        >
          {actionLoading === 'sleep' ? '...' : '😴 재우기'}
        </button>
        <button
          onClick={() => callPetAction('walk')}
          disabled={!!actionLoading}
          className="pixel-btn font-mono text-green-400 border-green-700 hover:border-green-400 disabled:opacity-40 py-2"
        >
          {actionLoading === 'walk' ? '...' : '🚶 산책'}
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
        {isUltimateOrAbove && fightablePets.length > 0 && (
          <div className="col-span-2 space-y-2">
            <button
              onClick={() => setShowFightSelect(prev => !prev)}
              disabled={!!actionLoading}
              className="w-full pixel-btn font-mono text-red-400 border-red-700 hover:border-red-400 disabled:opacity-40 py-2"
            >
              {actionLoading === 'fight'
                ? '싸우는 중...'
                : fightCountLeft !== null
                ? `⚔️ 싸움걸기 (오늘 ${fightCountLeft}회 남음)`
                : '⚔️ 싸움걸기'}
            </button>
            {showFightSelect && (
              <div className="pixel-card p-3 space-y-2">
                <p className="text-gray-400 font-mono text-xs">상대를 선택하세요:</p>
                {fightablePets.map(rel => (
                  <button
                    key={rel.id}
                    onClick={() => rel.otherPet && callFight(rel.otherPet.id)}
                    disabled={!!actionLoading}
                    className="w-full text-left px-3 py-2 font-mono text-xs text-gray-300 border border-gray-700 hover:border-red-500 hover:text-red-400 rounded disabled:opacity-40"
                  >
                    {REL_ICONS[rel.type]} {rel.otherPet?.name} ({STAGE_LABELS[rel.otherPet?.stage ?? ''] ?? rel.otherPet?.stage})
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
