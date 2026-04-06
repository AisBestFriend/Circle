import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: currentPet } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, name, stage, evolution_type, age_days')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (!currentPet) return NextResponse.json({ error: '펫을 찾을 수 없습니다' }, { status: 404 })

  const now = new Date().toISOString()

  await supabaseAdmin
    .from('pets')
    .update({ is_alive: false })
    .eq('id', id)

  await supabaseAdmin.from('tombstones').insert({
    pet_id: currentPet.id,
    user_id: currentPet.user_id,
    name: currentPet.name,
    stage: currentPet.stage,
    evolution_type: currentPet.evolution_type ?? null,
    age_days: currentPet.age_days,
    epitaph: '주인의 손으로 초기화되었습니다 🔄',
    died_at: now,
  })

  const { data: newPet, error } = await supabaseAdmin
    .from('pets')
    .insert({
      user_id: currentPet.user_id,
      name: currentPet.name,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ pet: newPet })
}
