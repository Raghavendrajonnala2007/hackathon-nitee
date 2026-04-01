import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Why FlowSync exists</h1>
      <p className="mt-6 text-lg text-muted">
        High-density gatherings amplify risk when operators lack a shared, real-time picture of crowd movement. Legacy
        CCTV workflows are slow; spreadsheets are worse. FlowSync unifies temporary visual telemetry and structured
        sensor inputs behind a single automation fabric so safety teams can act while incidents are still preventable.
      </p>
      <div className="mt-10 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Principles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted">
            <p>
              <strong className="text-slate-100">Safety first:</strong> alerts and analytics exist to protect people, not
              to surveil individuals.
            </p>
            <p>
              <strong className="text-slate-100">Minimal retention:</strong> imagery is ephemeral; intelligence lives in
              structured readings and audit logs.
            </p>
            <p>
              <strong className="text-slate-100">Operator trust:</strong> transparent credit usage, exportable history,
              and admin-grade monitoring for enterprise procurement.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
