import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { data: pet } = await supabaseAdmin
    .from('pets')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  // Fetch relationships for this pet
  let relationships: any[] = []
  if (pet) {
    const { data: rels } = await supabaseAdmin
      .from('relationships')
      .select('id, pet_a_id, pet_b_id, type, intensity')
      .or(`pet_a_id.eq.${pet.id},pet_b_id.eq.${pet.id}`)

    if (rels && rels.length > 0) {
      const otherPetIds = rels.map(r => (r.pet_a_id === pet.id ? r.pet_b_id : r.pet_a_id))
      const { data: otherPets } = await supabaseAdmin
        .from('pets')
        .select('id, name, stage, evolution_type, user_id')
        .in('id', otherPetIds)

      const petsMap = Object.fromEntries((otherPets ?? []).map((p: any) => [p.id, p]))
      relationships = rels.map(r => ({
        ...r,
        otherPet: petsMap[r.pet_a_id === pet.id ? r.pet_b_id : r.pet_a_id] ?? null,
      }))
    }
  }

  // Fetch recent events for this pet
  const { data: recentEvents } = pet
    ? await supabaseAdmin
        .from('pet_events')
        .select('id, event_type, description, created_at')
        .eq('pet_id', pet.id)
        .order('created_at', { ascending: false })
        .limit(5)
    : { data: [] as any[] }

  // Fetch pending letters for this pet
  let pendingLetters: any[] = []
  if (pet) {
    const { data: letters } = await supabaseAdmin
      .from('letters')
      .select('id, from_pet_id, letter_type, status, created_at, content')
      .eq('to_pet_id', pet.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (letters && letters.length > 0) {
      const fromPetIds = [...new Set(letters.map((l: any) => l.from_pet_id))]
      const { data: fromPets } = await supabaseAdmin
        .from('pets')
        .select('id, name')
        .in('id', fromPetIds)
      const petMap = Object.fromEntries((fromPets ?? []).map((p: any) => [p.id, p.name]))
      pendingLetters = letters.map((l: any) => ({ ...l, fromPetName: petMap[l.from_pet_id] ?? '???' }))
    }
  }

  return (
    <main className="min-h-screen pixel-bg text-white">
      <DashboardClient
        session={session}
        initialPet={pet}
        initialRelationships={relationships}
        recentEvents={recentEvents ?? []}
        initialPendingLetters={pendingLetters}
      />
    </main>
  )
}
