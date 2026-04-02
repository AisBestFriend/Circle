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
  const { targetPetId, message } = await request.json()

  if (!targetPetId) return NextResponse.json({ error: 'targetPetId is required' }, { status: 400 })

  const { data: myPet } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, name')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (!myPet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 })

  const { data: targetPet } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, name')
    .eq('id', targetPetId)
    .eq('is_alive', true)
    .single()

  if (!targetPet) return NextResponse.json({ error: 'Target pet not found' }, { status: 404 })

  // Update relationship intensity (consistent ordering by id)
  const [firstId, secondId] =
    myPet.id < targetPet.id ? [myPet.id, targetPet.id] : [targetPet.id, myPet.id]

  const { data: existingRel } = await supabaseAdmin
    .from('relationships')
    .select('id, intensity')
    .eq('pet_a_id', firstId)
    .eq('pet_b_id', secondId)
    .single()

  if (existingRel) {
    await supabaseAdmin
      .from('relationships')
      .update({ intensity: Math.min(100, existingRel.intensity + 5) })
      .eq('id', existingRel.id)
  }

  const description = `${myPet.name}이(가) ${targetPet.name}에게 편지를 보냈어요 💌`

  await supabaseAdmin.from('pet_events').insert([
    { pet_id: myPet.id, other_pet_id: targetPet.id, event_type: 'letter', description },
    { pet_id: targetPet.id, other_pet_id: myPet.id, event_type: 'letter', description },
  ])

  return NextResponse.json({ success: true, event: description })
}
