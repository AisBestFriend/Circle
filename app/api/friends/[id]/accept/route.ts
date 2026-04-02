import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

function determineRelationshipType(
  petA: { strength: number; wisdom: number; dark: number; harmony: number },
  petB: { strength: number; wisdom: number; dark: number; harmony: number }
): 'love' | 'friend' | 'rival' | 'enemy' {
  const DARK_THRESHOLD = 40

  if (petA.dark > DARK_THRESHOLD || petB.dark > DARK_THRESHOLD) return 'enemy'

  const aTop = Math.max(petA.strength, petA.wisdom, petA.dark, petA.harmony)
  const bTop = Math.max(petB.strength, petB.wisdom, petB.dark, petB.harmony)

  const aIsStrength = petA.strength === aTop
  const aIsWisdom = petA.wisdom === aTop
  const bIsStrength = petB.strength === bTop
  const bIsWisdom = petB.wisdom === bTop

  if (aIsStrength && bIsStrength) return 'rival'
  if (aIsWisdom && bIsWisdom) return 'friend'
  if ((aIsStrength && bIsWisdom) || (aIsWisdom && bIsStrength)) return 'love'

  return 'friend'
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const userId = session.user.id

  // Only the recipient (user_id_2) can accept
  const { data: friendship } = await supabaseAdmin
    .from('friendships')
    .select('id, user_id_1, user_id_2, status')
    .eq('id', id)
    .eq('user_id_2', userId)
    .single()

  if (!friendship) {
    return NextResponse.json({ error: '친구 요청을 찾을 수 없습니다' }, { status: 404 })
  }

  if (friendship.status === 'accepted') {
    return NextResponse.json({ error: '이미 수락된 요청입니다' }, { status: 400 })
  }

  await supabaseAdmin
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', id)

  // Auto-create pet relationship
  const [{ data: petA }, { data: petB }] = await Promise.all([
    supabaseAdmin.from('pets').select('*').eq('user_id', friendship.user_id_1).eq('is_alive', true).single(),
    supabaseAdmin.from('pets').select('*').eq('user_id', userId).eq('is_alive', true).single(),
  ])

  if (petA && petB) {
    const relType = determineRelationshipType(petA, petB)
    const intensity = Math.floor(Math.random() * 21) + 20 // 20–40

    // Consistent ordering by id to satisfy unique(pet_a_id, pet_b_id)
    const [firstId, secondId] = petA.id < petB.id ? [petA.id, petB.id] : [petB.id, petA.id]

    await supabaseAdmin
      .from('relationships')
      .upsert({ pet_a_id: firstId, pet_b_id: secondId, type: relType, intensity })
  }

  return NextResponse.json({ success: true })
}
