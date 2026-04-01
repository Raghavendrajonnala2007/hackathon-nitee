import * as React from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getEnv } from '@/env'
import { getSupabase } from '@/lib/supabase'
import { fetchProfile, type ProfileRow } from '@/services/profile-service'

interface AuthState {
  session: Session | null
  user: User | null
  profile: ProfileRow | null
  loading: boolean
  profileLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = React.createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null)
  const [profile, setProfile] = React.useState<ProfileRow | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [profileLoading, setProfileLoading] = React.useState(false)

  const loadProfile = React.useCallback(async (userId: string) => {
    setProfileLoading(true)
    try {
      const p = await fetchProfile(userId)
      setProfile(p)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  React.useEffect(() => {
    let mounted = true
    getEnv()
    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session ?? null)
      setLoading(false)
      if (data.session?.user) void loadProfile(data.session.user.id)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (next?.user) void loadProfile(next.user.id)
      else setProfile(null)
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signOut = React.useCallback(async () => {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  const refreshProfile = React.useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id)
  }, [loadProfile, session?.user])

  const value = React.useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      profileLoading,
      signOut,
      refreshProfile,
    }),
    [session, profile, loading, profileLoading, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
