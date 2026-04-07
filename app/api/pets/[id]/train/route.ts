import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getStatCap } from '@/lib/stat-cap'
import { calcStatOutcome } from '@/lib/stat-outcome'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { type } = await request.json()

  if (type !== 'strength' && type !== 'wisdom') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  const { data: pet } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, stage, strength, wisdom, happiness, hunger, energy, is_sleeping')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
  const minEnergy = type === 'strength' ? 20 : 10
  if (pet.energy < minEnergy) return NextResponse.json({ error: '에너지가 부족해요. 재워서 에너지를 충전해주세요! 😴' }, { status: 400 })
  if (pet.hunger <= 20) return NextResponse.json({ error: '배가 너무 고파서 움직일 수 없어요! 🍖 밥을 먼저 주세요.', status: 400 })

  const cap = getStatCap(pet.stage)

  // 이미 최대치면 에너지 소모 없이 안내
  if (type === 'strength' && pet.strength >= cap) {
    return NextResponse.json({ error: `💪 힘이 이미 최대치예요! (${cap})`, maxReached: true }, { status: 200 })
  }
  if (type === 'wisdom' && pet.wisdom >= cap) {
    return NextResponse.json({ error: `🧘 지혜가 이미 최대치예요! (${cap})`, maxReached: true }, { status: 200 })
  }

  // 행복도 패널티: 행복도 20 미만 시 실패 확률
  if (pet.happiness < 20) {
    const failRate = ((20 - pet.happiness) / 20) * 0.8
    if (Math.random() < failRate) {
      const label = type === 'strength' ? '근력훈련' : '명상'
      await supabaseAdmin
        .from('pets')
        .update({ energy: Math.max(0, pet.energy - 15), last_active_at: new Date().toISOString() })
        .eq('id', id)
      return NextResponse.json({ error: `기분이 안 좋아서 ${label}을(를) 포기했어요... 😞 (에너지 소모)`, failed: true }, { status: 200 })
    }
  }

  const now = new Date().toISOString()
  const currentStat = type === 'strength' ? pet.strength : pet.wisdom
  const outcome = calcStatOutcome(currentStat, cap)

  if (outcome === 'neutral') {
    // 에너지만 소모, 스탯 변화 없음
    const energyCost = type === 'strength' ? 20 : 5
    await supabaseAdmin.from('pets').update({
      energy: Math.max(0, pet.energy - energyCost),
      last_active_at: now,
      ...(pet.is_sleeping && { is_sleeping: false }),
    }).eq('id', id)
    return NextResponse.json({ outcome: 'neutral', message: '훈련했지만 별다른 변화가 없었어요.' })
  }

  if (outcome === 'fail') {
    // 스탯 -1 + 에너지 소모
    const energyCost = type === 'strength' ? 20 : 5
    const statField = type === 'strength' ? 'strength' : 'wisdom'
    await supabaseAdmin.from('pets').update({
      [statField]: Math.max(0, currentStat - 1),
      energy: Math.max(0, pet.energy - energyCost),
      last_active_at: now,
      ...(pet.is_sleeping && { is_sleeping: false }),
    }).eq('id', id)
    return NextResponse.json({ outcome: 'fail', message: '무리한 훈련으로 오히려 역효과가 났어요...' })
  }

  // 성공
  const updates =
    type === 'strength'
      ? {
          strength: Math.min(cap, pet.strength + 3),
          energy: Math.max(0, pet.energy - 20),
          happiness: Math.max(0, pet.happiness - 5),
          last_strength_trained_at: now,
          last_active_at: now,
          ...(pet.is_sleeping && { is_sleeping: false }),
        }
      : {
          wisdom: Math.min(cap, pet.wisdom + 3),
          energy: Math.max(0, pet.energy - 5),
          happiness: Math.min(cap, pet.happiness + 5),
          last_wisdom_trained_at: now,
          last_active_at: now,
          ...(pet.is_sleeping && { is_sleeping: false }),
        }

  const { data: updated, error } = await supabaseAdmin
    .from('pets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ pet: updated, outcome: 'success' })
}
