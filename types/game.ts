export type PetStage = 'egg' | 'baby' | 'teen' | 'adult' | 'ultimate' | 'elder'
export type EvolutionType = 'warrior' | 'sage' | 'dark' | 'balance'
export type RelationshipType = 'love' | 'friend' | 'rival' | 'enemy'

export interface Pet {
  id: string
  user_id: string
  name: string
  stage: PetStage
  evolution_type: EvolutionType | null
  hunger: number
  happiness: number
  energy: number
  strength: number
  wisdom: number
  dark: number
  harmony: number
  age_days: number
  partner_id: string | null
  is_alive: boolean
  born_at: string
  stage_entered_at: string
  last_fed_at: string
  last_tick_at: string | null
  ultimate_at: string | null
  elder_at: string | null
  final_choice_required: boolean
}

export interface Relationship {
  id: string
  pet_a_id: string
  pet_b_id: string
  type: RelationshipType
  intensity: number
}

export interface Tombstone {
  id: string
  pet_id: string
  name: string
  stage: string
  evolution_type: string | null
  age_days: number
  epitaph: string | null
  died_at: string
}

export const STAGE_THRESHOLDS = {
  egg: { min_age: 0, max_age: 1 },
  baby: { min_age: 1, max_age: 3 },
  teen: { min_age: 3, max_age: 7 },
  adult: { min_age: 7, max_age: Infinity },
  ultimate: { min_age: 0, max_age: Infinity },
}

export const EVOLUTION_TRAITS: Record<EvolutionType, { label: string; emoji: string; color: string }> = {
  warrior: { label: '전사형', emoji: '⚔️', color: 'text-red-400' },
  sage: { label: '현자형', emoji: '✨', color: 'text-blue-400' },
  dark: { label: '다크형', emoji: '🌑', color: 'text-purple-400' },
  balance: { label: '균형형', emoji: '☯️', color: 'text-green-400' },
}

export const RELATIONSHIP_CONFIG: Record<RelationshipType, { label: string; emoji: string; color: string }> = {
  love: { label: '사랑', emoji: '💕', color: 'text-pink-400' },
  friend: { label: '우정', emoji: '🤝', color: 'text-yellow-400' },
  rival: { label: '라이벌', emoji: '⚡', color: 'text-orange-400' },
  enemy: { label: '앙숙', emoji: '💢', color: 'text-red-500' },
}
