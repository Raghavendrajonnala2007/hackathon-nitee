import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/auth-context'
import { updateProfileSelf } from '@/services/profile-service'

export function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [fullName, setFullName] = React.useState(profile?.full_name ?? '')
  const [company, setCompany] = React.useState(profile?.company_name ?? '')
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    setFullName(profile?.full_name ?? '')
    setCompany(profile?.company_name ?? '')
  }, [profile?.full_name, profile?.company_name])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      await updateProfileSelf(user.id, {
        full_name: fullName.trim() || null,
        company_name: company.trim() || null,
      })
      await refreshProfile()
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account settings</h1>
        <p className="mt-2 text-muted">Profile fields sync to Supabase Auth metadata through the profiles table.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Visible to your team inside FlowSync.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email ?? user?.email ?? ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Organization</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <Separator className="bg-border/60" />
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
