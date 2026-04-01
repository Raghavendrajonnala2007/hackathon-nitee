# FlowSync

AI-powered crowd management SaaS: **React (Vite) + TypeScript + Tailwind + ShadCN-style UI**, **Supabase Auth/Postgres**, **n8n Cloud** for orchestration, **Cloudinary** for temporary image uploads, and **Vercel** for hosting.

## Features

- **Public marketing**: Landing, Features, Pricing, About
- **Auth**: Email/password with Supabase; verify email flow; `/auth/callback` handler
- **User app**: Dashboard (7-day history, credits, alerts), Real-time Monitor (upload + sensor), Preview, Account settings
- **Admin**: Overview, user management, API analytics (from `api_monitor_logs`)
- **Design system**: Dark theme, `#0EA5FF` primary, `#22D3EE` secondary, `#020617` background, 14px radius, glassmorphism cards, skeletons, toasts, progress bars

## Prerequisites

- Node.js 20+
- Supabase project
- n8n Cloud workflow (see `docs/n8n-workflow.md`)
- Cloudinary account with an **unsigned upload preset** scoped to a `flowsync_temp/` folder and auto-expiration rules

## Local development

```bash
cp .env.example .env
# fill in Supabase, n8n webhook, Cloudinary values
npm install
npm run dev
```

The app validates environment variables at runtime (`src/env.ts`). Missing keys throw a clear error in the console.

## Database

Apply `supabase/migrations/001_flowsync_schema.sql` in the Supabase SQL editor. It creates:

- `profiles`, `zones`, `zone_readings`, `alerts`, `usage_events`, `api_monitor_logs`
- RLS policies, triggers for profile creation on signup, and safeguards for non-admin field updates

### Bootstrap admin

```sql
update public.profiles
set role = 'admin'
where email = 'you@company.com';
```

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for the full Vercel, Supabase, n8n, and Cloudinary checklist. Short version:

1. Connect the Git repository to Vercel.
2. Set **Environment Variables** to match `.env.example` (`VITE_*` only).
3. Build command: `npm run build` — output directory: `dist`.
4. Add Supabase **redirect URLs** for your production domain: `https://<domain>/auth/callback`.

Automation details: **[docs/n8n-workflow.md](docs/n8n-workflow.md)**.

## Security notes

- Frontend uses the **anon** key only.
- **Service role** credentials stay in n8n to insert readings, enforce quotas, and write monitor logs.
- Images are **temporary**; Cloudinary preset should delete or expire assets quickly.
- No permanent image storage in FlowSync.

## Project structure

```
src/
  app/            # Providers
  components/     # Layout, UI primitives, routing guards
  contexts/       # Auth
  pages/          # Route screens
  services/       # Supabase, Cloudinary, n8n webhook
  validations/    # Zod schemas
  types/          # Database types
```

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Vite dev server          |
| `npm run build`| Typecheck + production build |
| `npm run preview` | Serve production build locally |

## License

Proprietary — configure licensing for your organization.
