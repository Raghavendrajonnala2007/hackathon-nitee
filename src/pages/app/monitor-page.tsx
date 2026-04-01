import * as React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getSupabase } from '@/lib/supabase'
import { Loader2, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/auth-context'
import { getAppOrigin } from '@/env'
import { uploadTemporaryZoneImage } from '@/services/cloudinary-upload'
import { sendCrowdProcessingWebhook } from '@/services/crowd-webhook'
import { createZone, fetchZones } from '@/services/dashboard-service'
import { sensorDataSchema, zoneProcessRequestSchema } from '@/validations/crowd'

export function MonitorPage() {
  const { user, session, refreshProfile } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [newZoneName, setNewZoneName] = React.useState('')
  const [selectedZoneId, setSelectedZoneId] = React.useState<string>('')
  const [sensorCount, setSensorCount] = React.useState('')
  const [sensorFlow, setSensorFlow] = React.useState('')
  const [uploadPct, setUploadPct] = React.useState(0)

  const zonesQuery = useQuery({
    queryKey: ['zones', user?.id],
    queryFn: () => fetchZones(user!.id),
    enabled: !!user,
  })

  React.useEffect(() => {
    const first = zonesQuery.data?.[0]?.id
    if (first && !selectedZoneId) setSelectedZoneId(first)
  }, [zonesQuery.data, selectedZoneId])

  React.useEffect(() => {
    if (!user) return
    const supabase = getSupabase()
    const channel = supabase
      .channel(`readings-live-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'zone_readings', filter: `user_id=eq.${user.id}` },
        () => {
          toast.message('New zone reading captured')
          void queryClient.invalidateQueries({ queryKey: ['readings-7d', user.id] })
        },
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [user, queryClient])

  const createZoneMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not signed in')
      const name = newZoneName.trim()
      if (!name) throw new Error('Zone name required')
      return createZone({ userId: user.id, name })
    },
    onSuccess: async (z) => {
      toast.success('Zone created')
      setNewZoneName('')
      setSelectedZoneId(z.id)
      await queryClient.invalidateQueries({ queryKey: ['zones', user?.id] })
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Unable to create zone'),
  })

  const processMutation = useMutation({
    mutationFn: async (input: { source: 'image' | 'sensor'; file?: File }) => {
      if (!user || !session?.access_token) throw new Error('Session expired')
      if (!selectedZoneId) throw new Error('Select a zone')

      if (input.source === 'image') {
        if (!input.file) throw new Error('Choose an image')
        setUploadPct(15)
        const uploaded = await uploadTemporaryZoneImage(input.file)
        setUploadPct(55)
        const body = zoneProcessRequestSchema.parse({
          zoneId: selectedZoneId,
          sourceType: 'image',
          imageUrl: uploaded.secure_url,
          tempImagePublicId: uploaded.public_id,
        })
        setUploadPct(85)
        const res = await sendCrowdProcessingWebhook({
          ...body,
          accessToken: session.access_token,
          appOrigin: getAppOrigin(),
        })
        setUploadPct(100)
        return res
      }

      const sensorData = sensorDataSchema.parse({
        estimatedCount: sensorCount ? Number(sensorCount) : undefined,
        flowRatePerMin: sensorFlow ? Number(sensorFlow) : undefined,
      })
      const body = zoneProcessRequestSchema.parse({
        zoneId: selectedZoneId,
        sourceType: 'sensor',
        sensorData,
      })
      return sendCrowdProcessingWebhook({
        ...body,
        accessToken: session.access_token,
        appOrigin: getAppOrigin(),
      })
    },
    onSuccess: async (res) => {
      toast.success('Processing complete')
      await refreshProfile()
      await queryClient.invalidateQueries({ queryKey: ['readings-7d', user?.id] })
      await queryClient.invalidateQueries({ queryKey: ['usage', user?.id] })
      if (res.readingId) {
        navigate(`/app/preview/${res.readingId}`)
      } else if (res.resultUrl) {
        window.open(res.resultUrl, '_blank', 'noopener,noreferrer')
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Processing failed'),
    onSettled: () => setUploadPct(0),
  })

  const fileRef = React.useRef<HTMLInputElement>(null)

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Real-time monitor</h1>
        <p className="mt-2 text-muted">
          Upload a temporary frame or stream structured sensor metrics. Payloads are validated client-side, then processed
          by your n8n workflow and AI vendor.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zones</CardTitle>
          <CardDescription>Each zone maps to a physical area you are monitoring.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <Label>Active zone</Label>
              <Select value={selectedZoneId} onValueChange={setSelectedZoneId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a zone" />
                </SelectTrigger>
                <SelectContent>
                  {(zonesQuery.data ?? []).map((z) => (
                    <SelectItem key={z.id} value={z.id}>
                      {z.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-1 flex-col gap-2 md:flex-row">
              <Input
                placeholder="New zone name"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
              />
              <Button type="button" variant="secondary" onClick={() => createZoneMutation.mutate()} disabled={!newZoneName.trim()}>
                Add zone
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingest telemetry</CardTitle>
          <CardDescription>Images use Cloudinary temporary storage only. Nothing is persisted in FlowSync storage.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="image">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="sensor">Sensor</TabsTrigger>
            </TabsList>
            <TabsContent value="image" className="space-y-4 pt-4">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void processMutation.mutateAsync({ source: 'image', file })
                }}
              />
              {uploadPct > 0 && <Progress value={uploadPct} />}
              <Button
                type="button"
                className="w-full gap-2"
                disabled={!selectedZoneId || processMutation.isPending}
                onClick={() => fileRef.current?.click()}
              >
                {processMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                Upload frame
              </Button>
            </TabsContent>
            <TabsContent value="sensor" className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="count">Estimated count (optional)</Label>
                  <Input
                    id="count"
                    inputMode="numeric"
                    value={sensorCount}
                    onChange={(e) => setSensorCount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flow">Flow rate / min (optional)</Label>
                  <Input
                    id="flow"
                    inputMode="decimal"
                    value={sensorFlow}
                    onChange={(e) => setSensorFlow(e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="button"
                className="w-full"
                disabled={!selectedZoneId || processMutation.isPending}
                onClick={() => processMutation.mutate({ source: 'sensor' })}
              >
                {processMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit sensor batch'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
