import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET: fetch received letters for my pet
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: myPet } = await supabaseAdmin
    .from('pets')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (!myPet) return NextResponse.json({ letters: [] })

  const { data: letters } = await supabaseAdmin
    .from('letters')
    .select('id, from_pet_id, letter_type, status, reaction, created_at, content')
    .eq('to_pet_id', myPet.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (!letters || letters.length === 0) return NextResponse.json({ letters: [] })

  // Fetch sender pet names
  const fromPetIds = [...new Set(letters.map(l => l.from_pet_id))]
  const { data: fromPets } = await supabaseAdmin
    .from('pets')
    .select('id, name')
    .in('id', fromPetIds)

  const petMap = Object.fromEntries((fromPets ?? []).map(p => [p.id, p.name]))

  const enriched = letters.map(l => ({
    ...l,
    fromPetName: petMap[l.from_pet_id] ?? '???',
  }))

  return NextResponse.json({ letters: enriched })
}
