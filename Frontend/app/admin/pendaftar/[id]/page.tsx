import { notFound } from "next/navigation"
import { createClient } from "@/lib/ppdb-client/server"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, FileText, CheckCircle, XCircle, Eye } from "lucide-react"
import { STATUS_LABELS, DOCUMENT_LABELS, MAJOR_OPTIONS, type Document, type Student } from "@/lib/types"
import { getActiveAcademicYear, getWaveByRegistrationDate, parseAcademicYears } from "@/lib/academic-year"

export default async function DetailPendaftarPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const api = await createClient()

  let student: Student | null = null
  let documents: Document[] = []
  let academicYearValue: string | null = null

  try {
    const res = await api.get<{ student: Student }>(`/students/${id}`)
    student = res.student
  } catch { student = null }

  if (!student) notFound()

  try {
    const docsRes = await api.get<{ documents: Document[] }>(`/students/${id}/documents`)
    documents = docsRes.documents ?? []
  } catch { documents = [] }

  try {
    const setting = await api.get<{ value: string }>("/settings/key/academic_year_config")
    academicYearValue = setting.value ?? null
  } catch { academicYearValue = null }

  const activeYear = getActiveAcademicYear(parseAcademicYears(academicYearValue))
  const registrationWave = getWaveByRegistrationDate(student.submitted_at || student.created_at, activeYear)

  const getMajorLabel = (value: string | null) => {
    if (!value) return "-"
    return MAJOR_OPTIONS.find((m) => m.value === value)?.label || value
  }

  const formatDate = (date: string | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
        <SidebarTrigger />
        <Link href="/admin/pendaftar">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-foreground">Detail Pendaftar</h1>
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Data Pribadi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                    <p className="font-medium">{student.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">NISN</p>
                    <p className="font-medium">{student.nisn || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">NIK</p>
                    <p className="font-medium">{student.nik || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tempat, Tanggal Lahir</p>
                    <p className="font-medium">
                      {student.birth_place || "-"}, {formatDate(student.birth_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Jenis Kelamin</p>
                    <p className="font-medium capitalize">{student.gender || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Agama</p>
                    <p className="font-medium">{student.religion || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">No. Telepon</p>
                    <p className="font-medium">{student.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{student.email || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alamat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {student.address || "-"}
                  {student.rt && student.rw && `, RT ${student.rt}/RW ${student.rw}`}
                </p>
                <p className="text-muted-foreground">
                  {[student.village, student.district, student.city, student.province]
                    .filter(Boolean)
                    .join(", ")}
                  {student.postal_code && ` ${student.postal_code}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Orang Tua</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold">Ayah</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Nama:</span> {student.father_name || "-"}</p>
                      <p><span className="text-muted-foreground">Pekerjaan:</span> {student.father_occupation || "-"}</p>
                      <p><span className="text-muted-foreground">Telepon:</span> {student.father_phone || "-"}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">Ibu</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Nama:</span> {student.mother_name || "-"}</p>
                      <p><span className="text-muted-foreground">Pekerjaan:</span> {student.mother_occupation || "-"}</p>
                      <p><span className="text-muted-foreground">Telepon:</span> {student.mother_phone || "-"}</p>
                    </div>
                  </div>
                  {student.guardian_name && (
                    <div>
                      <h4 className="mb-2 font-semibold">Wali</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Nama:</span> {student.guardian_name}</p>
                        <p><span className="text-muted-foreground">Pekerjaan:</span> {student.guardian_occupation || "-"}</p>
                        <p><span className="text-muted-foreground">Telepon:</span> {student.guardian_phone || "-"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asal Sekolah</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Nama Sekolah</p>
                    <p className="font-medium">{student.school_origin || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tahun Lulus</p>
                    <p className="font-medium">{student.graduation_year || "-"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Alamat Sekolah</p>
                    <p className="font-medium">{student.school_address || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status Pendaftaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="mt-1">
                    {STATUS_LABELS[student.registration_status as keyof typeof STATUS_LABELS]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jurusan</p>
                  <p className="font-medium">{getMajorLabel(student.first_choice)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Daftar</p>
                  <p className="font-medium">{formatDate(student.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gelombang Pendaftaran</p>
                  <p className="font-medium">{registrationWave?.label || "Di luar jadwal"}</p>
                </div>
                {student.submitted_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal Submit</p>
                    <p className="font-medium">{formatDate(student.submitted_at)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dokumen</CardTitle>
                <CardDescription>
                  {documents?.length || 0} dari 6 dokumen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(["ktp", "kk", "ijazah", "skhun", "foto", "akta"] as const).map((docType) => {
                    const doc = documents?.find((d: Document) => d.document_type === docType)
                    return (
                      <div key={docType} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {doc ? (
                            doc.status === "verified" ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : doc.status === "rejected" ? (
                              <XCircle className="h-4 w-4 text-destructive" />
                            ) : (
                              <FileText className="h-4 w-4 text-warning" />
                            )
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-muted" />
                          )}
                          <span className="text-sm">{DOCUMENT_LABELS[docType]}</span>
                        </div>
                        {doc && (
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
