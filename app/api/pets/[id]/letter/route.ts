import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { generateLetterContent, LetterType } from '@/lib/letter-content'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { targetPetId, letterType } = await request.json()

  if (!targetPetId) return NextResponse.json({ error: 'targetPetId is required' }, { status: 400 })
  if (!letterType || !['mock', 'apologize', 'love', 'encourage'].includes(letterType)) {
    return NextResponse.json({ error: 'Invalid letterType' }, { status: 400 })
  }

  const { data: myPet } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, name')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (!myPet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 })

  const { data: targetPet } = await supabaseAdmin
    .from('pets')
    .select('id, user_id, name')
    .eq('id', targetPetId)
    .eq('is_alive', true)
    .single()

  if (!targetPet) return NextResponse.json({ error: 'Target pet not found' }, { status: 404 })

  const content = generateLetterContent(letterType as LetterType, myPet.name, targetPet.name)

  // Save letter to letters table
  const { data: letter, error: letterError } = await supabaseAdmin
    .from('letters')
    .insert({
      from_pet_id: myPet.id,
      to_pet_id: targetPet.id,
      content,
      letter_type: letterType,
      status: 'pending',
    })
    .select()
    .single()

  if (letterError) return NextResponse.json({ error: letterError.message }, { status: 500 })

  // 편지 타입별 관계 변화
  const letterEffects: Record<string, { intensityDelta: number; type: string | null }> = {
    mock:      { intensityDelta: 10, type: 'rival' },   // 조롱 → 라이벌 강도↑
    apologize: { intensityDelta: 5,  type: null },       // 사과 → 강도↑, 타입 개선
    love:      { intensityDelta: 10, type: 'love' },     // 사랑 → 사랑 관계
    encourage: { intensityDelta: 8,  type: 'friend' },   // 격려 → 우정
  }
  const effect = letterEffects[letterType] ?? { intensityDelta: 5, type: null }

  const [firstId, secondId] =
    myPet.id < targetPet.id ? [myPet.id, targetPet.id] : [targetPet.id, myPet.id]

  const { data: existingRel } = await supabaseAdmin
    .from('relationships')
    .select('id, type, intensity')
    .eq('pet_a_id', firstId)
    .eq('pet_b_id', secondId)
    .single()

  // 사과: 앙숙이면 라이벌로, 라이벌이면 그대로, 그 외엔 우정으로
  const apologyTypeMap: Record<string, string> = {
    enemy: 'rival',
    rival: 'rival',
    friend: 'friend',
    love: 'love',
  }

  const newType = effect.type
    ?? (letterType === 'apologize' && existingRel
      ? apologyTypeMap[existingRel.type] ?? 'friend'
      : existingRel?.type ?? 'friend')

  if (existingRel) {
    await supabaseAdmin
      .from('relationships')
      .update({
        intensity: Math.min(100, existingRel.intensity + effect.intensityDelta),
        type: newType,
      })
      .eq('id', existingRel.id)
  } else {
    await supabaseAdmin
      .from('relationships')
      .insert({ pet_a_id: firstId, pet_b_id: secondId, type: newType, intensity: effect.intensityDelta })
  }

  const letterTypeDesc: Record<string, string> = {
    mock:      `${myPet.name}이(가) ${targetPet.name}에게 조롱 편지를 보냈어요 😈`,
    apologize: `${myPet.name}이(가) ${targetPet.name}에게 사과 편지를 보냈어요 🙏`,
    love:      `${myPet.name}이(가) ${targetPet.name}에게 사랑 편지를 보냈어요 💕`,
    encourage: `${myPet.name}이(가) ${targetPet.name}에게 격려 편지를 보냈어요 🌟`,
  }
  const description = letterTypeDesc[letterType] ?? `${myPet.name}이(가) ${targetPet.name}에게 편지를 보냈어요 💌`

  await supabaseAdmin.from('pet_events').insert([
    { pet_id: myPet.id, other_pet_id: targetPet.id, event_type: 'letter', description },
    { pet_id: targetPet.id, other_pet_id: myPet.id, event_type: 'letter', description },
  ])

  return NextResponse.json({ success: true, event: description, letter })
}

// GET: preview content before sending (no DB write)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const targetPetId = searchParams.get('targetPetId')
  const letterType = searchParams.get('letterType') as LetterType

  if (!targetPetId || !letterType) {
    return NextResponse.json({ error: 'targetPetId and letterType required' }, { status: 400 })
  }

  const [{ data: myPet }, { data: targetPet }] = await Promise.all([
    supabaseAdmin.from('pets').select('id, user_id, name').eq('id', id).eq('user_id', session.user.id).single(),
    supabaseAdmin.from('pets').select('id, name').eq('id', targetPetId).single(),
  ])

  if (!myPet || !targetPet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 })

  const content = generateLetterContent(letterType, myPet.name, targetPet.name)
  return NextResponse.json({ content })
}
