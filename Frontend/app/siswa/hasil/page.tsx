import { redirect } from "next/navigation"
import { createClient } from "@/lib/ppdb-client/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, XCircle, Clock, MessageCircle } from "lucide-react"
import { MAJOR_OPTIONS, type Student } from "@/lib/types"

export default async function HasilPage() {
  const api = await createClient()

  let student: Student | null = null
  try {
    const res = await api.get<{ student: Student | null }>("/students/me")
    student = res.student
  } catch {
    redirect("/auth/login")
  }

  const getMajorLabel = (value: string | null) => {
    if (!value) return "-"
    return MAJOR_OPTIONS.find((m) => m.value === value)?.label || value
  }

  const renderResult = () => {
    if (!student) {
      return (
        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Clock className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Belum Mendaftar</h3>
            <p className="mb-4 text-muted-foreground">
              Anda belum memulai proses pendaftaran.
            </p>
            <Link href="/siswa/pendaftaran">
              <Button>Mulai Pendaftaran</Button>
            </Link>
          </CardContent>
        </Card>
      )
    }

    if (student.registration_status === "accepted") {
      return (
        <Card className="mx-auto max-w-2xl border-success/30 bg-success/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <CardTitle className="text-2xl text-success">Selamat! Anda Diterima</CardTitle>
            <CardDescription>
              Anda telah dinyatakan diterima sebagai siswa baru
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-card p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                  <p className="font-semibold">{student.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">No. Pendaftaran</p>
                  <p className="font-semibold">{student.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Jurusan Diterima</p>
                  <p className="text-lg font-bold text-primary">
                    {getMajorLabel(student.accepted_major)}
                  </p>
                </div>
              </div>
            </div>

            {student.selection_notes && (
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 font-semibold">Catatan:</h4>
                <p className="text-sm text-muted-foreground">{student.selection_notes}</p>
              </div>
            )}

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <h4 className="mb-2 font-semibold text-foreground">Langkah Selanjutnya:</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Bergabung ke grup WhatsApp siswa yang diterima</li>
                <li>Lakukan daftar ulang sesuai jadwal</li>
                <li>Siapkan pembayaran biaya pendidikan</li>
                <li>Ikuti orientasi siswa baru</li>
              </ul>
            </div>

            <a
              href="https://chat.whatsapp.com/IfdyXDnfiuS8KzxVBl2al1?mlu=4&s=sh&p=a"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#1ebe5d]">
                <MessageCircle className="h-5 w-5" />
                Bergabung ke Grup WhatsApp Siswa Diterima
              </Button>
            </a>
          </CardContent>
        </Card>
      )
    }

    if (student.registration_status === "rejected") {
      return (
        <Card className="mx-auto max-w-2xl border-destructive/30 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-destructive">Mohon Maaf</CardTitle>
            <CardDescription>
              Anda tidak lolos seleksi penerimaan siswa baru
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-card p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                  <p className="font-semibold">{student.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Jurusan</p>
                  <p className="font-semibold">{getMajorLabel(student.first_choice)}</p>
                </div>
              </div>
            </div>

            {student.selection_notes && (
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 font-semibold">Alasan:</h4>
                <p className="text-sm text-muted-foreground">{student.selection_notes}</p>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Jangan menyerah! Masih banyak kesempatan lain untuk meraih cita-cita Anda.
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-warning/20">
            <Clock className="h-10 w-10 text-warning" />
          </div>
          <CardTitle className="text-2xl">Menunggu Hasil</CardTitle>
          <CardDescription>
            Hasil seleksi akan diumumkan setelah proses selesai
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                <p className="font-semibold">{student.full_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="font-semibold capitalize">
                  {student.registration_status === "interview_scheduled"
                    ? "Jadwal Wawancara"
                    : student.registration_status === "verified"
                    ? "Terverifikasi"
                    : student.registration_status === "submitted"
                    ? "Menunggu Verifikasi"
                    : "Draft"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Jurusan</p>
                <p className="font-semibold">{getMajorLabel(student.first_choice)}</p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Pantau terus halaman ini untuk mendapatkan update terbaru mengenai hasil seleksi Anda.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Hasil Seleksi</h1>
        <p className="mt-1 text-muted-foreground">
          Pengumuman hasil seleksi penerimaan siswa baru
        </p>
      </div>

      {renderResult()}
    </div>
  )
}
