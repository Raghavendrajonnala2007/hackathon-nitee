import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useParams } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/auth-context'
import { fetchReadingById, fetchZones } from '@/services/dashboard-service'
import { formatPercent } from '@/lib/utils'

export function PreviewPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const zonesQuery = useQuery({
    queryKey: ['zones', user?.id],
    queryFn: () => fetchZones(user!.id),
    enabled: !!user,
  })

  const readingQuery = useQuery({
    queryKey: ['reading', id, user?.id],
    queryFn: () => fetchReadingById(id!, user!.id),
    enabled: !!user && !!id,
  })

  const zoneName =
    zonesQuery.data?.find((z) => z.id === readingQuery.data?.zone_id)?.name ?? readingQuery.data?.zone_id

  if (readingQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!readingQuery.data) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-muted">Reading not found or you do not have access.</p>
      </div>
    )
  }

  const r = readingQuery.data

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reading preview</h1>
        <p className="mt-2 text-muted">
          {format(new Date(r.created_at), 'PPpp')} ·{' '}
          <Badge variant="outline" className="capitalize">
            {r.source_type}
          </Badge>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{zoneName}</CardTitle>
          <CardDescription>AI pipeline outputs linked to this capture.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[var(--radius-flow)] border border-border/60 p-4">
              <p className="text-xs text-muted">Occupancy</p>
              <p className="text-2xl font-semibold">
                {r.occupancy_percent != null ? formatPercent(r.occupancy_percent) : '—'}
              </p>
            </div>
            <div className="rounded-[var(--radius-flow)] border border-border/60 p-4">
              <p className="text-xs text-muted">Density score</p>
              <p className="text-2xl font-semibold">{r.density_score != null ? r.density_score.toFixed(2) : '—'}</p>
            </div>
            <div className="rounded-[var(--radius-flow)] border border-border/60 p-4">
              <p className="text-xs text-muted">Confidence</p>
              <p className="text-2xl font-semibold">
                {r.confidence != null ? formatPercent(r.confidence * 100, 0) : '—'}
              </p>
            </div>
          </div>
          {r.ai_result_url && (
            <Button asChild variant="secondary">
              <a href={r.ai_result_url} target="_blank" rel="noreferrer">
                Open vendor result <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
