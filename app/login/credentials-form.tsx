'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export function CredentialsForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      callbackUrl: '/dashboard',
      redirect: false,
    })

    if (result?.error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다')
      setLoading(false)
    } else if (result?.url) {
      window.location.href = result.url
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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
        placeholder="비밀번호"
        required
        className="w-full bg-black border-2 border-green-900 focus:border-green-400 px-3 py-2 text-green-300 font-mono text-sm outline-none placeholder:text-green-900"
      />
      {error && (
        <p className="text-red-400 text-xs font-mono">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-400 text-black font-mono font-bold py-2 px-4 border-b-4 border-yellow-700 hover:bg-yellow-300 active:border-b-0 active:mt-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        style={{ imageRendering: 'pixelated' }}
      >
        {loading ? '로그인 중...' : '▶ 로그인'}
      </button>
      <p className="text-center text-green-900 text-xs font-mono">
        계정이 없으신가요?{' '}
        <Link href="/register" className="text-green-400 hover:text-green-300 underline">
          회원가입
        </Link>
      </p>
    </form>
  )
}
