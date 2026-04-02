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
  const { targetPetId } = await request.json()

  if (!targetPetId) return NextResponse.json({ error: 'targetPetId is required' }, { status: 400 })

  const { data: myPet } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, name, strength, energy, happiness')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (!myPet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 })

  const { data: targetPet } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, name, strength')
    .eq('id', targetPetId)
    .eq('is_alive', true)
    .single()

  if (!targetPet) return NextResponse.json({ error: 'Target pet not found' }, { status: 404 })
  if (targetPet.user_id === session.user.id) {
    return NextResponse.json({ error: 'Cannot fight your own pet' }, { status: 400 })
  }

  const won = myPet.strength >= targetPet.strength

  const myUpdates = won
    ? { strength: Math.min(100, myPet.strength + 2), happiness: Math.min(100, myPet.happiness + 10) }
    : { energy: Math.max(0, myPet.energy - 15) }

  const { data: updatedPet, error: updateError } = await supabaseAdmin
    .from('pets')
    .update(myUpdates)
    .eq('id', id)
    .select()
    .single()

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Update relationship (consistent ordering by id)
  const [firstId, secondId] =
    myPet.id < targetPet.id ? [myPet.id, targetPet.id] : [targetPet.id, myPet.id]

  const { data: existingRel } = await supabaseAdmin
    .from('relationships')
    .select('id, type, intensity')
    .eq('pet_a_id', firstId)
    .eq('pet_b_id', secondId)
    .single()

  const intensityIncrease = won ? 10 : 5

  if (existingRel) {
    const newType =
      existingRel.type === 'rival' || existingRel.type === 'enemy' ? existingRel.type : 'rival'
    await supabaseAdmin
      .from('relationships')
      .update({ intensity: Math.min(100, existingRel.intensity + intensityIncrease), type: newType })
      .eq('id', existingRel.id)
  } else {
    await supabaseAdmin
      .from('relationships')
      .insert({ pet_a_id: firstId, pet_b_id: secondId, type: 'rival', intensity: intensityIncrease })
  }

  const description = won
    ? `${myPet.name}이(가) ${targetPet.name}와(과) 싸워서 이겼어요! ⚔️`
    : `${myPet.name}이(가) ${targetPet.name}와(과) 싸워서 졌어요... ⚔️`

  await supabaseAdmin.from('pet_events').insert([
    { pet_id: myPet.id, other_pet_id: targetPet.id, event_type: 'fight', description },
    { pet_id: targetPet.id, other_pet_id: myPet.id, event_type: 'fight', description },
  ])

  return NextResponse.json({ pet: updatedPet, won, event: description })
}
