import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const WALK_EVENTS = [
  { message: '산책 중 낯선 펫을 만났어요 👀', energyDelta: 0, hungerDelta: 0 },
  { message: '산책 중 예쁜 돌을 주웠어요 💎', energyDelta: 0, hungerDelta: 0 },
  { message: '산책 중 비를 맞았어요 ☔', energyDelta: -5, hungerDelta: 0 },
  { message: '산책 중 맛있는 냄새를 맡았어요 🍖', energyDelta: 0, hungerDelta: -5 },
]

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: pet } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, name, happiness, hunger, energy')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 })

  let happinessDelta = 15
  let hungerDelta = -10
  let energyDelta = 0
  let eventMessage: string | null = null

  // 20% chance of random event
  if (Math.random() < 0.2) {
    const event = WALK_EVENTS[Math.floor(Math.random() * WALK_EVENTS.length)]
    eventMessage = event.message
    energyDelta += event.energyDelta
    hungerDelta += event.hungerDelta
  }

  const { data: updated, error } = await supabaseAdmin
    .from('pets')
    .update({
      happiness: Math.min(100, Math.max(0, pet.happiness + happinessDelta)),
      hunger: Math.min(100, Math.max(0, pet.hunger + hungerDelta)),
      energy: Math.min(100, Math.max(0, pet.energy + energyDelta)),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (eventMessage) {
    await supabaseAdmin.from('pet_events').insert({
      pet_id: id,
      event_type: 'walk',
      description: eventMessage,
    })
  }

  return NextResponse.json({ pet: updated, event: eventMessage })
}
