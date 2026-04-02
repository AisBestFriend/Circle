import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyPassword } from '@/lib/password'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: '이메일/비밀번호',
      credentials: {
        email: { label: '이메일', type: 'email' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id, email, name, image, password_hash')
          .eq('email', credentials.email)
          .single()

        if (!user?.password_hash) return null

        const isValid = await verifyPassword(credentials.password, user.password_hash)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false
      // Only upsert for OAuth providers (credentials users are already in DB)
      if (account?.provider !== 'credentials') {
        try {
          await supabaseAdmin.from('users').upsert({
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'email' })
        } catch {
          // continue
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
  },
}
