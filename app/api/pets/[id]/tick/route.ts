import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { calcTick } from '@/lib/pet-tick'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    console.error('[tick] Unauthorized: no session')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { data: pet, error: fetchError } = await supabaseAdmin
    .from('pets')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (fetchError) {
    console.error('[tick] Pet fetch error:', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }
  if (!pet) {
    console.error('[tick] Pet not found:', id, 'user:', session.user.id)
    return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
  }

  const { randomEvent, ...petUpdates } = calcTick(pet)
  console.log('[tick] pet:', id, 'stage:', pet.stage, '→', petUpdates.stage, 'last_tick_at:', petUpdates.last_tick_at)

  const { data: updated, error } = await supabaseAdmin
    .from('pets')
    .update(petUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[tick] Update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (randomEvent) {
    await supabaseAdmin.from('pet_events').insert({
      pet_id: id,
      event_type: randomEvent.event_type,
      description: randomEvent.description,
    })
  }

  return NextResponse.json({ pet: updated, event: randomEvent?.description ?? null })
}
