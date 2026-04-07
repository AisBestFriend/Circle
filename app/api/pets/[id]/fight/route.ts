import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { targetPetId } = await request.json()

  if (!targetPetId) return NextResponse.json({ error: 'targetPetId is required' }, { status: 400 })

  const { data: myPet } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, name, strength, wisdom, dark, harmony, energy, happiness, hunger, fight_charges, fight_charges_updated_at, is_sleeping')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (!myPet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
  if (myPet.is_sleeping) return NextResponse.json({ error: '자는 중이에요. 먼저 깨워주세요! 💤' }, { status: 400 })
  if (myPet.energy < 20) return NextResponse.json({ error: '에너지가 부족해요. 재워서 에너지를 충전해주세요! 😴' }, { status: 400 })
  if (myPet.hunger <= 20) return NextResponse.json({ error: '배가 너무 고파서 싸울 수 없어요! 🍖 밥을 먼저 주세요.', status: 400 })

  // 전투권 충전 계산 (30분마다 1회, 최대 10)
  const MAX_CHARGES = 10
  const RECHARGE_MS = 30 * 60 * 1000
  const now = Date.now()
  const lastUpdated = myPet.fight_charges_updated_at ? new Date(myPet.fight_charges_updated_at).getTime() : now
  const currentCharges = myPet.fight_charges ?? MAX_CHARGES
  const elapsed = now - lastUpdated
  const recharged = Math.min(MAX_CHARGES - currentCharges, Math.floor(elapsed / RECHARGE_MS))
  const availableCharges = currentCharges + recharged

  if (availableCharges <= 0) {
    const msUntilNext = RECHARGE_MS - (elapsed % RECHARGE_MS)
    const minsLeft = Math.ceil(msUntilNext / 60000)
    return NextResponse.json(
      { error: `⚡ 전투권이 없어요. ${minsLeft}분 후 충전돼요!` },
      { status: 400 }
    )
  }

  const { data: targetPet } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, name, stage, evolution_type, strength, wisdom, dark, harmony, is_sleeping')
    .eq('id', targetPetId)
    .eq('is_alive', true)
    .single()

  if (!targetPet) return NextResponse.json({ error: 'Target pet not found' }, { status: 404 })
  if (targetPet.user_id === session.user.id) {
    return NextResponse.json({ error: 'Cannot fight your own pet' }, { status: 400 })
  }

  // 급습: 자는 상대는 힘 -10%
  const sneakAttack = targetPet.is_sleeping === true

  // 행복도 패널티: 행복도 20 미만 시 내 힘 -30%
  const sadPenaltyApplied = myPet.happiness < 20
  const myHappinessPenalty = sadPenaltyApplied ? 0.7 : 1.0

  // ── 새 전투 계산 ──────────────────────────────
  let myStr = (myPet.strength ?? 0) * myHappinessPenalty
  let targetStr = (targetPet.strength ?? 0) * (sneakAttack ? 0.9 : 1.0)

  // 1. 암흑(dark): 확률 발동 시 상대 힘 절반
  const darkCapped = Math.min(myPet.dark ?? 0, 150)
  const darkChance = 50 + (darkCapped / 150) * 20  // 50~70%
  const darkTriggered = Math.random() * 100 < darkChance
  if (darkTriggered) targetStr *= 0.5

  // 2. 지혜(wisdom): 확률 발동 시 내 힘 2배
  const wisdomCapped = Math.min(myPet.wisdom ?? 0, 150)
  const wisdomChance = 50 + (wisdomCapped / 150) * 20  // 50~70%
  const wisdomTriggered = Math.random() * 100 < wisdomChance
  if (wisdomTriggered) myStr *= 2

  // 3. 조화(harmony): 상대가 더 강하면 차이의 30~45% 보정
  const harmonyCapped = Math.min(myPet.harmony ?? 0, 150)
  const harmonyRate = (30 + (harmonyCapped / 150) * 15) / 100  // 0.30~0.45
  const harmonyApplied = targetStr > myStr
  if (harmonyApplied) myStr += (targetStr - myStr) * harmonyRate

  // 4. 랜덤 ±5
  const myPower = myStr + (Math.random() * 10 - 5)
  const targetPower = targetStr + (Math.random() * 10 - 5)
  const won = myPower >= targetPower

  const newCharges = availableCharges - 1
  // If recharged some, update the timestamp to reflect partial usage
  const newUpdatedAt = recharged > 0
    ? new Date(lastUpdated + recharged * RECHARGE_MS).toISOString()
    : myPet.fight_charges_updated_at

  const myUpdates = {
    ...(won
      ? { strength: Math.min(100, myPet.strength + 2), happiness: Math.min(100, myPet.happiness + 10) }
      : { energy: Math.max(0, myPet.energy - 15) }),
    fight_charges: newCharges,
    fight_charges_updated_at: newUpdatedAt,
    last_active_at: new Date().toISOString(),
  }

  const { data: updatedPet, error: updateError } = await supabaseAdmin
    .from('pets')
    .update(myUpdates)
    .eq('id', id)
    .select()
    .single()

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Update relationship (consistent ordering by id)
  const [firstId, secondId] =
    myPet.id < targetPet.id ? [myPet.id, targetPet.id] : [targetPet.id, myPet.id]

  const { data: existingRel } = await supabaseAdmin
    .from('relationships')
    .select('id, type, intensity')
    .eq('pet_a_id', firstId)
    .eq('pet_b_id', secondId)
    .single()

  const intensityIncrease = won ? 10 : 5

  if (existingRel) {
    const newType =
      existingRel.type === 'rival' || existingRel.type === 'enemy' ? existingRel.type : 'rival'
    await supabaseAdmin
      .from('relationships')
      .update({ intensity: Math.min(100, existingRel.intensity + intensityIncrease), type: newType })
      .eq('id', existingRel.id)
  } else {
    await supabaseAdmin
      .from('relationships')
      .insert({ pet_a_id: firstId, pet_b_id: secondId, type: 'rival', intensity: intensityIncrease })
  }

  // 이야기식 전투 서사 생성
  const battleStory: string[] = []

  if (sneakAttack) battleStory.push(`자고 있던 ${targetPet.name}을(를) 기습했다!`)
  if (darkTriggered) battleStory.push(`${myPet.name}의 암흑이 발동해 ${targetPet.name}의 힘을 봉쇄했다.`)
  if (wisdomTriggered) battleStory.push(`${myPet.name}의 지혜가 빛을 발해 힘이 두 배로 솟구쳤다!`)
  if (harmonyApplied) battleStory.push(`${myPet.name}의 조화가 열세를 극복하게 도왔다.`)
  if (sadPenaltyApplied) battleStory.push(`배고프고 우울한 ${myPet.name}은 제 힘을 발휘하지 못했다...`)

  const resultLine = won
    ? `${myPet.name}이(가) ${targetPet.name}와(과) 싸워서 이겼어요! ⚔️`
    : `${myPet.name}이(가) ${targetPet.name}와(과) 싸워서 졌어요... ⚔️`
  battleStory.push(resultLine)

  const description = battleStory.join(' ')

  await supabaseAdmin.from('pet_events').insert(
    { pet_id: myPet.id, other_pet_id: targetPet.id, event_type: 'fight', description }
  )

  const attackerStats = { name: myPet.name, strength: myPet.strength, wisdom: myPet.wisdom, dark: myPet.dark, harmony: myPet.harmony }
  const defenderStats = { name: targetPet.name, stage: targetPet.stage, evolution_type: targetPet.evolution_type ?? null, strength: targetPet.strength, wisdom: targetPet.wisdom, dark: targetPet.dark, harmony: targetPet.harmony }

  return NextResponse.json({
    pet: updatedPet,
    won,
    sneakAttack,
    sadPenaltyApplied,
    wisdomTriggered,
    darkTriggered,
    harmonyApplied,
    event: description,
    attacker: attackerStats,
    defender: defenderStats,
    fightChargesLeft: newCharges,
  })
}
