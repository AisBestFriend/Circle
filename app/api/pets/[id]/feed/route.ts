import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: pet } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, hunger, energy, is_sleeping')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
  if (pet.is_sleeping) return NextResponse.json({ error: '자는 중이에요. 먼저 깨워주세요! 💤' }, { status: 400 })
  if (pet.energy < 5) return NextResponse.json({ error: '에너지가 부족해요. 재워서 에너지를 충전해주세요! 😴' }, { status: 400 })

  const { data: updated, error } = await supabaseAdmin
    .from('pets')
    .update({
      hunger: Math.min(100, pet.hunger + 20),
      energy: Math.max(0, pet.energy - 5),
      last_fed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ pet: updated })
}
