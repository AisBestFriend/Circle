import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { GardenClient } from './garden-client'

export default async function GardenPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id

  // Fetch my alive pet
  const { data: myPet } = await supabaseAdmin
    .from('pets')
    .select('*')
    .eq('user_id', userId)
    .eq('is_alive', true)
    .single()

  // Fetch all friendships for this user
  const { data: friendships } = await supabaseAdmin
    .from('friendships')
    .select('id, user_id_1, user_id_2, status, created_at')
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)

  const friendIds = (friendships ?? [])
    .filter(f => f.status === 'accepted')
    .map(f => (f.user_id_1 === userId ? f.user_id_2 : f.user_id_1))

  const pendingReceivedIds = (friendships ?? [])
    .filter(f => f.status === 'pending' && f.user_id_2 === userId)
    .map(f => f.user_id_1)

  const allRelevantIds = [...new Set([...friendIds, ...pendingReceivedIds])]

  const [{ data: users }, { data: friendPets }, { data: myRelationships }, { data: recentEvents }] = await Promise.all([
    allRelevantIds.length > 0
      ? supabaseAdmin.from('users').select('id, name, email, image').in('id', allRelevantIds)
      : Promise.resolve({ data: [] as any[] }),
    friendIds.length > 0
      ? supabaseAdmin.from('pets').select('*').in('user_id', friendIds).eq('is_alive', true)
      : Promise.resolve({ data: [] as any[] }),
    myPet
      ? supabaseAdmin
          .from('relationships')
          .select('*')
          .or(`pet_a_id.eq.${myPet.id},pet_b_id.eq.${myPet.id}`)
      : Promise.resolve({ data: [] as any[] }),
    myPet
      ? supabaseAdmin
          .from('pet_events')
          .select('id, event_type, description, created_at')
          .eq('pet_id', myPet.id)
          .order('created_at', { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] as any[] }),
  ])

  const usersMap = Object.fromEntries((users ?? []).map((u: any) => [u.id, u]))
  const friendPetsMap: Record<string, any> = {}
  for (const pet of friendPets ?? []) {
    friendPetsMap[pet.user_id] = pet
  }

  // Build relationships map: otherPetId → relationship
  const relMap: Record<string, any> = {}
  for (const rel of myRelationships ?? []) {
    const otherPetId = rel.pet_a_id === myPet?.id ? rel.pet_b_id : rel.pet_a_id
    relMap[otherPetId] = rel
  }

  const acceptedFriends = (friendships ?? [])
    .filter(f => f.status === 'accepted')
    .map(f => {
      const friendId = f.user_id_1 === userId ? f.user_id_2 : f.user_id_1
      const friendPet = friendPetsMap[friendId] ?? null
      return {
        friendshipId: f.id,
        user: usersMap[friendId] ?? { id: friendId },
        pet: friendPet,
        relationship: friendPet ? relMap[friendPet.id] ?? null : null,
      }
    })

  const pendingReceived = (friendships ?? [])
    .filter(f => f.status === 'pending' && f.user_id_2 === userId)
    .map(f => ({
      friendshipId: f.id,
      user: usersMap[f.user_id_1] ?? { id: f.user_id_1 },
      created_at: f.created_at,
    }))

  return (
    <main className="min-h-screen pixel-bg">
      <GardenClient
        session={session}
        acceptedFriends={acceptedFriends as any}
        pendingReceived={pendingReceived as any}
        myPet={myPet ?? null}
        recentEvents={recentEvents ?? []}
      />
    </main>
  )
}
