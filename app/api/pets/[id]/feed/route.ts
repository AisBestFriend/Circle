import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getStatCap } from '@/lib/stat-cap'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: pet } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, stage, hunger, happiness, energy, is_sleeping')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
  if (pet.energy < 5) return NextResponse.json({ error: '에너지가 부족해요. 재워서 에너지를 충전해주세요! 😴' }, { status: 400 })

  const cap = getStatCap(pet.stage)

  // 행복도 패널티: 행복도 20 미만 시 실패 확률
  if (pet.happiness < 20) {
    const failRate = ((20 - pet.happiness) / 20) * 0.8
    if (Math.random() < failRate) {
      await supabaseAdmin
        .from('pets')
        .update({ energy: Math.max(0, pet.energy - 5), last_active_at: new Date().toISOString() })
        .eq('id', id)
      return NextResponse.json({ error: '기분이 안 좋아서 밥을 거부했어요... 😞 (에너지 소모)', failed: true }, { status: 200 })
    }
  }

  const { data: updated, error } = await supabaseAdmin
    .from('pets')
    .update({
      hunger: Math.min(cap, pet.hunger + 20),
      energy: Math.max(0, pet.energy - 5),
      last_fed_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
      ...(pet.is_sleeping && { is_sleeping: false }),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ pet: updated })
}
