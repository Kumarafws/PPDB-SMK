import { redirect } from "next/navigation"
import { createClient } from "@/lib/ppdb-client/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { FileText, Upload, Calendar, CheckCircle, ArrowRight, AlertCircle } from "lucide-react"
import { STATUS_LABELS, STATUS_COLORS, DOCUMENT_LABELS, type DocumentType, type Student, type Document } from "@/lib/types"

export default async function SiswaDashboard() {
  const api = await createClient()

  // Ambil data siswa dari backend
  let student: Student | null = null
  let documents: Document[] = []

  try {
    const studentRes = await api.get<{ student: Student | null }>("/students/me")
    student = studentRes.student

    if (student) {
      const docsRes = await api.get<{ documents: Document[] }>("/students/me/documents")
      documents = docsRes.documents ?? []
    }
  } catch {
    redirect("/auth/login")
  }

  const documentTypes: DocumentType[] = ["ktp", "kk", "ijazah", "skhun", "foto", "akta"]
  const uploadedDocs = documents.length
  const totalDocs = documentTypes.length
  const docProgress = Math.round((uploadedDocs / totalDocs) * 100)


  // Calculate form completion
  const formFields = [
    student?.full_name,
    student?.nisn,
    student?.nik,
    student?.birth_place,
    student?.birth_date,
    student?.gender,
    student?.address,
    student?.father_name,
    student?.mother_name,
    student?.school_origin,
    student?.first_choice,
  ]
  const filledFields = formFields.filter(Boolean).length
  const formProgress = Math.round((filledFields / formFields.length) * 100)

  const getStatusBadge = (status: string) => {
    const colorClass = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "bg-muted text-muted-foreground"
    const label = STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${colorClass}`}>
        {label}
      </span>
    )
  }

  return (
    <div className="container mx-auto p-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Selamat Datang, {student?.full_name || "Calon Siswa"}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Pantau status pendaftaran dan lengkapi dokumen Anda
        </p>
      </div>

      {/* Registration Flow Guide */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Alur Pendaftaran</CardTitle>
          <CardDescription>Ikuti langkah berikut setelah login agar pendaftaran Anda selesai.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Isi Formulir</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Lengkapi data diri, asal sekolah, dan pilih 1 jurusan.
                  </p>
                  <Link href="/siswa/pendaftaran" className="mt-3 inline-block">
                    <Button variant="outline" size="sm" className="gap-2">
                      Buka Formulir
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Upload Dokumen</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upload dokumen yang diminta agar bisa diverifikasi oleh panitia.
                  </p>
                  <Link href="/siswa/dokumen" className="mt-3 inline-block">
                    <Button variant="outline" size="sm" className="gap-2">
                      Upload Dokumen
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Tunggu Verifikasi</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pantau status pendaftaran di bagian atas dashboard ini.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  4
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Cek Jadwal & Hasil</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Jika ada wawancara, cek jadwal. Setelah itu cek pengumuman hasil seleksi.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Link href="/siswa/jadwal" className="inline-block">
                      <Button variant="outline" size="sm" className="w-full gap-2 sm:w-auto">
                        Jadwal
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/siswa/hasil" className="inline-block">
                      <Button variant="outline" size="sm" className="w-full gap-2 sm:w-auto">
                        Hasil Seleksi
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/siswa/cetak" className="inline-block">
                      <Button variant="outline" size="sm" className="w-full gap-2 sm:w-auto">
                        Cetak Formulir
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Status Pendaftaran</span>
            {student ? getStatusBadge(student.registration_status) : getStatusBadge("draft")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!student ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center sm:flex-row sm:text-left">
              <AlertCircle className="h-12 w-12 text-warning" />
              <div>
                <p className="font-medium">Anda belum memulai pendaftaran</p>
                <p className="text-sm text-muted-foreground">
                  Lengkapi formulir pendaftaran untuk memulai proses seleksi
                </p>
              </div>
              <Link href="/siswa/pendaftaran" className="sm:ml-auto">
                <Button className="gap-2">
                  Mulai Pendaftaran
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : student.registration_status === "draft" ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center sm:flex-row sm:text-left">
              <AlertCircle className="h-12 w-12 text-warning" />
              <div>
                <p className="font-medium">Pendaftaran belum lengkap</p>
                <p className="text-sm text-muted-foreground">
                  Lengkapi formulir dan upload dokumen untuk mengirim pendaftaran
                </p>
              </div>
              <Link href="/siswa/pendaftaran" className="sm:ml-auto">
                <Button className="gap-2">
                  Lanjutkan Pendaftaran
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : student.registration_status === "interview_scheduled" && student.interview_date ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center sm:flex-row sm:text-left">
              <Calendar className="h-12 w-12 text-primary" />
              <div>
                <p className="font-medium">Jadwal Wawancara</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(student.interview_date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <Link href="/siswa/jadwal" className="sm:ml-auto">
                <Button variant="outline" className="gap-2">
                  Lihat Detail
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : student.registration_status === "accepted" ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center sm:flex-row sm:text-left">
              <CheckCircle className="h-12 w-12 text-success" />
              <div>
                <p className="font-medium">Selamat! Anda diterima</p>
                <p className="text-sm text-muted-foreground">
                  Jurusan: {student.accepted_major}
                </p>
              </div>
              <Link href="/siswa/hasil" className="sm:ml-auto">
                <Button variant="outline" className="gap-2">
                  Lihat Detail
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Status pendaftaran Anda sedang dalam proses. Pantau terus halaman ini untuk update terbaru.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Kelengkapan Formulir</CardTitle>
            </div>
            <CardDescription>Data pribadi dan informasi pendaftaran</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{formProgress}%</span>
              </div>
              <Progress value={formProgress} className="h-2" />
            </div>
            <Link href="/siswa/pendaftaran" className="mt-4 block">
              <Button variant="outline" size="sm" className="w-full gap-2">
                {formProgress === 100 ? "Lihat Formulir" : "Lengkapi Formulir"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Kelengkapan Dokumen</CardTitle>
            </div>
            <CardDescription>{uploadedDocs} dari {totalDocs} dokumen sudah diupload</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{docProgress}%</span>
              </div>
              <Progress value={docProgress} className="h-2" />
            </div>
            <Link href="/siswa/dokumen" className="mt-4 block">
              <Button variant="outline" size="sm" className="w-full gap-2">
                {docProgress === 100 ? "Lihat Dokumen" : "Upload Dokumen"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Dokumen yang Diperlukan</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {documentTypes.map((docType) => {
            const doc = documents.find((d) => d.document_type === docType)
            return (
              <div
                key={docType}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                {doc ? (
                  <CheckCircle className="h-5 w-5 shrink-0 text-success" />
                ) : (
                  <div className="h-5 w-5 shrink-0 rounded-full border-2 border-muted" />
                )}
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium">{DOCUMENT_LABELS[docType]}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc ? "Sudah diupload" : "Belum diupload"}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
