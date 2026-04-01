export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'user' | 'admin'
export type PlanTier = 'free' | 'pro' | 'enterprise'
export type SourceType = 'image' | 'sensor'
export type AlertSeverity = 'info' | 'warning' | 'critical'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          role: UserRole
          plan_tier: PlanTier
          monthly_credit_allowance: number
          credits_used_this_period: number
          period_start: string
          company_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          role?: UserRole
          plan_tier?: PlanTier
          monthly_credit_allowance?: number
          credits_used_this_period?: number
          period_start?: string
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string | null
          full_name?: string | null
          role?: UserRole
          plan_tier?: PlanTier
          monthly_credit_allowance?: number
          credits_used_this_period?: number
          period_start?: string
          company_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      zones: {
        Row: {
          id: string
          user_id: string
          name: string
          external_zone_id: string | null
          location: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          external_zone_id?: string | null
          location?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          external_zone_id?: string | null
          location?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
      zone_readings: {
        Row: {
          id: string
          zone_id: string
          user_id: string
          source_type: SourceType
          density_score: number | null
          occupancy_percent: number | null
          confidence: number | null
          ai_result_url: string | null
          temp_image_public_id: string | null
          raw_payload: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          zone_id: string
          user_id: string
          source_type: SourceType
          density_score?: number | null
          occupancy_percent?: number | null
          confidence?: number | null
          ai_result_url?: string | null
          temp_image_public_id?: string | null
          raw_payload?: Json | null
          created_at?: string
        }
        Update: {
          density_score?: number | null
          occupancy_percent?: number | null
          confidence?: number | null
          ai_result_url?: string | null
          temp_image_public_id?: string | null
          raw_payload?: Json | null
        }
        Relationships: []
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          zone_id: string | null
          severity: AlertSeverity
          message: string
          acknowledged: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          zone_id?: string | null
          severity: AlertSeverity
          message: string
          acknowledged?: boolean
          created_at?: string
        }
        Update: {
          zone_id?: string | null
          severity?: AlertSeverity
          message?: string
          acknowledged?: boolean
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          id: string
          user_id: string
          zone_reading_id: string | null
          credits_delta: number
          event_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          zone_reading_id?: string | null
          credits_delta: number
          event_type: string
          created_at?: string
        }
        Update: {
          zone_reading_id?: string | null
          credits_delta?: number
          event_type?: string
        }
        Relationships: []
      }
      api_monitor_logs: {
        Row: {
          id: string
          user_id: string | null
          endpoint: string
          status_code: number
          latency_ms: number
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          endpoint: string
          status_code: number
          latency_ms: number
          error_message?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string | null
          endpoint?: string
          status_code?: number
          latency_ms?: number
          error_message?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
