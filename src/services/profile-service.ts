import { getSupabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

export type ProfileRow = Database['public']['Tables']['profiles']['Row']

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data
}

export async function updateProfileSelf(
  userId: string,
  patch: Pick<ProfileRow, 'full_name' | 'company_name'>,
): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId)
  if (error) throw error
}
