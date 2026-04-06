import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

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
    .select('id, user_id, strength, wisdom, happiness, hunger, energy, is_sleeping')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
  if (pet.is_sleeping) return NextResponse.json({ error: '자는 중이에요. 먼저 깨워주세요! 💤' }, { status: 400 })
  if (pet.energy < 15) return NextResponse.json({ error: '에너지가 부족해요. 재워서 에너지를 충전해주세요! 😴' }, { status: 400 })
  if (pet.hunger <= 20) return NextResponse.json({ error: '배가 너무 고파서 움직일 수 없어요! 🍖 밥을 먼저 주세요.', status: 400 })

  // 행복도 패널티: 행복도 20 미만 시 실패 확률
  if (pet.happiness < 20) {
    const failRate = ((20 - pet.happiness) / 20) * 0.8
    if (Math.random() < failRate) {
      const label = type === 'strength' ? '근력훈련' : '명상'
      await supabaseAdmin
        .from('pets')
        .update({ energy: Math.max(0, pet.energy - 15) })
        .eq('id', id)
      return NextResponse.json({ error: `기분이 안 좋아서 ${label}을(를) 포기했어요... 😞 (에너지 소모)`, failed: true }, { status: 200 })
    }
  }

  const now = new Date().toISOString()
  const updates =
    type === 'strength'
      ? {
          strength: Math.min(100, pet.strength + 3),
          energy: Math.max(0, pet.energy - 10),
          happiness: Math.max(0, pet.happiness - 5),
          last_strength_trained_at: now,
        }
      : {
          wisdom: Math.min(100, pet.wisdom + 3),
          energy: Math.max(0, pet.energy - 5),
          happiness: Math.min(100, pet.happiness + 5),
          last_wisdom_trained_at: now,
        }

  const { data: updated, error } = await supabaseAdmin
    .from('pets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ pet: updated })
}
