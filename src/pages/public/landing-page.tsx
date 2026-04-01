import { Link } from 'react-router-dom'
import { ArrowRight, Radio, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="secondary" className="mb-4">
          AI-powered crowd flow
        </Badge>
        <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
          Keep every zone safe with{' '}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">FlowSync</span>
        </h1>
        <p className="mt-6 text-pretty text-lg text-muted sm:text-xl">
          Real-time, zone-wise crowd intelligence for stadiums, transit hubs, and mass gatherings. Upload sensor data
          or temporary camera frames—FlowSync routes analysis through secure automation and surfaces occupancy instantly.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/register">
              Start monitoring <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link to="/pricing">View pricing</Link>
          </Button>
        </div>
      </div>

      <div className="mt-20 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 text-primary" />
            <CardTitle>Automation-first</CardTitle>
            <CardDescription>
              n8n orchestrates validation, AI density scoring, and database writes—no bespoke servers to maintain.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Radio className="h-8 w-8 text-secondary" />
            <CardTitle>Zone telemetry</CardTitle>
            <CardDescription>
              Model each area independently. Track flow trends for seven days and receive alerts when thresholds breach.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-primary" />
            <CardTitle>Enterprise security</CardTitle>
            <CardDescription>
              Supabase Auth with RLS, temporary Cloudinary storage, and auditable usage events for compliance teams.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-20 rounded-[var(--radius-flow)] border border-border/60 bg-card/30 p-8 text-center backdrop-blur-md">
        <h2 className="text-2xl font-semibold text-slate-50">Built for operators who cannot afford blind spots</h2>
        <p className="mt-3 text-muted">
          FlowSync focuses strictly on crowd flow—no social feeds, no permanent media vaults, no distractions.
        </p>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link to="/features">Explore the full feature set</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
