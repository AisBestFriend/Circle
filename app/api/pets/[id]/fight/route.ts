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
    .select('id, user_id, name, strength, wisdom, dark, harmony, energy, happiness, fight_count_today, fight_date, is_sleeping')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (!myPet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
  if (myPet.is_sleeping) return NextResponse.json({ error: '자는 중이에요. 먼저 깨워주세요! 💤' }, { status: 400 })
  if (myPet.energy < 20) return NextResponse.json({ error: '에너지가 부족해요. 재워서 에너지를 충전해주세요! 😴' }, { status: 400 })

  // 하루 10회 제한 (KST 기준)
  const seoulNow = new Date(Date.now() + 9 * 3600 * 1000)
  const todayKST = seoulNow.toISOString().split('T')[0]
  const currentCount = myPet.fight_date === todayKST ? (myPet.fight_count_today ?? 0) : 0

  if (currentCount >= 10) {
    return NextResponse.json(
      { error: '오늘 싸움 횟수(10회)를 모두 사용했어요. 자정 이후 초기화됩니다.' },
      { status: 400 }
    )
  }

  const { data: targetPet } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, name, strength, wisdom, dark, harmony')
    .eq('id', targetPetId)
    .eq('is_alive', true)
    .single()

  if (!targetPet) return NextResponse.json({ error: 'Target pet not found' }, { status: 404 })
  if (targetPet.user_id === session.user.id) {
    return NextResponse.json({ error: 'Cannot fight your own pet' }, { status: 400 })
  }

  // 종합 전투력: 힘40% + 지혜30% + 암흑20% + 조화10% + 약간의 랜덤(±5)
  const myPower = myPet.strength * 0.4 + myPet.wisdom * 0.3 + myPet.dark * 0.2 + myPet.harmony * 0.1 + (Math.random() * 10 - 5)
  const targetPower = targetPet.strength * 0.4 + targetPet.wisdom * 0.3 + targetPet.dark * 0.2 + targetPet.harmony * 0.1 + (Math.random() * 10 - 5)
  const won = myPower >= targetPower

  const myUpdates = {
    ...(won
      ? { strength: Math.min(100, myPet.strength + 2), happiness: Math.min(100, myPet.happiness + 10) }
      : { energy: Math.max(0, myPet.energy - 15) }),
    fight_count_today: currentCount + 1,
    fight_date: todayKST,
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

  const description = won
    ? `${myPet.name}이(가) ${targetPet.name}와(과) 싸워서 이겼어요! ⚔️`
    : `${myPet.name}이(가) ${targetPet.name}와(과) 싸워서 졌어요... ⚔️`

  await supabaseAdmin.from('pet_events').insert([
    { pet_id: myPet.id, other_pet_id: targetPet.id, event_type: 'fight', description },
    { pet_id: targetPet.id, other_pet_id: myPet.id, event_type: 'fight', description },
  ])

  const attackerStats = { name: myPet.name, strength: myPet.strength, wisdom: myPet.wisdom, dark: myPet.dark, harmony: myPet.harmony }
  const defenderStats = { name: targetPet.name, strength: targetPet.strength, wisdom: targetPet.wisdom, dark: targetPet.dark, harmony: targetPet.harmony }

  return NextResponse.json({
    pet: updatedPet,
    won,
    event: description,
    attacker: attackerStats,
    defender: defenderStats,
    fightCountToday: currentCount + 1,
    fightCountLeft: 10 - (currentCount + 1),
  })
}
