import { createClient } from "@/lib/ppdb-client/server"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, FileText, UserCheck } from "lucide-react"
import type { Profile } from "@/lib/types"

export default async function SuperAdminDashboard() {
  const api = await createClient()

  let admins: Profile[] = []
  let totalSiswa = 0
  let totalLogs = 0

  try {
    const adminRes = await api.get<{ data: Profile[]; total: number }>("/profiles?role=admin&limit=5")
    admins = adminRes.data ?? []
  } catch { admins = [] }

  try {
    const siswaRes = await api.get<{ total: number }>("/profiles?role=siswa&limit=1")
    totalSiswa = siswaRes.total ?? 0
  } catch { totalSiswa = 0 }

  try {
    const logsRes = await api.get<{ total: number }>("/admin/logs?limit=1")
    totalLogs = logsRes.total ?? 0
  } catch { totalLogs = 0 }

  const stats = [
    { label: "Total Admin", value: admins.length, icon: Shield, color: "text-primary" },
    { label: "Total Siswa", value: totalSiswa, icon: Users, color: "text-success" },
    { label: "Total Log Aktivitas", value: totalLogs, icon: FileText, color: "text-accent" },
  ]

  return (
    <div className="flex flex-col">
      <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
        <SidebarTrigger />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard Super Admin</h1>
          <p className="text-sm text-muted-foreground">Kelola akun admin, akun siswa, dan audit aktivitas</p>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Admin Terbaru
            </CardTitle>
            <CardDescription>5 akun admin terbaru yang aktif di sistem</CardDescription>
          </CardHeader>
          <CardContent>
            {admins && admins.length > 0 ? (
              <div className="space-y-3">
                {admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{admin.full_name || "-"}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(admin.created_at).toLocaleDateString("id-ID")}
                    </p>
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
