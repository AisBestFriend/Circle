import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  const { data: friendships, error } = await supabaseAdmin
    .from('friendships')
    .select('id, user_id_1, user_id_2, status, created_at')
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const friendIds = (friendships ?? []).map(f =>
    f.user_id_1 === userId ? f.user_id_2 : f.user_id_1
  )

  const [{ data: users }, { data: pets }] = await Promise.all([
    friendIds.length > 0
      ? supabaseAdmin.from('users').select('id, name, email, image').in('id', friendIds)
      : Promise.resolve({ data: [] as any[] }),
    friendIds.length > 0
      ? supabaseAdmin.from('pets').select('*').in('user_id', friendIds).eq('is_alive', true)
      : Promise.resolve({ data: [] as any[] }),
  ])

  const usersMap = Object.fromEntries((users ?? []).map((u: any) => [u.id, u]))
  const petsMap: Record<string, any> = {}
  for (const pet of pets ?? []) {
    petsMap[pet.user_id] = pet
  }

  const result = (friendships ?? []).map(f => {
    const friendId = f.user_id_1 === userId ? f.user_id_2 : f.user_id_1
    return {
      id: f.id,
      status: f.status,
      isSender: f.user_id_1 === userId,
      friend: usersMap[friendId] ?? { id: friendId },
      friendPet: petsMap[friendId] ?? null,
      created_at: f.created_at,
    }
  })

  return NextResponse.json({ friendships: result })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email } = await request.json()
  if (!email?.trim()) {
    return NextResponse.json({ error: '이메일을 입력해주세요' }, { status: 400 })
  }

  if (email.trim().toLowerCase() === session.user.email?.toLowerCase()) {
    return NextResponse.json({ error: '자기 자신에게는 친구 요청을 보낼 수 없습니다' }, { status: 400 })
  }

  const { data: targetUser } = await supabaseAdmin
    .from('users')
    .select('id, name, email')
    .eq('email', email.trim().toLowerCase())
    .single()

  if (!targetUser) {
    return NextResponse.json({ error: '해당 이메일의 사용자를 찾을 수 없습니다' }, { status: 404 })
  }

  const userId = session.user.id
  const targetId = targetUser.id

  const { data: existing } = await supabaseAdmin
    .from('friendships')
    .select('id')
    .or(
      `and(user_id_1.eq.${userId},user_id_2.eq.${targetId}),and(user_id_1.eq.${targetId},user_id_2.eq.${userId})`
    )
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: '이미 친구 요청이 존재합니다' }, { status: 400 })
  }

  const { data: friendship, error } = await supabaseAdmin
    .from('friendships')
    .insert({ user_id_1: userId, user_id_2: targetId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ friendship })
}
