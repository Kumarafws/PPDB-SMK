import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"
import { getActiveAcademicYear, getWaveByRegistrationDate, parseAcademicYears } from "@/lib/academic-year"
import { createClient } from "@/lib/ppdb-client/server"
import { MAJOR_OPTIONS, type Student } from "@/lib/types"
import { SelectionResultsPdfClient } from "@/components/admin/selection-results-pdf-client"

const ACADEMIC_YEAR_SETTING_KEY = "academic_year_config"

export default async function HasilSeleksiPage() {
  const api = await createClient()

  let students: Student[] = []
  let academicYearValue: string | null = null

  try {
    const res = await api.get<{ data: Student[] }>(
      "/students?status=accepted,rejected&limit=200"
    )
    students = (res.data ?? []).sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
  } catch { students = [] }

  try {
    const settingRes = await api.get<{ value: string }>(
      `/settings/key/${ACADEMIC_YEAR_SETTING_KEY}`
    )
    academicYearValue = settingRes.value ?? null
  } catch { academicYearValue = null }

  const acceptedStudents = students.filter((s: Student) => s.registration_status === "accepted")
  const rejectedStudents = students.filter((s: Student) => s.registration_status === "rejected")
  const getMajorLabel = (value: string | null) => {
    if (!value) return "-"
    return MAJOR_OPTIONS.find((m) => m.value === value)?.label || value
  }

  const activeAcademicYear = getActiveAcademicYear(parseAcademicYears(academicYearValue))

  const getWaveLabel = (dateIso: string | null) => {
    const wave = getWaveByRegistrationDate(dateIso, activeAcademicYear)
    return wave?.label || "-"
  }

  const acceptedPdfData = acceptedStudents.map((student: Student) => ({
    id: student.id,
    full_name: student.full_name,
    email: student.email,
    major_label: getMajorLabel(student.accepted_major || student.first_choice),
    selection_notes: student.selection_notes,
    wave_label: getWaveLabel(student.submitted_at || student.created_at),
  }))

  const rejectedPdfData = rejectedStudents.map((student: Student) => ({
    id: student.id,
    full_name: student.full_name,
    email: student.email,
    major_label: getMajorLabel(student.first_choice),
    selection_notes: student.selection_notes,
    wave_label: getWaveLabel(student.submitted_at || student.created_at),
  }))

  return (
    <div className="flex flex-col">
      <header className="flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
        <SidebarTrigger />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Hasil Seleksi</h1>
          <p className="text-sm text-muted-foreground">Daftar siswa diterima dan ditolak</p>
        </div>
        <div className="ml-auto">
          <SelectionResultsPdfClient acceptedStudents={acceptedPdfData} rejectedStudents={rejectedPdfData} />
        </div>
      </header>

      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Siswa Diterima
            </CardTitle>
            <CardDescription>Total: {acceptedStudents.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Nama</th>
                    <th className="pb-3 font-medium">Jurusan</th>
                    <th className="pb-3 font-medium">Catatan</th>
                    <th className="pb-3 font-medium">Gelombang</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {acceptedStudents.length > 0 ? (
                    acceptedStudents.map((student: Student) => (
                      <tr key={student.id}>
                        <td className="py-3">
                          <p className="font-medium">{student.full_name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </td>
                        <td className="py-3 text-sm text-success">
                          {getMajorLabel(student.accepted_major || student.first_choice)}
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {student.selection_notes || "-"}
                        </td>
                        <td className="py-3">
                          <p className="text-sm">{getWaveLabel(student.submitted_at || student.created_at)}</p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        Belum ada siswa yang diterima.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Siswa Ditolak
            </CardTitle>
            <CardDescription>Total: {rejectedStudents.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Nama</th>
                    <th className="pb-3 font-medium">Jurusan</th>
                    <th className="pb-3 font-medium">Catatan</th>
                    <th className="pb-3 font-medium">Gelombang</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rejectedStudents.length > 0 ? (
                    rejectedStudents.map((student: Student) => (
                      <tr key={student.id}>
                        <td className="py-3">
                          <p className="font-medium">{student.full_name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </td>
                        <td className="py-3 text-sm">{getMajorLabel(student.first_choice)}</td>
                        <td className="py-3 text-sm text-muted-foreground">{student.selection_notes || "-"}</td>
                        <td className="py-3">
                          <p className="text-sm">{getWaveLabel(student.submitted_at || student.created_at)}</p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        Belum ada siswa yang ditolak.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

