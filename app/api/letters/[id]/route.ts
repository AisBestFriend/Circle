import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// POST: react to a letter (read + set reaction, or discard)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { action, reaction } = await request.json()
  // action: 'read' | 'discard'
  // reaction (only when action === 'read'): 'grateful' | 'angry' | 'happy' | 'love'

  if (!['read', 'discard'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const { data: myPet } = await supabaseAdmin
    .from('pets')
    .select('id, name')
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (!myPet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 })

  // Verify letter belongs to this pet
  const { data: letter } = await supabaseAdmin
    .from('letters')
    .select('id, from_pet_id, to_pet_id, status, letter_type')
    .eq('id', id)
    .eq('to_pet_id', myPet.id)
    .single()

  if (!letter) return NextResponse.json({ error: 'Letter not found' }, { status: 404 })
  if (letter.status !== 'pending') {
    return NextResponse.json({ error: '이미 처리된 편지예요' }, { status: 400 })
  }

  if (action === 'discard') {
    await supabaseAdmin
      .from('letters')
      .update({ status: 'discarded', read_at: new Date().toISOString() })
      .eq('id', id)

    // Notify sender via pet_events
    const { data: fromPet } = await supabaseAdmin
      .from('pets')
      .select('id, name')
      .eq('id', letter.from_pet_id)
      .single()

    if (fromPet) {
      await supabaseAdmin.from('pet_events').insert({
        pet_id: fromPet.id,
        other_pet_id: myPet.id,
        event_type: 'letter',
        description: `${myPet.name}이(가) ${fromPet.name}의 편지를 버렸어요 🗑️`,
      })
    }

    return NextResponse.json({ success: true, status: 'discarded' })
  }

  // action === 'read'
  if (!reaction || !['grateful', 'angry', 'happy', 'love'].includes(reaction)) {
    return NextResponse.json({ error: 'reaction required for read action' }, { status: 400 })
  }

  await supabaseAdmin
    .from('letters')
    .update({ status: 'read', reaction, read_at: new Date().toISOString() })
    .eq('id', id)

  // Update relationship based on reaction
  const { data: fromPet } = await supabaseAdmin
    .from('pets')
    .select('id, name')
    .eq('id', letter.from_pet_id)
    .single()

  if (fromPet) {
    const [firstId, secondId] =
      myPet.id < fromPet.id ? [myPet.id, fromPet.id] : [fromPet.id, myPet.id]

    const { data: existingRel } = await supabaseAdmin
      .from('relationships')
      .select('id, type, intensity')
      .eq('pet_a_id', firstId)
      .eq('pet_b_id', secondId)
      .single()

    const reactionTypeMap: Record<string, string> = {
      grateful: 'friend',
      happy: 'friend',
      love: 'love',
      angry: 'rival',
    }
    const newRelType = reactionTypeMap[reaction]
    const intensityDelta = reaction === 'angry' ? -5 : reaction === 'love' ? 15 : 10

    if (existingRel) {
      await supabaseAdmin
        .from('relationships')
        .update({
          type: newRelType,
          intensity: Math.max(0, Math.min(100, existingRel.intensity + intensityDelta)),
        })
        .eq('id', existingRel.id)
    } else {
      await supabaseAdmin.from('relationships').insert({
        pet_a_id: firstId,
        pet_b_id: secondId,
        type: newRelType,
        intensity: Math.max(0, intensityDelta),
      })
    }

    const reactionEmojis: Record<string, string> = {
      grateful: '🙏',
      angry: '😡',
      happy: '😊',
      love: '💕',
    }
    const reactionLabels: Record<string, string> = {
      grateful: '감사',
      angry: '분노',
      happy: '행복',
      love: '사랑',
    }

    const eventDesc = `${myPet.name}이(가) 편지를 읽고 ${reactionLabels[reaction]} 반응을 보냈어요 ${reactionEmojis[reaction]}`

    // Notify sender
    await supabaseAdmin.from('pet_events').insert([
      { pet_id: fromPet.id, other_pet_id: myPet.id, event_type: 'letter', description: eventDesc },
      { pet_id: myPet.id, other_pet_id: fromPet.id, event_type: 'letter', description: eventDesc },
    ])
  }

  return NextResponse.json({ success: true, status: 'read', reaction })
}
