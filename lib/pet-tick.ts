import type { Pet } from '@/types/game'

export interface RandomTickEvent {
  description: string
  event_type: string
}

export interface TickResult {
  hunger: number
  happiness: number
  energy: number
  stage: string
  stage_entered_at: string
  age_days: number
  final_choice_required: boolean
  last_tick_at: string
  ultimate_at?: string | null
  elder_at?: string | null
  randomEvent?: RandomTickEvent | null
}

const RANDOM_TICK_EVENTS: Array<RandomTickEvent & { hungerDelta: number; happinessDelta: number; energyDelta: number }> = [
  { description: '오늘 유독 배가 고프네요 🍖', event_type: 'random', hungerDelta: -5, happinessDelta: 0, energyDelta: 0 },
  { description: '좋은 꿈을 꿨어요 ✨', event_type: 'random', hungerDelta: 0, happinessDelta: 5, energyDelta: 0 },
  { description: '기분이 안 좋아요 😞', event_type: 'random', hungerDelta: 0, happinessDelta: -5, energyDelta: 0 },
  { description: '왠지 힘이 넘치는 날이에요 💪', event_type: 'random', hungerDelta: 0, happinessDelta: 0, energyDelta: 10 },
]

export function calcTick(pet: Pet & { last_tick_at?: string | null; ultimate_at?: string | null; elder_at?: string | null }): TickResult {
  const now = new Date()
  const lastTick = pet.last_tick_at ? new Date(pet.last_tick_at) : new Date(pet.born_at)
  const elapsedSeconds = (now.getTime() - lastTick.getTime()) / 1000
  const hours = elapsedSeconds / 3600

  // Stat decay
  let hunger = Math.max(0, Math.round(pet.hunger - 5 * hours))
  let happiness = Math.max(0, Math.round(pet.happiness - 3 * hours))
  let energy = Math.max(0, Math.round(pet.energy - 4 * hours))

  // Growth check
  let stage = pet.stage
  let stage_entered_at = pet.stage_entered_at
  let ultimate_at = pet.ultimate_at ?? null
  let elder_at = pet.elder_at ?? null
  let age_days = pet.age_days
  let final_choice_required = pet.final_choice_required

  const stageEnteredAt = new Date(pet.stage_entered_at)
  const elapsedFromStage = (now.getTime() - stageEnteredAt.getTime()) / 1000

  if (stage === 'egg' && elapsedFromStage >= 600) {
    stage = 'baby'
    stage_entered_at = now.toISOString()
  } else if (stage === 'baby' && elapsedFromStage >= 172800) {
    const avg = (hunger + happiness + energy) / 3
    if (avg >= 60) {
      stage = 'teen'
      stage_entered_at = now.toISOString()
    }
  } else if (stage === 'teen' && elapsedFromStage >= 259200) {
    const avg = (hunger + happiness + energy) / 3
    if (avg >= 70) {
      stage = 'adult'
      stage_entered_at = now.toISOString()
    }
  }

  // Ultimate → Elder (3 days after ultimate_at)
  if (stage === 'ultimate' && ultimate_at) {
    const elapsedFromUltimate = (now.getTime() - new Date(ultimate_at).getTime()) / 1000
    if (elapsedFromUltimate >= 259200) {
      stage = 'elder'
      stage_entered_at = now.toISOString()
      elder_at = now.toISOString()
      age_days = 0
    }
  }

  // Elder age_days calculation
  if (stage === 'elder' && elder_at) {
    age_days = Math.floor((now.getTime() - new Date(elder_at).getTime()) / 86400000)
    if (age_days >= 10) {
      final_choice_required = true
    }
  }

  // 5% chance of random event
  let randomEvent: RandomTickEvent | null = null
  if (Math.random() < 0.05) {
    const picked = RANDOM_TICK_EVENTS[Math.floor(Math.random() * RANDOM_TICK_EVENTS.length)]
    hunger = Math.max(0, Math.min(100, hunger + picked.hungerDelta))
    happiness = Math.max(0, Math.min(100, happiness + picked.happinessDelta))
    energy = Math.max(0, Math.min(100, energy + picked.energyDelta))
    randomEvent = { description: picked.description, event_type: picked.event_type }
  }

  return {
    hunger,
    happiness,
    energy,
    stage,
    stage_entered_at,
    age_days,
    final_choice_required,
    last_tick_at: now.toISOString(),
    ultimate_at,
    elder_at,
    randomEvent,
  }
}
