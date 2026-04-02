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

  return (
    <main className="min-h-screen pixel-bg text-white">
      <DashboardClient session={session} initialPet={pet} />
    </main>
  )
}
