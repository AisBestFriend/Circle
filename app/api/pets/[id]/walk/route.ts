import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getStatCap } from '@/lib/stat-cap'

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
    .select('id, user_id, stage, name, happiness, hunger, energy, dark, is_sleeping')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
  if (pet.energy < 10) return NextResponse.json({ error: '에너지가 부족해요. 재워서 에너지를 충전해주세요! 😴' }, { status: 400 })
  if (pet.hunger <= 20) return NextResponse.json({ error: '배가 너무 고파서 움직일 수 없어요! 🍖 밥을 먼저 주세요.', status: 400 })

  const cap = getStatCap(pet.stage)

  let happinessDelta = 15
  let hungerDelta = -10
  let energyDelta = 0
  let darkDelta = 0
  let eventMessage: string | null = null

  // 야간 산책 (KST 22:00~06:00): 암흑 +3
  const kstHour = (new Date().getUTCHours() + 9) % 24
  const isNight = kstHour >= 22 || kstHour < 6
  if (isNight) {
    darkDelta = 10
    eventMessage = eventMessage ?? '밤의 기운을 흡수했어요 🌑'
  }

  // 20% chance of random event
  if (Math.random() < 0.2) {
    const event = WALK_EVENTS[Math.floor(Math.random() * WALK_EVENTS.length)]
    eventMessage = event.message
    energyDelta += event.energyDelta
    hungerDelta += event.hungerDelta
  }

  const updates: Record<string, number | string> = {
    happiness: Math.min(cap, Math.max(0, pet.happiness + happinessDelta)),
    hunger: Math.min(cap, Math.max(0, pet.hunger + hungerDelta)),
    energy: Math.min(cap, Math.max(0, pet.energy + energyDelta)),
    last_active_at: new Date().toISOString(),
  }
  if (darkDelta > 0) updates.dark = Math.min(cap, (pet.dark ?? 0) + darkDelta)
  if (pet.is_sleeping) updates.is_sleeping = false

  const { data: updated, error } = await supabaseAdmin
    .from('pets')
    .update(updates)
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

  // 10% 확률로 낯선 펫 만남
  let encounter: { userId: string; userName: string; petId: string; petName: string; petStage: string; petEvolutionType: string | null } | null = null
  if (Math.random() < 0.1) {
    const { data: friendships } = await supabaseAdmin
      .from('friendships')
      .select('user_id_1, user_id_2')
      .or(`user_id_1.eq.${session.user.id},user_id_2.eq.${session.user.id}`)

    const excludeIds = new Set<string>([session.user.id])
    for (const f of friendships ?? []) {
      excludeIds.add(f.user_id_1)
      excludeIds.add(f.user_id_2)
    }

    const { data: candidates } = await supabaseAdmin
      .from('pets')
      .select('id, name, stage, evolution_type, user_id, users(id, name)')
      .eq('is_alive', true)
      .not('user_id', 'in', `(${[...excludeIds].join(',')})`)

    if (candidates && candidates.length > 0) {
      const pick = candidates[Math.floor(Math.random() * candidates.length)]
      const user = Array.isArray(pick.users) ? pick.users[0] : pick.users
      encounter = {
        userId: pick.user_id,
        userName: user?.name ?? '알 수 없음',
        petId: pick.id,
        petName: pick.name,
        petStage: pick.stage,
        petEvolutionType: pick.evolution_type ?? null,
      }
    }
  }

  return NextResponse.json({ pet: updated, event: eventMessage, encounter })
}
