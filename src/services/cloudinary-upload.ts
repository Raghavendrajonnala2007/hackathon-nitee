import { getEnv } from '@/env'

export interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
  width: number
  height: number
  format: string
}

const cloudinaryResponseSchema = {
  parse(data: unknown): CloudinaryUploadResult {
    if (!data || typeof data !== 'object') throw new Error('Invalid Cloudinary response')
    const o = data as Record<string, unknown>
    const secure_url = o.secure_url
    const public_id = o.public_id
    if (typeof secure_url !== 'string' || typeof public_id !== 'string') {
      throw new Error('Cloudinary response missing secure_url or public_id')
    }
    return {
      secure_url,
      public_id,
      width: typeof o.width === 'number' ? o.width : 0,
      height: typeof o.height === 'number' ? o.height : 0,
      format: typeof o.format === 'string' ? o.format : 'unknown',
    }
  },
}

/**
 * Uploads a single image to Cloudinary using an unsigned upload preset (temporary folder).
 * Configure the preset to use a short TTL / auto-delete policy in Cloudinary.
 */
export async function uploadTemporaryZoneImage(file: File): Promise<CloudinaryUploadResult> {
  const env = getEnv()
  const endpoint = `https://api.cloudinary.com/v1_1/${env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`
  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', env.VITE_CLOUDINARY_UPLOAD_PRESET)
  body.append('folder', 'flowsync_temp')

  const res = await fetch(endpoint, { method: 'POST', body })
  const json: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    const err = json && typeof json === 'object' && 'error' in json ? String((json as { error: unknown }).error) : res.statusText
    throw new Error(`Cloudinary upload failed: ${err}`)
  }
  return cloudinaryResponseSchema.parse(json)
}
