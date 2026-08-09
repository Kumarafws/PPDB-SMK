import { redirect } from "next/navigation"
import { createClient } from "@/lib/ppdb-client/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin, AlertCircle } from "lucide-react"
import type { Student } from "@/lib/types"

export default async function JadwalPage() {
  const api = await createClient()

  let student: Student | null = null
  try {
    const res = await api.get<{ student: Student | null }>("/students/me")
    student = res.student
  } catch {
    redirect("/auth/login")
  }

  const hasInterview = student?.registration_status === "interview_scheduled" && student?.interview_date

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Jadwal Wawancara</h1>
        <p className="mt-1 text-muted-foreground">
          Informasi jadwal wawancara penerimaan siswa baru
        </p>
      </div>

      {hasInterview ? (
        <Card className="mx-auto max-w-2xl border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Jadwal Wawancara Anda</CardTitle>
            <CardDescription>
              Harap hadir tepat waktu sesuai jadwal yang telah ditentukan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tanggal</p>
                    <p className="font-semibold">
                      {new Date(student.interview_date!).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Waktu</p>
                    <p className="font-semibold">
                      {new Date(student.interview_date!).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      WIB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-4">
              <MapPin className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lokasi</p>
                <p className="font-semibold">Ruang Wawancara SMK</p>
                <p className="text-sm text-muted-foreground">
                  Jl. Pendidikan No. 123, Kota
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
              <h4 className="mb-2 font-semibold text-foreground">Hal yang Perlu Dipersiapkan:</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Kartu identitas asli (KTP/Kartu Pelajar)</li>
                <li>Berkas pendaftaran yang telah dicetak</li>
                <li>Alat tulis</li>
                <li>Berpakaian rapi dan sopan</li>
              </ul>
            </div>

            {student.interview_notes && (
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 font-semibold text-foreground">Catatan dari Admin:</h4>
                <p className="text-sm text-muted-foreground">{student.interview_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <AlertCircle className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Belum Ada Jadwal</h3>
            <p className="text-muted-foreground">
              {student?.registration_status === "submitted"
                ? "Jadwal wawancara akan ditentukan setelah dokumen Anda diverifikasi."
                : student?.registration_status === "verified"
                ? "Jadwal wawancara akan segera diinformasikan."
                : "Lengkapi pendaftaran dan upload dokumen untuk mendapatkan jadwal wawancara."}
            </p>
          </CardContent>
        </Card>
      )}


      <div className="mx-auto mt-8 max-w-2xl">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Alur Seleksi</h2>
        <div className="space-y-4">
          {[
            { step: 1, title: "Pendaftaran Online", desc: "Lengkapi formulir dan upload dokumen" },
            { step: 2, title: "Verifikasi Dokumen", desc: "Admin memverifikasi kelengkapan berkas" },
            { step: 3, title: "Jadwal Wawancara", desc: "Dapatkan jadwal wawancara via email/dashboard" },
            { step: 4, title: "Wawancara", desc: "Hadiri wawancara sesuai jadwal" },
            { step: 5, title: "Pengumuman", desc: "Hasil seleksi diumumkan" },
          ].map((item, index) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {item.step}
                </div>
                {index < 4 && <div className="h-full w-0.5 bg-border" />}
              </div>
              <div className="pb-4">
                <h3 className="font-medium text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
