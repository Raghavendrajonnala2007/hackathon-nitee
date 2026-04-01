import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, MonitorPlay, Settings, LogOut, Shield } from 'lucide-react'
import { FlowSyncLogo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'

const userNav = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/monitor', label: 'Real-time Monitor', icon: MonitorPlay },
  { to: '/app/settings', label: 'Account', icon: Settings },
]

export function AppShell() {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-border/60 bg-card/30 p-4 backdrop-blur-md md:flex">
        <Link to="/app/dashboard" className="mb-8 flex items-center gap-2 px-2 font-semibold">
          <FlowSyncLogo size={32} />
          FlowSync
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {userNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-[var(--radius-flow)] px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-slate-100',
                  isActive && 'bg-primary/15 text-primary',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
          {profile?.role === 'admin' && (
            <>
              <Separator className="my-2 bg-border/60" />
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-[var(--radius-flow)] px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-white/5',
                    isActive && 'bg-secondary/15 text-secondary',
                  )
                }
              >
                <Shield className="h-4 w-4" />
                Admin
              </NavLink>
            </>
          )}
        </nav>
        <Button
          variant="outline"
          className="mt-auto justify-start gap-2"
          onClick={async () => {
            await signOut()
            navigate('/')
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center border-b border-border/60 px-4 md:hidden">
          <FlowSyncLogo size={28} />
          <span className="ml-2 font-semibold">FlowSync</span>
          <div className="ml-auto flex gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link to="/app/dashboard">Home</Link>
            </Button>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
