# FlowSync deployment guide

End-to-end checklist for production: **Vercel (SPA)**, **Supabase (data + auth)**, **n8n Cloud (automation)**, **Cloudinary (temp media)**.

## 1. Supabase

1. Create a project and note the **Project URL** and **anon** key.
2. Run `supabase/migrations/001_flowsync_schema.sql` in the SQL editor.
3. **Authentication → URL configuration**: add site URL and redirect URLs:
   - `http://localhost:5173/auth/callback` (dev)
   - `https://<your-vercel-domain>/auth/callback` (prod)
4. Promote your first operator to admin (see README bootstrap SQL).
5. Optional: enable **Realtime** for `zone_readings` and run:
   `alter publication supabase_realtime add table public.zone_readings;`

## 2. Cloudinary

1. Create an **unsigned upload preset** limited to `image` resource type.
2. Restrict folder to `flowsync_temp` and configure **auto-delete** or short TTL via Cloudinary add-ons/rules.
3. Map `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` in Vercel.

## 3. n8n Cloud

1. Create a workflow per `docs/n8n-workflow.md`.
2. Store **Supabase service role** and **Cloudinary API secret** (if deleting temp assets) in n8n credentials.
3. Expose a single HTTPS webhook URL and set `VITE_N8N_WEBHOOK_URL` in Vercel.
4. Test with a signed-in user: the SPA sends `Authorization: Bearer <supabase access token>`.

## 4. Vercel

1. Import the repository.
2. Framework preset: **Vite**.
3. Environment variables: copy from `.env.example` (all `VITE_*` keys).
4. Deploy. The included `vercel.json` rewrites unknown paths to `index.html` for client-side routing.

## 5. Post-deploy validation

- Register → verify email → login.
- Create a zone, upload a test image or sensor payload.
- Confirm `zone_readings` rows appear in Supabase and the preview page renders.
- As admin, open `/admin` and verify directory + API analytics (after n8n writes `api_monitor_logs`).

## 6. Operations

- Rotate n8n and Supabase keys on a schedule; update Vercel envs when rotating anon key.
- Monitor Supabase **Auth** rate limits and n8n **execution** quotas.
- Review Cloudinary usage; tune preset to prevent public hotlink abuse.
