import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getStatCap } from '@/lib/stat-cap'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: alivePets, error } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, name, stage, evolution_type, hunger, happiness, energy, strength, wisdom, age_days, born_at, stage_entered_at, last_tick_at, final_choice_required, is_sleeping, last_strength_trained_at, last_wisdom_trained_at, evolution_ready_at, starvation_since')
    .eq('is_alive', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!alivePets || alivePets.length === 0) {
    return NextResponse.json({ processed: 0, died: 0 })
  }

  let processed = 0
  let died = 0
  const now = new Date()

  const DECAY_THRESHOLD_MS = 12 * 3600 * 1000
  const DECAY_PER_HOUR = 5

  for (const pet of alivePets) {
    const cap = getStatCap(pet.stage)
    const newHunger = Math.max(0, pet.hunger - 5)
    const newHappiness = Math.max(0, pet.happiness - 3)
    const newEnergy = pet.is_sleeping
      ? Math.min(cap, pet.energy + 10) // 수면 중: 시간당 10 회복
      : Math.max(0, pet.energy - 4)

    // 스탯 자연 감소
    const lastTickMs = pet.last_tick_at ? new Date(pet.last_tick_at).getTime() : now.getTime() - 3600000

    let newStrength = pet.strength ?? 0
    if (pet.last_strength_trained_at) {
      const trainedAgo = now.getTime() - new Date(pet.last_strength_trained_at).getTime()
      if (trainedAgo > DECAY_THRESHOLD_MS) {
        const decayStartMs = new Date(pet.last_strength_trained_at).getTime() + DECAY_THRESHOLD_MS
        const decayFrom = Math.max(lastTickMs, decayStartMs)
        const decayHours = Math.max(0, (now.getTime() - decayFrom) / 3600000)
        newStrength = Math.max(5, Math.round(newStrength - decayHours * DECAY_PER_HOUR))
      }
    }

    let newWisdom = pet.wisdom ?? 0
    if (pet.last_wisdom_trained_at) {
      const trainedAgo = now.getTime() - new Date(pet.last_wisdom_trained_at).getTime()
      if (trainedAgo > DECAY_THRESHOLD_MS) {
        const decayStartMs = new Date(pet.last_wisdom_trained_at).getTime() + DECAY_THRESHOLD_MS
        const decayFrom = Math.max(lastTickMs, decayStartMs)
        const decayHours = Math.max(0, (now.getTime() - decayFrom) / 3600000)
        newWisdom = Math.max(5, Math.round(newWisdom - decayHours * DECAY_PER_HOUR))
      }
    }

    // 굶주림 사망 판정: hunger=0 AND energy=0 상태 5일 지속
    let newStarvationSince: string | null | undefined = undefined
    const isStarving = newHunger === 0 && newEnergy === 0

    if (isStarving) {
      if (!pet.starvation_since) {
        newStarvationSince = now.toISOString()  // 최초 진입
      } else if (now.getTime() - new Date(pet.starvation_since).getTime() >= 5 * 24 * 3600 * 1000) {
        // 5일 경과 → 사망
        await supabaseAdmin
          .from('pets')
          .update({ is_alive: false, hunger: 0, energy: 0 })
          .eq('id', pet.id)

        await supabaseAdmin.from('tombstones').insert({
          pet_id: pet.id,
          user_id: pet.user_id,
          name: pet.name,
          stage: pet.stage,
          evolution_type: pet.evolution_type ?? null,
          age_days: pet.age_days,
          epitaph: '굶주림과 탈진으로 쓰러졌습니다...',
          died_at: now.toISOString(),
        })

        died++
        continue
      }
    } else {
      // 회복 시 starvation_since 초기화
      if (pet.starvation_since) {
        newStarvationSince = null
      }
    }

    {
      // Growth logic
      let newStage = pet.stage
      let newStageEnteredAt: string | null = null
      let evolutionReadyAt: string | null | undefined = undefined  // undefined = no change
      const avg = (pet.hunger + pet.happiness + pet.energy) / 3

      if (pet.stage === 'egg') {
        const elapsed = (now.getTime() - new Date(pet.born_at).getTime()) / 1000
        if (elapsed >= 600) {
          newStage = 'baby'
          newStageEnteredAt = now.toISOString()
        }
      } else if (pet.stage === 'baby') {
        // 생성 다음날 KST 03:00 이후 + avg ≥ 50
        const bornKst = new Date(new Date(pet.born_at).getTime() + 9 * 3600 * 1000)
        const nextDay3am = new Date(Date.UTC(
          bornKst.getUTCFullYear(),
          bornKst.getUTCMonth(),
          bornKst.getUTCDate() + 1,
          -9 + 3, 0, 0, 0  // KST 03:00 = UTC 전날 18:00
        ))
        if (now >= nextDay3am && avg >= 50) {
          newStage = 'teen'
          newStageEnteredAt = now.toISOString()
        }
      } else if (pet.stage === 'teen') {
        const elapsed = (now.getTime() - new Date(pet.stage_entered_at).getTime()) / 1000

        // 기존 조건: 72시간 경과 + avg 70 이상
        if (elapsed >= 72 * 3600 && avg >= 70) {
          newStage = 'adult'
          newStageEnteredAt = now.toISOString()
        } else {
          // 신규 조건: avg 80 이상 → 다음날 KST 자정 예약
          if (avg >= 80) {
            if (!pet.evolution_ready_at) {
              // 다음날 KST(UTC+9) 자정 계산
              const kstNow = new Date(now.getTime() + 9 * 3600 * 1000)
              const kstMidnight = new Date(Date.UTC(
                kstNow.getUTCFullYear(),
                kstNow.getUTCMonth(),
                kstNow.getUTCDate() + 1,
                -9, 0, 0, 0  // UTC 기준 KST 자정 = UTC 전날 15:00
              ))
              evolutionReadyAt = kstMidnight.toISOString()
            } else if (now >= new Date(pet.evolution_ready_at)) {
              // 자정 지남 → 완전체 진화
              newStage = 'adult'
              newStageEnteredAt = now.toISOString()
              evolutionReadyAt = null
            }
          } else {
            // avg 80 미달 → 예약 취소
            if (pet.evolution_ready_at) {
              evolutionReadyAt = null
            }
          }
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
          strength: newStrength,
          wisdom: newWisdom,
          stage: newStage,
          age_days: newAgeDays,
          final_choice_required: newFinalChoiceRequired,
          last_tick_at: now.toISOString(),
          ...(newStageEnteredAt && { stage_entered_at: newStageEnteredAt }),
          ...(evolutionReadyAt !== undefined && { evolution_ready_at: evolutionReadyAt }),
          ...(newStarvationSince !== undefined && { starvation_since: newStarvationSince }),
        })
        .eq('id', pet.id)

      processed++
    }
  }

  return NextResponse.json({ processed, died })
}
