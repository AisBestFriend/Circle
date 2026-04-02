import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import type { EvolutionType } from '@/types/game'

function determineEvolutionType(strength: number, wisdom: number, dark: number, harmony: number): EvolutionType {
  const stats: [EvolutionType, number][] = [
    ['warrior', strength],
    ['sage', wisdom],
    ['dark', dark],
    ['balance', harmony],
  ]
  return stats.reduce((best, current) => current[1] > best[1] ? current : best)[0]
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: pet } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, stage, strength, wisdom, dark, harmony')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
  if (pet.stage !== 'adult') {
    return NextResponse.json({ error: '완전체만 궁극체로 진화할 수 있습니다' }, { status: 400 })
  }

  const evolution_type = determineEvolutionType(pet.strength, pet.wisdom, pet.dark, pet.harmony)

  const { data: updated, error } = await supabaseAdmin
    .from('pets')
    .update({
      stage: 'ultimate',
      evolution_type,
      stage_entered_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ pet: updated })
}
