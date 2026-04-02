import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { GardenClient } from './garden-client'

export default async function GardenPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Fetch all alive pets (public garden)
  const { data: pets } = await supabase
    .from('pets')
    .select(`
      id, name, stage, evolution_type, hunger, happiness, energy,
      age_days, is_alive, user_id,
      users:user_id (name, image)
    `)
    .eq('is_alive', true)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <GardenClient session={session} pets={(pets ?? []) as any} />
    </main>
  )
}
