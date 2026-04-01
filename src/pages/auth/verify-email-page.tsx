import { Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function VerifyEmailPage() {
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            We sent a confirmation link{email ? ` to ${email}` : ''}. Click the link to activate your FlowSync tenant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted">
            After verifying, you can sign in from the login page. If you do not see the email within a few minutes,
            check spam or request a new message from Supabase Auth settings.
          </p>
          <Button asChild variant="secondary" className="w-full">
            <Link to="/login">Return to login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
