"use client"

import { useEffect, useMemo, useState } from "react"
import { apiGet, apiPut } from "@/lib/ppdb-client/client"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, CalendarRange, CheckCircle2, Trash2 } from "lucide-react"
import type { AcademicWave, AcademicYear } from "@/lib/types"

const SETTING_KEY = "academic_year_config"

type WaveField = {
  type: AcademicWave["type"]
  label: string
}

const WAVE_FIELDS: WaveField[] = [
  { type: "peminatan", label: "Gelombang Peminatan" },
  { type: "umum_1", label: "Gelombang Umum 1" },
  { type: "umum_2", label: "Gelombang Umum 2" },
]

type FormWave = {
  start_at: string
  end_at: string
}

const defaultWaves = (): Record<AcademicWave["type"], FormWave> => ({
  peminatan: { start_at: "", end_at: "" },
  umum_1: { start_at: "", end_at: "" },
  umum_2: { start_at: "", end_at: "" },
})

function formatDateTime(value: string) {
  if (!value) return "-"
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function TahunAjaranPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settingId, setSettingId] = useState<string | null>(null)
  const [years, setYears] = useState<AcademicYear[]>([])
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [activateNow, setActivateNow] = useState(true)
  const [waves, setWaves] = useState<Record<AcademicWave["type"], FormWave>>(defaultWaves())

  const activeYear = useMemo(() => years.find((item) => item.is_active) || null, [years])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await apiGet<{ value: string }>("/settings/key/academic_year_config")
      const parsed = JSON.parse(res.value || "{}") as { years?: AcademicYear[] }
      const yearsData = Array.isArray(parsed.years) ? parsed.years : []
      yearsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setYears(yearsData)
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status !== 404) {
        setError("Gagal memuat data tahun ajaran.")
      }
    }
    setLoading(false)
  }

  const setWaveField = (wave: AcademicWave["type"], key: keyof FormWave, value: string) => {
    setWaves((prev) => ({
      ...prev,
      [wave]: {
        ...prev[wave],
        [key]: value,
      },
    }))
  }

  const validateWaves = (yearWaves: AcademicWave[]) => {
    for (const wave of yearWaves) {
      const startTime = new Date(wave.start_at).getTime()
      const endTime = new Date(wave.end_at).getTime()
      if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
        return "Semua jadwal gelombang harus diisi."
      }
      if (startTime >= endTime) {
        return `Periode ${wave.label} tidak valid. Tanggal mulai harus lebih awal dari tenggat.`
      }
    }

    for (let i = 1; i < yearWaves.length; i += 1) {
      const previousEnd = new Date(yearWaves[i - 1].end_at).getTime()
      const currentStart = new Date(yearWaves[i].start_at).getTime()
      if (currentStart < previousEnd) {
        return `${yearWaves[i].label} harus dibuka setelah ${yearWaves[i - 1].label} selesai.`
      }
    }

    return null
  }

  const persistYears = async (nextYears: AcademicYear[]) => {
    try {
      await apiPut(`/settings/key/${SETTING_KEY}`, {
        value: JSON.stringify({ years: nextYears }),
      })
      return null
    } catch (err) {
      return err
    }
  }

  const resetForm = () => {
    setName("")
    setActivateNow(true)
    setWaves(defaultWaves())
  }

  const handleCreateYear = async () => {
    setError(null)
    if (!name.trim()) {
      setError("Nama tahun ajaran wajib diisi.")
      return
    }

    const nowIso = new Date().toISOString()
    const newWaves: AcademicWave[] = WAVE_FIELDS.map((field) => ({
      type: field.type,
      label: field.label,
      start_at: waves[field.type].start_at,
      end_at: waves[field.type].end_at,
    }))

    const validationError = validateWaves(newWaves)
    if (validationError) {
      setError(validationError)
      return
    }

    const newItem: AcademicYear = {
      id: `ta-${Date.now()}`,
      name: name.trim(),
      is_active: activateNow || years.length === 0,
      waves: newWaves,
      created_at: nowIso,
      updated_at: nowIso,
    }

    const nextYears = [newItem, ...years].map((year) =>
      newItem.is_active ? { ...year, is_active: year.id === newItem.id } : year
    )

    setSaving(true)
    const persistError = await persistYears(nextYears)
    setSaving(false)

    if (persistError) {
      setError("Gagal menyimpan tahun ajaran. Periksa izin akses admin/superadmin.")
      return
    }

    setYears(nextYears)
    resetForm()
  }

  const handleSetActive = async (id: string) => {
    setError(null)
    const nextYears = years.map((year) => ({
      ...year,
      is_active: year.id === id,
      updated_at: year.id === id ? new Date().toISOString() : year.updated_at,
    }))

    setSaving(true)
    const persistError = await persistYears(nextYears)
    setSaving(false)

    if (persistError) {
      setError("Gagal mengubah tahun ajaran aktif.")
      return
    }

    setYears(nextYears)
  }

  const handleDeleteYear = async (id: string) => {
    setError(null)
    const nextYears = years.filter((year) => year.id !== id)

    setSaving(true)
    const persistError = await persistYears(nextYears)
    setSaving(false)

    if (persistError) {
      setError("Gagal menghapus tahun ajaran.")
      return
    }

    setYears(nextYears)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
        <SidebarTrigger />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Tahun Ajaran</h1>
          <p className="text-sm text-muted-foreground">
            Atur periode pendaftaran 3 gelombang secara berurutan
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-primary" />
              Buat Tahun Ajaran Baru
            </CardTitle>
            <CardDescription>
              Gelombang dibuka berurutan: Peminatan - Umum 1 - Umum 2
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="year-name">Nama Tahun Ajaran</Label>
              <Input
                id="year-name"
                placeholder="Contoh: 2026/2027"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {WAVE_FIELDS.map((field) => (
                <div key={field.type} className="space-y-3 rounded-lg border p-3">
                  <p className="font-medium">{field.label}</p>
                  <div className="space-y-2">
                    <Label htmlFor={`${field.type}-start`}>Mulai dibuka</Label>
                    <Input
                      id={`${field.type}-start`}
                      type="datetime-local"
                      value={waves[field.type].start_at}
                      onChange={(e) => setWaveField(field.type, "start_at", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${field.type}-end`}>Tenggat pendaftaran</Label>
                    <Input
                      id={`${field.type}-end`}
                      type="datetime-local"
                      value={waves[field.type].end_at}
                      onChange={(e) => setWaveField(field.type, "end_at", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="activate-year"
                checked={activateNow}
                onCheckedChange={(checked) => setActivateNow(Boolean(checked))}
              />
              <Label htmlFor="activate-year">Jadikan tahun ajaran aktif</Label>
            </div>

            {error && (
              <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button onClick={handleCreateYear} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Simpan Tahun Ajaran
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Tahun Ajaran</CardTitle>
            <CardDescription>
              {activeYear ? `Tahun ajaran aktif: ${activeYear.name}` : "Belum ada tahun ajaran aktif"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {years.length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">Belum ada data tahun ajaran.</p>
            ) : (
              <div className="space-y-4">
                {years.map((year) => (
                  <div key={year.id} className="rounded-lg border p-4">
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold">{year.name}</p>
                        {year.is_active ? (
                          <Badge className="bg-success/15 text-success">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="outline">Nonaktif</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!year.is_active && (
                          <Button variant="outline" size="sm" disabled={saving} onClick={() => handleSetActive(year.id)}>
                            Jadikan Aktif
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={saving}
                              title="Hapus tahun ajaran"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Tahun Ajaran?</AlertDialogTitle>
                              <AlertDialogDescription asChild>
                                <div className="space-y-2">
                                  <p>
                                    Anda akan menghapus tahun ajaran <strong>{year.name}</strong> beserta semua data gelombangnya.
                                    Tindakan ini tidak dapat dibatalkan.
                                  </p>
                                  {year.is_active && (
                                    <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                                      ⚠️ Ini adalah tahun ajaran yang sedang <strong>aktif</strong>. Menghapusnya akan membuat sistem tidak memiliki tahun ajaran aktif.
                                    </p>
                                  )}
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDeleteYear(year.id)}
                              >
                                Ya, Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                      {year.waves.map((wave) => (
                        <div key={wave.type} className="rounded-md border bg-muted/30 p-3">
                          <p className="font-medium text-foreground">{wave.label}</p>
                          <p>Mulai: {formatDateTime(wave.start_at)}</p>
                          <p>Tenggat: {formatDateTime(wave.end_at)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
