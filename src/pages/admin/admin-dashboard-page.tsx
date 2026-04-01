import { useQuery } from '@tanstack/react-query'
import { Users, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchAllProfiles, fetchApiMonitorLogs } from '@/services/admin-service'

export function AdminDashboardPage() {
  const profilesQuery = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: fetchAllProfiles,
  })

  const logsQuery = useQuery({
    queryKey: ['admin-api-logs'],
    queryFn: () => fetchApiMonitorLogs(100),
  })

  const totalUsers = profilesQuery.data?.length ?? 0
  const admins = profilesQuery.data?.filter((p) => p.role === 'admin').length ?? 0
  const errorLogs = logsQuery.data?.filter((l) => l.status_code >= 400).length ?? 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin overview</h1>
        <p className="mt-2 text-muted">Operational snapshot across tenants and automation health.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Directory</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {profilesQuery.isLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted">{admins} administrators</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API monitoring</CardTitle>
            <Activity className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            {logsQuery.isLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold">{logsQuery.data?.length ?? 0}</div>
                <p className="text-xs text-muted">{errorLogs} elevated responses (4xx/5xx)</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest accounts</CardTitle>
          <CardDescription>Newest profiles for support follow-up.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {profilesQuery.isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            (profilesQuery.data ?? []).slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-[var(--radius-flow)] border border-border/50 px-3 py-2">
                <span>{p.email ?? p.id}</span>
                <span className="text-muted">{p.plan_tier}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
