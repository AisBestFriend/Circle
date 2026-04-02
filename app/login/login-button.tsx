'use client'

import { signIn } from 'next-auth/react'

export function LoginButton() {
  return (
    <button
      onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
      className="w-full bg-transparent border-2 border-green-700 hover:border-green-400 text-green-400 hover:text-green-300 font-mono font-bold py-2 px-4 transition-all"
    >
      🔑 Google로 시작하기
    </button>
  )
}
