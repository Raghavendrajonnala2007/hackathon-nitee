import * as React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fetchAllProfiles, updateProfileAdmin } from '@/services/admin-service'
import type { PlanTier, UserRole } from '@/types/database'
import { formatCredits } from '@/lib/utils'

export function AdminUserLogsPage() {
  const queryClient = useQueryClient()
  const profilesQuery = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: fetchAllProfiles,
  })

  const [editingId, setEditingId] = React.useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async ({
      userId,
      role,
      plan,
      allowance,
    }: {
      userId: string
      role: UserRole
      plan: PlanTier
      allowance: number
    }) => {
      await updateProfileAdmin(userId, {
        role,
        plan_tier: plan,
        monthly_credit_allowance: allowance,
      })
    },
    onSuccess: async () => {
      toast.success('Profile updated')
      setEditingId(null)
      await queryClient.invalidateQueries({ queryKey: ['admin-profiles'] })
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Update failed'),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User management</h1>
        <p className="mt-2 text-muted">Adjust entitlements and roles. Changes apply immediately via Supabase RLS.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>Full tenant listing with credit posture.</CardDescription>
        </CardHeader>
        <CardContent>
          {profilesQuery.isLoading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(profilesQuery.data ?? []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{p.email ?? '—'}</span>
                        <span className="text-xs text-muted">{p.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.plan_tier}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">{p.role}</TableCell>
                    <TableCell>
                      {formatCredits(p.credits_used_this_period)} / {formatCredits(p.monthly_credit_allowance)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="secondary" onClick={() => setEditingId(p.id)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editingId &&
        (() => {
          const editingProfile = (profilesQuery.data ?? []).find((x) => x.id === editingId)
          if (!editingProfile) return null
          return (
            <EditSheet
              profile={editingProfile}
              onClose={() => setEditingId(null)}
              onSave={(patch) => mutation.mutate({ userId: editingId, ...patch })}
              submitting={mutation.isPending}
            />
          )
        })()}
    </div>
  )
}

function EditSheet({
  profile,
  onClose,
  onSave,
  submitting,
}: {
  profile: NonNullable<Awaited<ReturnType<typeof fetchAllProfiles>>[number]>
  onClose: () => void
  onSave: (patch: { role: UserRole; plan: PlanTier; allowance: number }) => void
  submitting: boolean
}) {
  const [role, setRole] = React.useState<UserRole>(profile.role)
  const [plan, setPlan] = React.useState<PlanTier>(profile.plan_tier)
  const [allowance, setAllowance] = React.useState(String(profile.monthly_credit_allowance))

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle>Edit {profile.email}</CardTitle>
        <CardDescription>Privileged changes—confirm with your security policy.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-medium">Role</p>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">user</SelectItem>
                <SelectItem value="admin">admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Plan</p>
            <Select value={plan} onValueChange={(v) => setPlan(v as PlanTier)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">free</SelectItem>
                <SelectItem value="pro">pro</SelectItem>
                <SelectItem value="enterprise">enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Monthly allowance</p>
            <input
              className="flex h-10 w-full rounded-[var(--radius-flow)] border border-border bg-background/80 px-3 text-sm"
              value={allowance}
              onChange={(e) => setAllowance(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onSave({ role, plan, allowance: Number(allowance) })} disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
