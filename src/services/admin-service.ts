import { getSupabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type ApiLogRow = Database['public']['Tables']['api_monitor_logs']['Row']

export async function fetchAllProfiles(): Promise<ProfileRow[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchApiMonitorLogs(limit = 500): Promise<ApiLogRow[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('api_monitor_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function updateProfileAdmin(
  userId: string,
  patch: Partial<Pick<ProfileRow, 'role' | 'plan_tier' | 'monthly_credit_allowance' | 'credits_used_this_period'>>,
): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId)
  if (error) throw error
}
