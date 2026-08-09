"use client"

import { useEffect, useState } from "react"
import { apiGet, apiPatch, apiPost, ApiError } from "@/lib/ppdb-client/client"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, PlusCircle, Shield, KeyRound } from "lucide-react"
import type { Profile } from "@/lib/types"
import { toast } from "sonner"

export default function SuperAdminAdminsPage() {
  const [loading, setLoading] = useState(true)
  const [createProcessing, setCreateProcessing] = useState(false)
  const [rowProcessingId, setRowProcessingId] = useState<string | null>(null)
  const [admins, setAdmins] = useState<Profile[]>([])
  const [createForm, setCreateForm] = useState({ full_name: "", email: "", password: "", confirmPassword: "" })
  const [passwordMap, setPasswordMap] = useState<Record<string, { password: string; confirmPassword: string }>>({})

  const loadData = async () => {
    try {
      const [adminRes] = await Promise.all([
        apiGet<{ data: Profile[] }>("/profiles?role=admin&limit=200"),
      ])
      const adminRows = adminRes.data ?? []
      setAdmins(adminRows)
      setPasswordMap(
        Object.fromEntries(
          adminRows.map((admin) => [
            admin.id,
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

  const handleCreateAdmin = async () => {
    if (!createForm.full_name || !createForm.email || !createForm.password) return
    if (createForm.password.length < 6) {
      toast.error("Password minimal 6 karakter.")
      return
    }
    if (createForm.password !== createForm.confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.")
      return
    }
    setCreateProcessing(true)

    try {
      await apiPost("/profiles/admins", {
        full_name: createForm.full_name,
        email: createForm.email,
        password: createForm.password,
      })
      toast.success("Akun admin berhasil dibuat.")
      setCreateForm({ full_name: "", email: "", password: "", confirmPassword: "" })
      await loadData()
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Terjadi kesalahan"
      toast.error(`Gagal membuat admin: ${msg}`)
    }
    setCreateProcessing(false)
  }

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
      toast.success("Password admin berhasil diperbarui.")
      setPasswordMap((prev) => ({
        ...prev,
        [id]: { password: "", confirmPassword: "" },
      }))
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Terjadi kesalahan"
      toast.error(`Gagal mereset password admin: ${msg}`)
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
          <h1 className="text-xl font-semibold text-foreground">Kelola Akun Admin</h1>
          <p className="text-sm text-muted-foreground">Tambah, ubah, dan nonaktifkan akun admin</p>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Tambah Admin</CardTitle>
            <CardDescription>Buat akun admin dengan nama lengkap, email, dan password</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="adminFullName">Username (Nama Lengkap)</Label>
              <Input
                id="adminFullName"
                value={createForm.full_name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, full_name: e.target.value }))}
                placeholder="Masukkan nama admin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="admin@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Password</Label>
              <Input
                id="adminPassword"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminConfirmPassword">Konfirmasi Password</Label>
              <Input
                id="adminConfirmPassword"
                type="password"
                value={createForm.confirmPassword}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Ulangi password"
              />
            </div>
            <Button className="gap-2 sm:col-span-2 sm:justify-self-end" onClick={handleCreateAdmin} disabled={createProcessing}>
              {createProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
              Buat Akun Admin
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Daftar Admin
            </CardTitle>
            <CardDescription>{admins.length} admin aktif</CardDescription>
          </CardHeader>
          <CardContent>
            {admins.length > 0 ? (
              <div className="space-y-4">
                {admins.map((admin) => (
                  <div key={admin.id} className="rounded-lg border p-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Username (Nama Lengkap)</Label>
                        <Input value={admin.full_name || "-"} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={admin.email} disabled />
                      </div>
                      <div />
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Password Baru</Label>
                        <Input
                          type="password"
                          value={passwordMap[admin.id]?.password || ""}
                          onChange={(e) =>
                            setPasswordMap((prev) => ({
                              ...prev,
                              [admin.id]: {
                                ...prev[admin.id],
                                password: e.target.value,
                              },
                            }))
                          }
                          disabled={rowProcessingId === admin.id}
                          placeholder="Minimal 6 karakter"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Konfirmasi Password</Label>
                        <Input
                          type="password"
                          value={passwordMap[admin.id]?.confirmPassword || ""}
                          onChange={(e) =>
                            setPasswordMap((prev) => ({
                              ...prev,
                              [admin.id]: {
                                ...prev[admin.id],
                                confirmPassword: e.target.value,
                              },
                            }))
                          }
                          disabled={rowProcessingId === admin.id}
                          placeholder="Ulangi password"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleResetPassword(admin.id)}
                        disabled={rowProcessingId === admin.id}
                      >
                        {rowProcessingId === admin.id ? (
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
              <p className="py-8 text-center text-muted-foreground">Belum ada akun admin</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
