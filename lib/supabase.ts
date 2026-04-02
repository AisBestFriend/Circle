import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          image?: string | null
          updated_at?: string
        }
      }
      pets: {
        Row: {
          id: string
          user_id: string
          name: string
          stage: 'egg' | 'baby' | 'teen' | 'adult' | 'ultimate'
          evolution_type: 'warrior' | 'sage' | 'dark' | 'balance' | null
          hunger: number
          happiness: number
          energy: number
          strength: number
          wisdom: number
          dark: number
          harmony: number
          age_days: number
          partner_id: string | null
          is_alive: boolean
          born_at: string
          stage_entered_at: string
          last_fed_at: string
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['pets']['Row']> & {
          user_id: string
          name: string
        }
        Update: Partial<Database['public']['Tables']['pets']['Row']>
      }
      relationships: {
        Row: {
          id: string
          pet_a_id: string
          pet_b_id: string
          type: 'love' | 'friend' | 'rival' | 'enemy'
          intensity: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['relationships']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['relationships']['Row']>
      }
      tombstones: {
        Row: {
          id: string
          pet_id: string
          user_id: string
          name: string
          stage: string
          evolution_type: string | null
          age_days: number
          epitaph: string | null
          died_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tombstones']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tombstones']['Row']>
      }
    }
  }
}
