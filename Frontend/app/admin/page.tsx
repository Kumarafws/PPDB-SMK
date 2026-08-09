import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Users, FileCheck, Calendar, CheckCircle, XCircle, Clock } from "lucide-react"
import { createClient } from "@/lib/ppdb-client/server"
import { MAJOR_OPTIONS, type Student } from "@/lib/types"

export default async function AdminDashboard() {
  const api = await createClient()

  let allStudents: Student[] = []
  try {
    const res = await api.get<{ data: Student[]; meta: { total: number } }>(
      "/students?limit=100"
    )
    allStudents = res.data ?? []
  } catch {
    allStudents = []
  }

  const totalPendaftar = allStudents.length
  const pendaftarBaru = allStudents.filter((s) => s.registration_status === "submitted").length
  const sudahVerifikasi = allStudents.filter((s) => s.registration_status === "verified").length
  const jadwalWawancara = allStudents.filter((s) => s.registration_status === "interview_scheduled").length
  const diterima = allStudents.filter((s) => s.registration_status === "accepted").length
  const ditolak = allStudents.filter((s) => s.registration_status === "rejected").length

  const recentStudents = [...allStudents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const majorCounts = MAJOR_OPTIONS.map((m) => ({
    value: m.value,
    label: m.label,
    count: allStudents.filter((s) => s.first_choice === m.value).length,
  }))

  const stats = [

    { label: "Total Pendaftar", value: totalPendaftar || 0, icon: Users, color: "text-primary" },
    { label: "Menunggu Verifikasi", value: pendaftarBaru || 0, icon: Clock, color: "text-warning" },
    { label: "Sudah Verifikasi", value: sudahVerifikasi || 0, icon: FileCheck, color: "text-accent" },
    { label: "Jadwal Wawancara", value: jadwalWawancara || 0, icon: Calendar, color: "text-primary" },
    { label: "Diterima", value: diterima || 0, icon: CheckCircle, color: "text-success" },
    { label: "Ditolak", value: ditolak || 0, icon: XCircle, color: "text-destructive" },
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; class: string }> = {
      draft: { label: "Draft", class: "bg-muted text-muted-foreground" },
      submitted: { label: "Menunggu", class: "bg-warning/20 text-warning-foreground" },
      verified: { label: "Terverifikasi", class: "bg-primary/20 text-primary" },
      interview_scheduled: { label: "Wawancara", class: "bg-accent/20 text-accent-foreground" },
      accepted: { label: "Diterima", class: "bg-success/20 text-success" },
      rejected: { label: "Ditolak", class: "bg-destructive/20 text-destructive" },
    }
    const config = statusConfig[status] || statusConfig.draft
    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    )
  }

  const majorLabels: Record<string, string> = {
    tkj: "TKJ",
    rpl: "RPL",
    mm: "MM",
    akl: "AKL",
    otkp: "OTKP",
    bdp: "BDP",
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
        <SidebarTrigger />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Selamat datang di Panel Admin PPDB</p>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pendaftar per Jurusan</CardTitle>
            <CardDescription>Jumlah siswa berdasarkan jurusan yang dipilih</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {majorCounts.map((item) => (
                <div key={item.value} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  </div>
                  <p className="text-2xl font-bold">{item.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendaftaran Terbaru</CardTitle>
            <CardDescription>5 pendaftaran terakhir yang masuk</CardDescription>
          </CardHeader>
          <CardContent>
            {recentStudents && recentStudents.length > 0 ? (
              <div className="space-y-4">
                {recentStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{student.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {majorLabels[student.first_choice as string] || student.first_choice || "Belum dipilih"}{" "}
                        •{" "}
                        {new Date(student.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {getStatusBadge(student.registration_status)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                Belum ada pendaftaran
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
