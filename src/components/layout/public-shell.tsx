import { Link, NavLink, Outlet } from 'react-router-dom'
import { FlowSyncLogo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'

const nav = [
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
]

export function PublicShell() {
  const { session } = useAuth()
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight text-slate-50">
            <FlowSyncLogo size={36} />
            <span>FlowSync</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn('text-sm font-medium text-muted transition-colors hover:text-slate-100', isActive && 'text-primary')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {session ? (
              <Button asChild variant="secondary" size="sm">
                <Link to="/app/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">Start free</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border/60 py-10 text-center text-sm text-muted">
        <p>© {new Date().getFullYear()} FlowSync. Real-time crowd flow intelligence.</p>
      </footer>
    </div>
  )
}
