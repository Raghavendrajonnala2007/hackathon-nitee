import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(20),
  VITE_N8N_WEBHOOK_URL: z.string().url(),
  VITE_CLOUDINARY_CLOUD_NAME: z.string().min(1),
  VITE_CLOUDINARY_UPLOAD_PRESET: z.string().min(1),
})

export type Env = z.infer<typeof envSchema>

function readEnv(): Env {
  const raw = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_N8N_WEBHOOK_URL: import.meta.env.VITE_N8N_WEBHOOK_URL,
    VITE_CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    VITE_CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  }

  const parsed = envSchema.safeParse(raw)

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ')

    throw new Error(
      `FlowSync: invalid environment configuration. ${issues}`
    )
  }

  return parsed.data
}

let cached: Env | null = null

export function getEnv(): Env {
  if (!cached) cached = readEnv()
  return cached
}

export function getAppOrigin(): string {
  const v = import.meta.env.VITE_APP_URL

  if (typeof v === 'string' && v.length > 0) {
    try {
      return new URL(v).origin
    } catch {
      return window.location.origin
    }
  }

  return window.location.origin
}