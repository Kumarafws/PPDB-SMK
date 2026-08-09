"use client"

import { useEffect, useState } from "react"
import { apiGet, apiPatch, ApiError } from "@/lib/ppdb-client/client"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Users, KeyRound } from "lucide-react"
import type { Profile } from "@/lib/types"
import { toast } from "sonner"

export default function SuperAdminSiswaPage() {
  const [loading, setLoading] = useState(true)
  const [rowProcessingId, setRowProcessingId] = useState<string | null>(null)
  const [siswaProfiles, setSiswaProfiles] = useState<Profile[]>([])
  const [passwordMap, setPasswordMap] = useState<Record<string, { password: string; confirmPassword: string }>>({})

  const loadData = async () => {
    try {
      const res = await apiGet<{ data: Profile[] }>("/profiles?role=siswa&limit=200")
      const data = res.data ?? []
      setSiswaProfiles(data)
      setPasswordMap(
        Object.fromEntries(
          data.map((profile) => [
            profile.id,
            { password: "", confirmPassword: "" },
          ])
        )
      )
    } catch (err) {
      console.error("loadData error:", err)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleResetPassword = async (id: string) => {
    const payload = passwordMap[id]
    if (!payload?.password) {
      toast.error("Password baru wajib diisi.")
      return
    }
    if (payload.password.length < 6) {
      toast.error("Password minimal 6 karakter.")
      return
    }
    if (payload.password !== payload.confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.")
      return
    }
    setRowProcessingId(id)
    try {
      await apiPatch(`/profiles/${id}/password`, { password: payload.password })
      toast.success("Password siswa berhasil diperbarui.")
      setPasswordMap((prev) => ({
        ...prev,
        [id]: { password: "", confirmPassword: "" },
      }))
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Terjadi kesalahan"
      toast.error(`Gagal mereset password siswa: ${msg}`)
    }
    setRowProcessingId(null)
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
      <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
        <SidebarTrigger />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Kelola Akun Siswa</h1>
          <p className="text-sm text-muted-foreground">Lihat, edit, dan hapus akun siswa</p>
        </div>
      </header>

      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Daftar Siswa
            </CardTitle>
            <CardDescription>{siswaProfiles.length} akun siswa terdaftar (hanya reset password)</CardDescription>
          </CardHeader>
          <CardContent>
            {siswaProfiles.length > 0 ? (
              <div className="space-y-4">
                {siswaProfiles.map((profile) => (
                  <div key={profile.id} className="rounded-lg border p-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Nama</Label>
                        <Input value={profile.full_name || "-"} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={profile.email} disabled />
                      </div>
                      <div />
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Password Baru</Label>
                        <Input
                          type="password"
                          value={passwordMap[profile.id]?.password || ""}
                          onChange={(e) =>
                            setPasswordMap((prev) => ({
                              ...prev,
                              [profile.id]: {
                                ...prev[profile.id],
                                password: e.target.value,
                              },
                            }))
                          }
                          disabled={rowProcessingId === profile.id}
                          placeholder="Minimal 6 karakter"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Konfirmasi Password</Label>
                        <Input
                          type="password"
                          value={passwordMap[profile.id]?.confirmPassword || ""}
                          onChange={(e) =>
                            setPasswordMap((prev) => ({
                              ...prev,
                              [profile.id]: {
                                ...prev[profile.id],
                                confirmPassword: e.target.value,
                              },
                            }))
                          }
                          disabled={rowProcessingId === profile.id}
                          placeholder="Ulangi password"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleResetPassword(profile.id)}
                        disabled={rowProcessingId === profile.id}
                      >
                        {rowProcessingId === profile.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <KeyRound className="h-4 w-4" />
                        )}
                        Reset Password
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">Belum ada akun siswa</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
