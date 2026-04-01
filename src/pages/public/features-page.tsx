import { Brain, Cloud, Gauge, LineChart, Lock, Workflow } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const items = [
  {
    icon: Workflow,
    title: 'n8n orchestration',
    body: 'Webhook ingestion, schema validation, AI vendor calls, Supabase inserts, and client responses in one traceable pipeline.',
  },
  {
    icon: Brain,
    title: 'Density intelligence',
    body: 'Plug in your preferred crowd analysis API—FlowSync stores structured occupancy, confidence, and lineage.',
  },
  {
    icon: Cloud,
    title: 'Temporary media',
    body: 'Images land in Cloudinary with short-lived presets—never treated as a permanent archive.',
  },
  {
    icon: Gauge,
    title: 'Quota aware',
    body: 'Credits align to your plan. Usage events explain every deduction for finance and capacity planning.',
  },
  {
    icon: LineChart,
    title: 'Seven-day history',
    body: 'Dashboards chart occupancy trends and alert history so teams can debrief incidents with evidence.',
  },
  {
    icon: Lock,
    title: 'Supabase RLS',
    body: 'Row-level security isolates tenants while admins retain observability for support and compliance.',
  },
]

export function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Purpose-built capabilities</h1>
        <p className="mt-4 text-lg text-muted">
          Every module exists to answer one question: where is congestion forming, and what should we do next?
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <item.icon className="h-8 w-8 text-primary" />
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
