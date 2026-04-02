import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { hashPassword } from '@/lib/password'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다' }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json({ error: '이미 사용 중인 이메일입니다' }, { status: 400 })
    }

    const password_hash = await hashPassword(password)

    const { error } = await supabaseAdmin
      .from('users')
      .insert({ email, name, password_hash })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '회원가입 중 오류가 발생했습니다' }, { status: 500 })
  }
}
