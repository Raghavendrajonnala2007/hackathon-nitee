import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { Skeleton } from '@/components/ui/skeleton'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { session, profile, loading, profileLoading } = useAuth()

  if (loading || (session && profileLoading)) {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-8">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/app/dashboard" replace />
  }

  return <>{children}</>
}
