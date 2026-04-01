import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProviders } from '@/app/providers'
import { AdminShell } from '@/components/layout/admin-shell'
import { AppShell } from '@/components/layout/app-shell'
import { PublicShell } from '@/components/layout/public-shell'
import { AdminRoute } from '@/components/routing/admin-route'
import { ProtectedRoute } from '@/components/routing/protected-route'
import { AboutPage } from '@/pages/public/about-page'
import { FeaturesPage } from '@/pages/public/features-page'
import { LandingPage } from '@/pages/public/landing-page'
import { PricingPage } from '@/pages/public/pricing-page'
import { LoginPage } from '@/pages/auth/login-page'
import { RegisterPage } from '@/pages/auth/register-page'
import { VerifyEmailPage } from '@/pages/auth/verify-email-page'
import { AuthCallbackPage } from '@/pages/auth/auth-callback-page'
import { UserDashboardPage } from '@/pages/app/user-dashboard-page'
import { MonitorPage } from '@/pages/app/monitor-page'
import { PreviewPage } from '@/pages/app/preview-page'
import { SettingsPage } from '@/pages/app/settings-page'
import { AdminDashboardPage } from '@/pages/admin/admin-dashboard-page'
import { AdminUserLogsPage } from '@/pages/admin/admin-user-logs-page'
import { AdminAnalyticsPage } from '@/pages/admin/admin-analytics-page'

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicShell />}>
            <Route index element={<LandingPage />} />
            <Route path="features" element={<FeaturesPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="verify-email" element={<VerifyEmailPage />} />
          </Route>
          <Route path="auth/callback" element={<AuthCallbackPage />} />

          <Route
            path="app"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboardPage />} />
            <Route path="monitor" element={<MonitorPage />} />
            <Route path="preview/:id" element={<PreviewPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminShell />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUserLogsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  )
}
