import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fetchApiMonitorLogs } from '@/services/admin-service'

export function AdminAnalyticsPage() {
  const logsQuery = useQuery({
    queryKey: ['admin-api-logs-full'],
    queryFn: () => fetchApiMonitorLogs(500),
  })

  const data = logsQuery.data ?? []
  const avgLatency = data.length ? Math.round(data.reduce((s, l) => s + l.latency_ms, 0) / data.length) : 0
  const p95 = (() => {
    if (!data.length) return 0
    const sorted = [...data].map((l) => l.latency_ms).sort((a, b) => a - b)
    const idx = Math.floor(0.95 * (sorted.length - 1))
    return sorted[idx] ?? 0
  })()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API monitoring</h1>
        <p className="mt-2 text-muted">
          Surface area for webhook and AI vendor latency. Populate via n8n HTTP response logging (see deployment guide).
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Latency</CardTitle>
            <CardDescription>Based on the latest {data.length} captured events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Average: <span className="font-semibold text-primary">{avgLatency} ms</span>
            </p>
            <p>
              p95: <span className="font-semibold text-secondary">{p95} ms</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status mix</CardTitle>
            <CardDescription>Helps catch failing AI or Supabase inserts early.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted">
            {data.length === 0 ? (
              <p>No api_monitor_logs rows yet. Wire n8n to insert after each webhook execution.</p>
            ) : (
              <ul className="space-y-1">
                {Object.entries(
                  data.reduce<Record<string, number>>((acc, l) => {
                    const k = String(l.status_code)
                    acc[k] = (acc[k] ?? 0) + 1
                    return acc
                  }, {}),
                ).map(([code, count]) => (
                  <li key={code}>
                    HTTP {code}: {count}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent requests</CardTitle>
          <CardDescription>Endpoint-level trail for support investigations.</CardDescription>
        </CardHeader>
        <CardContent>
          {logsQuery.isLoading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : data.length === 0 ? (
            <p className="text-sm text-muted">No data.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 40).map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="whitespace-nowrap">{format(new Date(l.created_at), 'MMM d HH:mm:ss')}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{l.endpoint}</TableCell>
                    <TableCell>{l.status_code}</TableCell>
                    <TableCell>{l.latency_ms} ms</TableCell>
                    <TableCell className="max-w-[240px] truncate text-xs text-muted">{l.error_message ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
