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

  const { data: pet } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, energy, hunger, is_sleeping')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 })

  if (pet.is_sleeping) {
    // 깨우기: 경과 시간 기반 에너지 회복 (분당 10%)
    const { data: fullPet } = await supabaseAdmin
      .from('pets')
      .select('sleep_started_at')
      .eq('id', id)
      .single()

    const sleepStart = fullPet?.sleep_started_at ? new Date(fullPet.sleep_started_at) : new Date()
    const elapsedMinutes = (Date.now() - sleepStart.getTime()) / 60000
    const recovered = Math.min(100, Math.round(pet.energy + elapsedMinutes * 10))

    const { data: updated, error } = await supabaseAdmin
      .from('pets')
      .update({
        energy: recovered,
        hunger: Math.max(0, pet.hunger - Math.floor(elapsedMinutes / 10) * 2),
        is_sleeping: false,
        sleep_started_at: null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ pet: updated, action: 'wake', energyRecovered: recovered - pet.energy })
  } else {
    // 재우기
    const { data: updated, error } = await supabaseAdmin
      .from('pets')
      .update({
        is_sleeping: true,
        sleep_started_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ pet: updated, action: 'sleep' })
  }
}
