import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getSupabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  React.useEffect(() => {
    let mounted = true
    getSupabase()
      .auth.getSession()
      .then(({ data, error }) => {
        if (!mounted) return
        if (error) {
          toast.error(error.message)
          navigate('/login', { replace: true })
          return
        }
        if (data.session) {
          toast.success('Email verified')
          navigate('/app/dashboard', { replace: true })
        } else {
          navigate('/login', { replace: true })
        }
      })
    return () => {
      mounted = false
    }
  }, [navigate])

  return (
    <div className="mx-auto max-w-md space-y-4 p-8">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <p className="text-center text-sm text-muted">Completing sign-in…</p>
    </div>
  )
}
