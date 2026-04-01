import { z } from 'zod'

/** Client-side payload before optional Cloudinary upload */
export const sensorDataSchema = z.object({
  estimatedCount: z.number().int().min(0).max(1_000_000).optional(),
  flowRatePerMin: z.number().min(0).max(1_000_000).optional(),
  notes: z.string().max(2000).optional(),
})

export type SensorDataInput = z.infer<typeof sensorDataSchema>

export const zoneProcessRequestSchema = z
  .object({
    zoneId: z.string().uuid('Select a valid zone'),
    sourceType: z.enum(['image', 'sensor']),
    imageUrl: z.string().url().optional(),
    tempImagePublicId: z.string().min(1).max(512).optional(),
    sensorData: sensorDataSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.sourceType === 'image') {
      if (!data.imageUrl || !data.tempImagePublicId) {
        ctx.addIssue({
          code: 'custom',
          message: 'Image uploads require a temporary Cloudinary URL and public ID.',
          path: ['imageUrl'],
        })
      }
    }
    if (data.sourceType === 'sensor') {
      if (!data.sensorData || Object.keys(data.sensorData).length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Provide at least one sensor metric for sensor-based submissions.',
          path: ['sensorData'],
        })
      }
    }
  })

export type ZoneProcessRequest = z.infer<typeof zoneProcessRequestSchema>

export const n8nProcessResponseSchema = z.object({
  success: z.boolean(),
  readingId: z.string().uuid().optional(),
  resultUrl: z.string().url().optional(),
  occupancyPercent: z.number().min(0).max(100).optional(),
  densityScore: z.number().min(0).max(1).optional(),
  confidence: z.number().min(0).max(1).optional(),
  creditsCharged: z.number().int().optional(),
  error: z.string().optional(),
})

export type N8nProcessResponse = z.infer<typeof n8nProcessResponseSchema>
