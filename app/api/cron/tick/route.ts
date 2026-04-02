import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: alivePets, error } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, name, stage, evolution_type, hunger, happiness, energy, age_days')
    .eq('is_alive', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!alivePets || alivePets.length === 0) {
    return NextResponse.json({ processed: 0, died: 0 })
  }

  let processed = 0
  let died = 0

  for (const pet of alivePets) {
    const newHunger = Math.max(0, pet.hunger - 5)
    const newHappiness = Math.max(0, pet.happiness - 3)
    const newEnergy = Math.max(0, pet.energy - 4)

    if (newHunger === 0 && newHappiness === 0 && newEnergy === 0) {
      // Pet dies from neglect
      await supabaseAdmin
        .from('pets')
        .update({ is_alive: false, hunger: 0, happiness: 0, energy: 0 })
        .eq('id', pet.id)

      await supabaseAdmin.from('tombstones').insert({
        pet_id: pet.id,
        user_id: pet.user_id,
        name: pet.name,
        stage: pet.stage,
        evolution_type: pet.evolution_type ?? null,
        age_days: pet.age_days,
        epitaph: '스탯이 모두 소진되어 떠났습니다...',
        died_at: new Date().toISOString(),
      })

      died++
    } else {
      const isUltimate = pet.stage === 'ultimate'
      const newAgeDays = isUltimate ? pet.age_days + 1 : pet.age_days
      const newStage = isUltimate && newAgeDays >= 3 ? 'elder' : pet.stage

      await supabaseAdmin
        .from('pets')
        .update({
          hunger: newHunger,
          happiness: newHappiness,
          energy: newEnergy,
          ...(isUltimate && { age_days: newAgeDays, stage: newStage }),
        })
        .eq('id', pet.id)

      processed++
    }
  }

  return NextResponse.json({ processed, died })
}
