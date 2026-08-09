import { createClient } from "@/lib/ppdb-client/server"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Search, Eye } from "lucide-react"
import { STATUS_LABELS, MAJOR_OPTIONS, type Student } from "@/lib/types"
import { getActiveAcademicYear, getWaveByRegistrationDate, parseAcademicYears } from "@/lib/academic-year"

export default async function PendaftarPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const params = await searchParams
  const api = await createClient()

  // Bangun query string
  const qs = new URLSearchParams({ limit: "200" })
  if (params.search) qs.set("search", params.search)
  if (params.status) qs.set("status", params.status)

  let students: Student[] = []
  let academicYearValue: string | null = null

  try {
    const res = await api.get<{ data: Student[] }>(`/students?${qs.toString()}`)
    students = res.data ?? []
  } catch { students = [] }

  try {
    const setting = await api.get<{ value: string }>("/settings/key/academic_year_config")
    academicYearValue = setting.value ?? null
  } catch { academicYearValue = null }

  const activeYear = getActiveAcademicYear(parseAcademicYears(academicYearValue))

  const getMajorLabel = (value: string | null) => {
    if (!value) return "-"
    return MAJOR_OPTIONS.find((m) => m.value === value)?.label || value
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { variant: "outline" },
      submitted: { variant: "secondary" },
      verified: { variant: "default" },
      interview_scheduled: { variant: "default" },
      accepted: { variant: "default" },
      rejected: { variant: "destructive" },
    }
    return (
      <Badge variant={statusConfig[status]?.variant || "outline"}>
        {STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}
      </Badge>
    )
  }

  return (
    <div className="flex flex-col">

      <header className="flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
        <SidebarTrigger />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Data Pendaftar</h1>
          <p className="text-sm text-muted-foreground">Kelola data calon siswa baru</p>
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Cari nama siswa..."
                  defaultValue={params.search}
                  className="pl-9"
                />
              </div>
              <select
                name="status"
                defaultValue={params.status}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm sm:w-auto"
              >
                <option value="">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Menunggu Verifikasi</option>
                <option value="verified">Terverifikasi</option>
                <option value="interview_scheduled">Jadwal Wawancara</option>
                <option value="accepted">Diterima</option>
                <option value="rejected">Ditolak</option>
              </select>
              <Button type="submit" className="w-full sm:w-auto">Filter</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Pendaftar ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {students && students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Nama</th>
                      <th className="pb-3 font-medium">NISN</th>
                      <th className="pb-3 font-medium">Jurusan</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Gelombang</th>
                      <th className="pb-3 font-medium">Tanggal Daftar</th>
                      <th className="pb-3 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map((student: Student) => {
                      const wave = getWaveByRegistrationDate(student.submitted_at || student.created_at, activeYear)
                      return (
                        <tr key={student.id}>
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{student.full_name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </td>
                        <td className="py-3 text-sm">{student.nisn || "-"}</td>
                        <td className="py-3 text-sm">
                          <p>{getMajorLabel(student.first_choice)}</p>
                        </td>
                        <td className="py-3">{getStatusBadge(student.registration_status)}</td>
                        <td className="py-3 text-sm">
                          {wave ? (
                            <Badge variant="outline">{wave.label}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Di luar jadwal</span>
                          )}
                        </td>
                        <td className="py-3 text-sm">
                          {new Date(student.created_at).toLocaleDateString("id-ID")}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Link href={`/admin/pendaftar/${student.id}`}>
                              <Button variant="outline" size="sm" className="gap-1">
                                <Eye className="h-4 w-4" />
                                Detail
                              </Button>
                            </Link>
                          </div>
                        </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                {params.search || params.status
                  ? "Tidak ada pendaftar yang sesuai filter"
                  : "Belum ada pendaftar"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
