import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Pilot single venues with essential monitoring.',
    credits: '100 credits / month',
    features: ['2 active zones', '7-day analytics', 'Email alerts', 'Community support'],
    cta: 'Create account',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$249',
    description: 'Operational teams running recurring events.',
    credits: '5,000 credits / month',
    features: [
      'Unlimited zones',
      'Priority n8n throughput',
      'Advanced alert routing',
      'Dedicated success manager',
    ],
    cta: 'Talk to sales',
    href: '/register',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Cities, mega-events, and regulated campuses.',
    credits: 'Custom SLA',
    features: ['Private AI endpoints', 'VPC peering option', '24/7 support', 'Custom integrations'],
    cta: 'Contact us',
    href: '/about',
    highlight: false,
  },
]

export function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Transparent, usage-based pricing</h1>
        <p className="mt-4 text-lg text-muted">
          Credits map to AI processing units. Upgrade when your footprint grows—no surprise overages without approval.
        </p>
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={tier.highlight ? 'border-primary/50 shadow-lg shadow-primary/10' : ''}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{tier.name}</CardTitle>
                {tier.highlight && <Badge>Popular</Badge>}
              </div>
              <CardDescription>{tier.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.price !== 'Custom' && <span className="text-muted"> / month</span>}
              </div>
              <p className="text-sm text-secondary">{tier.credits}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant={tier.highlight ? 'default' : 'secondary'}>
                <Link to={tier.href}>{tier.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
