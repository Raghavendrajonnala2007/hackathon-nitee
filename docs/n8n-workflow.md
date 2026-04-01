# FlowSync n8n Cloud workflow

This document describes the automation chain that replaces a custom backend. Implement these steps in **n8n Cloud** and store **Supabase service role** credentials in n8n credentials (never in the frontend).

## High-level flow

1. **Webhook** — `POST /webhook/flowsync-process` accepts JSON from the FlowSync SPA.
2. **Validate JWT** — Call Supabase Auth `GET /auth/v1/user` with `{ Authorization: Bearer <access_token> }` to resolve `user_id`.
3. **Validate payload** — Ensure `zoneId` (UUID) belongs to the user (Supabase `zones` SELECT with service role).
4. **Quota check** — Read `profiles` for `monthly_credit_allowance` and `credits_used_this_period`. Abort with `402` if exhausted.
5. **AI request** — Call your crowd analysis vendor (e.g. Roboflow, custom vision API) with `imageUrl` or structured sensor metrics.
6. **Persist** — Insert into `zone_readings`, `usage_events`, optionally `alerts` if occupancy crosses thresholds, and increment `profiles.credits_used_this_period`.
7. **Monitor log** — Insert `api_monitor_logs` with `endpoint`, `status_code`, `latency_ms`, optional `error_message`.
8. **Respond** — Return JSON matching `n8nProcessResponseSchema` in the frontend (`src/validations/crowd.ts`).

## Example success response

```json
{
  "success": true,
  "readingId": "uuid-from-zone_readings",
  "resultUrl": "https://res.cloudinary.com/.../image/upload/v123/sample.jpg",
  "occupancyPercent": 72.4,
  "densityScore": 0.81,
  "confidence": 0.93,
  "creditsCharged": 1
}
```

## Example error response

```json
{
  "success": false,
  "error": "Monthly credit quota exceeded"
}
```

## Supabase nodes (service role)

Use the **Supabase** community node or HTTP Request with `apikey` + `Authorization: Bearer <service_role>`:

- `POST /rest/v1/zone_readings`
- `POST /rest/v1/usage_events`
- `PATCH /rest/v1/profiles?id=eq.<user>` (increment credits)
- `POST /rest/v1/api_monitor_logs`

## Optional: delete Cloudinary temp asset

After successful processing, call Cloudinary Admin API delete **from n8n** with API secret credentials to enforce ephemeral storage.

## Realtime

Run in Supabase SQL (once):

```sql
alter publication supabase_realtime add table public.zone_readings;
```

Enable the table in **Database → Replication** if your project uses the dashboard toggle.
