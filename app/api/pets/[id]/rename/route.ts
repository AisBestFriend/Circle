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
  const { name } = await request.json()

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: '이름을 입력해주세요' }, { status: 400 })
  }
  const trimmed = name.trim()
  if (trimmed.length < 1 || trimmed.length > 12) {
    return NextResponse.json({ error: '이름은 1~12자여야 해요' }, { status: 400 })
  }

  const { data: updated, error } = await supabaseAdmin
    .from('pets')
    .update({ name: trimmed })
    .eq('id', id)
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .select()
    .single()

  if (error || !updated) return NextResponse.json({ error: '펫을 찾을 수 없습니다' }, { status: 404 })

  return NextResponse.json({ pet: updated })
}
