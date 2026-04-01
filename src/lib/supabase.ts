import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getEnv } from '@/env'
import type { Database } from '@/types/database'

let client: SupabaseClient<Database> | null = null

export function getSupabase(): SupabaseClient<Database> {
  if (!client) {
    const env = getEnv()
    client = createClient<Database>(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return client
}
