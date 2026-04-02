import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: alivePets, error } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, name, stage, evolution_type, hunger, happiness, energy, age_days, born_at, stage_entered_at, final_choice_required')
    .eq('is_alive', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!alivePets || alivePets.length === 0) {
    return NextResponse.json({ processed: 0, died: 0 })
  }

  let processed = 0
  let died = 0
  const now = new Date()

  for (const pet of alivePets) {
    const newHunger = Math.max(0, pet.hunger - 5)
    const newHappiness = Math.max(0, pet.happiness - 3)
    const newEnergy = Math.max(0, pet.energy - 4)

    if (newHunger === 0 && newHappiness === 0 && newEnergy === 0) {
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
        died_at: now.toISOString(),
      })

      died++
    } else {
      // Growth logic
      let newStage = pet.stage
      let newStageEnteredAt: string | null = null
      const avg = (pet.hunger + pet.happiness + pet.energy) / 3

      if (pet.stage === 'egg') {
        const elapsed = (now.getTime() - new Date(pet.born_at).getTime()) / 1000
        if (elapsed >= 600) {
          newStage = 'baby'
          newStageEnteredAt = now.toISOString()
        }
      } else if (pet.stage === 'baby') {
        const elapsed = (now.getTime() - new Date(pet.stage_entered_at).getTime()) / 1000
        if (elapsed >= 48 * 3600 && avg >= 60) {
          newStage = 'teen'
          newStageEnteredAt = now.toISOString()
        }
      } else if (pet.stage === 'teen') {
        const elapsed = (now.getTime() - new Date(pet.stage_entered_at).getTime()) / 1000
        if (elapsed >= 72 * 3600 && avg >= 70) {
          newStage = 'adult'
          newStageEnteredAt = now.toISOString()
        }
      } else if (pet.stage === 'ultimate') {
        const elapsed = (now.getTime() - new Date(pet.stage_entered_at).getTime()) / 1000
        if (elapsed >= 259200) {
          newStage = 'elder'
          newStageEnteredAt = now.toISOString()
        }
      }

      // age_days increments for ultimate and elder
      const shouldIncrementAge = pet.stage === 'ultimate' || pet.stage === 'elder'
      const newAgeDays = shouldIncrementAge ? pet.age_days + 1 : pet.age_days

      // elder: flag final choice when age_days >= 10
      const isElder = pet.stage === 'elder' || newStage === 'elder'
      const newFinalChoiceRequired =
        isElder && newAgeDays >= 10 ? true : (pet.final_choice_required ?? false)

      await supabaseAdmin
        .from('pets')
        .update({
          hunger: newHunger,
          happiness: newHappiness,
          energy: newEnergy,
          stage: newStage,
          age_days: newAgeDays,
          final_choice_required: newFinalChoiceRequired,
          ...(newStageEnteredAt && { stage_entered_at: newStageEnteredAt }),
        })
        .eq('id', pet.id)

      processed++
    }
  }

  return NextResponse.json({ processed, died })
}
