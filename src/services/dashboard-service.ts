import { subDays } from 'date-fns'
import { getSupabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

export type ZoneRow = Database['public']['Tables']['zones']['Row']
export type ZoneReadingRow = Database['public']['Tables']['zone_readings']['Row']
export type AlertRow = Database['public']['Tables']['alerts']['Row']
export type UsageEventRow = Database['public']['Tables']['usage_events']['Row']

export async function fetchZones(userId: string): Promise<ZoneRow[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('zones').select('*').eq('user_id', userId).order('created_at', {
    ascending: false,
  })
  if (error) throw error
  return data ?? []
}

export async function createZone(input: {
  userId: string
  name: string
  externalZoneId?: string
  location?: string
}): Promise<ZoneRow> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('zones')
    .insert({
      user_id: input.userId,
      name: input.name,
      external_zone_id: input.externalZoneId ?? null,
      location: input.location ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchReadingsLast7Days(userId: string): Promise<ZoneReadingRow[]> {
  const supabase = getSupabase()
  const since = subDays(new Date(), 7).toISOString()
  const { data, error } = await supabase
    .from('zone_readings')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchReadingById(id: string, userId: string): Promise<ZoneReadingRow | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('zone_readings')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function fetchAlerts(userId: string, limit = 50): Promise<AlertRow[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function acknowledgeAlert(alertId: string, userId: string): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.from('alerts').update({ acknowledged: true }).eq('id', alertId).eq('user_id', userId)
  if (error) throw error
}

export async function fetchUsageEvents(userId: string, limit = 200): Promise<UsageEventRow[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('usage_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export function creditsRemaining(profile: {
  monthly_credit_allowance: number
  credits_used_this_period: number
}): number {
  return Math.max(0, profile.monthly_credit_allowance - profile.credits_used_this_period)
}
