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

  if (type !== 'rebirth' && type !== 'reset') {
    return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 })
  }

  // Fetch current pet, verify ownership
  const { data: currentPet, error: fetchError } = await supabaseAdmin
    .from('pets')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (fetchError || !currentPet) {
    return NextResponse.json({ error: '펫을 찾을 수 없습니다' }, { status: 404 })
  }

  if (!currentPet.final_choice_required) {
    return NextResponse.json({ error: '아직 최종 선택 시기가 아닙니다' }, { status: 400 })
  }

  const now = new Date().toISOString()

  // Mark current pet as dead
  await supabaseAdmin
    .from('pets')
    .update({ is_alive: false })
    .eq('id', id)

  // Record tombstone
  await supabaseAdmin.from('tombstones').insert({
    pet_id: currentPet.id,
    user_id: currentPet.user_id,
    name: currentPet.name,
    stage: currentPet.stage,
    evolution_type: currentPet.evolution_type ?? null,
    age_days: currentPet.age_days,
    epitaph: type === 'rebirth' ? '새로운 알로 부활했습니다 🥚' : '완전히 초기화되었습니다 🔄',
    died_at: now,
  })

  let inheritedStats: Record<string, number> = {}

  if (type === 'rebirth' && currentPet.partner_id) {
    // Fetch partner stats for trait blending
    const { data: partner } = await supabaseAdmin
      .from('pets')
      .select('strength, wisdom, dark, harmony')
      .eq('id', currentPet.partner_id)
      .single()

    if (partner) {
      inheritedStats = {
        strength: Math.round((currentPet.strength + partner.strength) / 2),
        wisdom: Math.round((currentPet.wisdom + partner.wisdom) / 2),
        dark: Math.round((currentPet.dark + partner.dark) / 2),
        harmony: Math.round((currentPet.harmony + partner.harmony) / 2),
      }
    }
  }

  // Create new egg
  const { data: newPet, error: createError } = await supabaseAdmin
    .from('pets')
    .insert({
      user_id: currentPet.user_id,
      name: currentPet.name,
      ...inheritedStats,
    })
    .select()
    .single()

  if (createError) return NextResponse.json({ error: createError.message }, { status: 500 })

  return NextResponse.json({ pet: newPet })
}
