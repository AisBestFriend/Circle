import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Circle — 방치형 멀티플레이 다마고치',
  description: '나만의 픽셀 아트 다마고치를 키우고 친구들과 관계를 형성하세요',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body style={{ fontFamily: "'Courier New', Courier, monospace" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
