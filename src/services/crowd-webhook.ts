import { getEnv } from '@/env'
import type { ZoneProcessRequest } from '@/validations/crowd'
import { n8nProcessResponseSchema, type N8nProcessResponse } from '@/validations/crowd'

export interface CrowdWebhookPayload extends ZoneProcessRequest {
  /** Supabase access token for n8n to validate the user before calling AI + Supabase */
  accessToken: string
  /** Canonical app origin for result links */
  appOrigin: string
}

/**
 * Sends validated zone data to the n8n webhook. n8n validates the JWT, calls the AI API,
 * inserts rows via Supabase service role, and returns structured JSON.
 */
export async function sendCrowdProcessingWebhook(
  payload: CrowdWebhookPayload,
): Promise<N8nProcessResponse> {
  const env = getEnv()
  const res = await fetch(env.VITE_N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${payload.accessToken}`,
    },
    body: JSON.stringify(payload),
  })

  const text = await res.text()
  let json: unknown
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    throw new Error('n8n webhook returned non-JSON response')
  }

  if (!res.ok) {
    const parsed = n8nProcessResponseSchema.safeParse(json)
    if (parsed.success && parsed.data.error) {
      throw new Error(parsed.data.error)
    }
    throw new Error(`n8n webhook error (${res.status}): ${text.slice(0, 500)}`)
  }

  const parsed = n8nProcessResponseSchema.safeParse(json)
  if (!parsed.success) {
    throw new Error('n8n response did not match expected schema')
  }
  if (!parsed.data.success) {
    throw new Error(parsed.data.error ?? 'Processing failed')
  }
  return parsed.data
}
