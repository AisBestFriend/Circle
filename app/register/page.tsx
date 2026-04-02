'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? '회원가입 중 오류가 발생했습니다')
      setLoading(false)
      return
    }

    // Auto login after register
    const result = await signIn('credentials', {
      email,
      password,
      callbackUrl: '/dashboard',
      redirect: false,
    })

    if (result?.url) {
      router.push(result.url)
    } else {
      router.push('/login')
    }
  }

  return (
    <main className="min-h-screen pixel-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <div
            className="text-4xl font-bold tracking-widest text-yellow-400"
            style={{ fontFamily: 'monospace', textShadow: '3px 3px 0 #92400e' }}
          >
            CIRCLE
          </div>
          <p className="text-green-600 font-mono text-xs">새 계정 만들기</p>
        </div>

        {/* Register card */}
        <div className="pixel-card p-6 space-y-4">
          <h2 className="text-yellow-400 font-mono font-bold text-center tracking-wide">
            [ 회원가입 ]
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="닉네임"
              required
              maxLength={20}
              className="w-full bg-black border-2 border-green-900 focus:border-green-400 px-3 py-2 text-green-300 font-mono text-sm outline-none placeholder:text-green-900"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              required
              className="w-full bg-black border-2 border-green-900 focus:border-green-400 px-3 py-2 text-green-300 font-mono text-sm outline-none placeholder:text-green-900"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 (6자 이상)"
              required
              minLength={6}
              className="w-full bg-black border-2 border-green-900 focus:border-green-400 px-3 py-2 text-green-300 font-mono text-sm outline-none placeholder:text-green-900"
            />
            {error && (
              <p className="text-red-400 text-xs font-mono">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black font-mono font-bold py-2 px-4 border-b-4 border-yellow-700 hover:bg-yellow-300 active:border-b-0 active:mt-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? '처리 중...' : '▶ 계정 만들기'}
            </button>
          </form>

          <p className="text-center text-green-900 text-xs font-mono">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-green-400 hover:text-green-300 underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
