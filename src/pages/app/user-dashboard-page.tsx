import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { AlertTriangle, CreditCard, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/contexts/auth-context'
import {
  creditsRemaining,
  fetchAlerts,
  fetchReadingsLast7Days,
  fetchUsageEvents,
  fetchZones,
} from '@/services/dashboard-service'
import { formatCredits, formatPercent } from '@/lib/utils'

export function UserDashboardPage() {
  const { user, profile, profileLoading } = useAuth()

  const zonesQuery = useQuery({
    queryKey: ['zones', user?.id],
    queryFn: () => fetchZones(user!.id),
    enabled: !!user,
  })

  const readingsQuery = useQuery({
    queryKey: ['readings-7d', user?.id],
    queryFn: () => fetchReadingsLast7Days(user!.id),
    enabled: !!user,
  })

  const alertsQuery = useQuery({
    queryKey: ['alerts', user?.id],
    queryFn: () => fetchAlerts(user!.id, 20),
    enabled: !!user,
  })

  const usageQuery = useQuery({
    queryKey: ['usage', user?.id],
    queryFn: () => fetchUsageEvents(user!.id, 50),
    enabled: !!user,
  })

  if (profileLoading || !profile) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const remaining = creditsRemaining(profile)
  const usedPct =
    profile.monthly_credit_allowance > 0
      ? Math.min(100, (profile.credits_used_this_period / profile.monthly_credit_allowance) * 100)
      : 0

  const zoneNameById = new Map((zonesQuery.data ?? []).map((z) => [z.id, z.name]))

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operations overview</h1>
          <p className="mt-2 text-muted">
            Plan <Badge variant="outline">{profile.plan_tier}</Badge> · Period started{' '}
            {format(new Date(profile.period_start), 'MMM d, yyyy')}
          </p>
        </div>
        <Button asChild>
          <Link to="/app/monitor">Open real-time monitor</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits remaining</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCredits(remaining)}</div>
            <p className="text-xs text-muted">
              Used {formatCredits(profile.credits_used_this_period)} of {formatCredits(profile.monthly_credit_allowance)}
            </p>
            <Progress value={usedPct} className="mt-3" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active zones</CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{zonesQuery.data?.filter((z) => z.is_active).length ?? '—'}</div>
            <p className="text-xs text-muted">Configure names and sensors from the monitor view.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(alertsQuery.data ?? []).filter((a) => !a.acknowledged).length}
            </div>
            <p className="text-xs text-muted">Acknowledge from the alert log below.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zone status (7 days)</CardTitle>
          <CardDescription>Latest occupancy readings per capture.</CardDescription>
        </CardHeader>
        <CardContent>
          {readingsQuery.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (readingsQuery.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted">No readings yet. Send your first capture from the monitor.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {(readingsQuery.data ?? []).slice(0, 12).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(r.created_at), 'MMM d HH:mm')}
                    </TableCell>
                    <TableCell>{zoneNameById.get(r.zone_id) ?? r.zone_id}</TableCell>
                    <TableCell>
                      {r.occupancy_percent != null ? formatPercent(r.occupancy_percent) : '—'}
                    </TableCell>
                    <TableCell className="capitalize">{r.source_type}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link to={`/app/preview/${r.id}`}>Preview</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Credit usage</CardTitle>
            <CardDescription>Recent deductions from your monthly pool.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(usageQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted">No usage events recorded yet.</p>
            ) : (
              (usageQuery.data ?? []).slice(0, 8).map((u) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted">{format(new Date(u.created_at), 'MMM d HH:mm')}</span>
                  <span>
                    {u.credits_delta} credits · {u.event_type}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alert log</CardTitle>
            <CardDescription>Automated signals from your automation tier.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(alertsQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted">No alerts in the last window.</p>
            ) : (
              (alertsQuery.data ?? []).map((a) => (
                <div key={a.id} className="rounded-[var(--radius-flow)] border border-border/50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={a.severity === 'critical' ? 'destructive' : 'secondary'}>{a.severity}</Badge>
                    <span className="text-xs text-muted">{format(new Date(a.created_at), 'MMM d HH:mm')}</span>
                  </div>
                  <p className="mt-2 text-sm">{a.message}</p>
                  <Separator className="my-2 bg-border/40" />
                  <p className="text-xs text-muted">{a.acknowledged ? 'Acknowledged' : 'Outstanding'}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
