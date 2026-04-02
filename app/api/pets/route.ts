import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: pet } = await supabaseAdmin
    .from('pets')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  return NextResponse.json({ pet: pet ?? null })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await request.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: '이름을 입력해주세요' }, { status: 400 })
  }

  const { data: existing } = await supabaseAdmin
    .from('pets')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('is_alive', true)
    .single()

  if (existing) {
    return NextResponse.json({ error: '이미 펫이 있습니다' }, { status: 400 })
  }

  const { data: pet, error } = await supabaseAdmin
    .from('pets')
    .insert({ user_id: session.user.id, name: name.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ pet })
}
