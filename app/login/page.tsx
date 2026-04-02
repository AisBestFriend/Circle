import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { LoginButton } from './login-button'
import { CredentialsForm } from './credentials-form'

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <main className="min-h-screen pixel-bg flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 w-full max-w-sm">
        {/* Pixel art title */}
        <div className="space-y-2">
          <div
            className="text-5xl font-bold tracking-widest text-yellow-400"
            style={{ fontFamily: 'monospace', textShadow: '3px 3px 0 #92400e, 6px 6px 0 #451a03' }}
          >
            CIRCLE
          </div>
          <p className="text-green-600 font-mono text-sm tracking-wider">
            방치형 멀티플레이 다마고치
          </p>
        </div>

        {/* Decorative pixel pets row */}
        <div className="flex justify-center gap-6 py-2">
          {['🥚', '🐣', '🐥', '🌟', '💫'].map((emoji, i) => (
            <span
              key={i}
              className="text-2xl animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {emoji}
            </span>
          ))}
        </div>

        {/* Login card */}
        <div className="pixel-card p-6 space-y-5">
          <div className="space-y-1 text-center">
            <h2 className="text-yellow-400 font-mono font-bold tracking-wide">
              [ 서클에 참가하기 ]
            </h2>
          </div>

          {/* Email/password form */}
          <CredentialsForm />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-green-900" />
            <span className="text-green-800 text-xs font-mono">또는</span>
            <div className="flex-1 border-t border-green-900" />
          </div>

          {/* Google login */}
          <LoginButton />
        </div>

        {/* Footer info */}
        <div className="text-green-900 text-xs font-mono space-y-1">
          <p>알 → 유아기 → 성숙기 → 완전체 → 궁극체</p>
          <p>친구와 함께 키우면 관계가 자동으로 형성됩니다</p>
        </div>
      </div>
    </main>
  )
}
