import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, FileText, LayoutDashboard, ArrowLeft, LogOut } from 'lucide-react'
import { FlowSyncLogo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'

const adminNav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/users', label: 'User logs', icon: FileText },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export function AdminShell() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 flex-col border-r border-border/60 bg-card/40 p-4 backdrop-blur-md md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <FlowSyncLogo size={28} />
          <span className="font-semibold">Admin</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-[var(--radius-flow)] px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-slate-100',
                  isActive && 'bg-secondary/15 text-secondary',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Button asChild variant="ghost" className="justify-start gap-2">
          <Link to="/app/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to app
          </Link>
        </Button>
        <Button
          variant="outline"
          className="mt-2 justify-start gap-2"
          onClick={async () => {
            await signOut()
            navigate('/')
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </aside>
      <div className="flex-1 p-4 md:p-8">
        <Outlet />
      </div>
    </div>
  )
}
