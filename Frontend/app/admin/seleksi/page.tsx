"use client"

import { useState, useEffect } from "react"
import { apiGet, apiPatch } from "@/lib/ppdb-client/client"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, CheckCircle, XCircle, User } from "lucide-react"
import { MAJOR_OPTIONS, type Student } from "@/lib/types"

export default function SeleksiPage() {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectionType, setSelectionType] = useState<"accept" | "reject" | null>(null)
  const [selectionNotes, setSelectionNotes] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await apiGet<{ data: Student[] }>(
        "/students?status=interview_scheduled,accepted,rejected&limit=100"
      )
      setStudents(res.data ?? [])
    } catch (err) {
      console.error("loadData error:", err)
    }
    setLoading(false)
  }

  const handleSelection = async () => {
    if (!selectedStudent || !selectionType) return
    const majorToAccept = selectedStudent.first_choice || ""
    if (selectionType === "accept" && !majorToAccept) return

    setProcessing(true)
    try {
      await apiPatch(`/students/${selectedStudent.id}`, {
        registration_status: selectionType === "accept" ? "accepted" : "rejected",
        selection_status: selectionType === "accept" ? "accepted" : "rejected",
        accepted_major: selectionType === "accept" ? majorToAccept : null,
        selection_notes: selectionNotes,
      })
      setSelectedStudent(null)
      setSelectionType(null)
      setSelectionNotes("")
      await loadData()
    } catch (err) {
      console.error("Selection error:", err)
    }
    setProcessing(false)
  }

  const getMajorLabel = (value: string | null) => {
    if (!value) return "-"
    return MAJOR_OPTIONS.find((m) => m.value === value)?.label || value
  }

  const formatDate = (date: string | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const pendingStudents = students.filter((s) => s.registration_status === "interview_scheduled")
  const acceptedStudents = students.filter((s) => s.registration_status === "accepted")
  const rejectedStudents = students.filter((s) => s.registration_status === "rejected")

  return (
    <div className="flex flex-col">
      <header className="flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
        <SidebarTrigger />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Seleksi Penerimaan</h1>
          <p className="text-sm text-muted-foreground">
            Kelola penerimaan siswa baru
          </p>
        </div>
      </header>

      <div className="border-b bg-card px-4 py-4 sm:px-6">
        <div className="flex flex-wrap gap-6">
          <div>
            <span className="text-sm text-muted-foreground">Menunggu Seleksi</span>
            <p className="text-2xl font-bold text-primary">{pendingStudents.length}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Diterima</span>
            <p className="text-2xl font-bold text-success">{acceptedStudents.length}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Ditolak</span>
            <p className="text-2xl font-bold text-destructive">{rejectedStudents.length}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6">
        <div className="space-y-6">
          {(acceptedStudents.length > 0 || rejectedStudents.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Hasil Data Seleksi</CardTitle>
                <CardDescription>Rekap siswa yang sudah mendapatkan keputusan seleksi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                    <p className="text-sm text-muted-foreground">Total Diterima</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-2xl font-bold text-success">{acceptedStudents.length}</p>
                      <Badge className="bg-success/20 text-success">Diterima</Badge>
                    </div>
                  </div>
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <p className="text-sm text-muted-foreground">Total Ditolak</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-2xl font-bold text-destructive">{rejectedStudents.length}</p>
                      <Badge variant="destructive">Ditolak</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Menunggu Keputusan
              </CardTitle>
              <CardDescription>
                Siswa yang sudah menjalani wawancara
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Nama</th>
                        <th className="pb-3 font-medium">Jurusan</th>
                        <th className="pb-3 font-medium">Tanggal Wawancara</th>
                        <th className="pb-3 font-medium">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {pendingStudents.map((student) => (
                        <tr key={student.id}>
                          <td className="py-3">
                            <p className="font-medium">{student.full_name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </td>
                          <td className="py-3">
                            <p className="text-sm">{getMajorLabel(student.first_choice)}</p>
                          </td>
                          <td className="py-3 text-sm">
                            {formatDate(student.interview_date)}
                          </td>
                          <td className="py-3">
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Button
                                size="sm"
                                className="w-full gap-1 bg-success hover:bg-success/90 sm:w-auto"
                                onClick={() => {
                                  setSelectedStudent(student)
                                  setSelectionType("accept")
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                                Terima
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="w-full gap-1 sm:w-auto"
                                onClick={() => {
                                  setSelectedStudent(student)
                                  setSelectionType("reject")
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                                Tolak
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  Tidak ada siswa yang menunggu keputusan
                </p>
              )}
            </CardContent>
          </Card>

          {acceptedStudents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Siswa Diterima
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {acceptedStudents.map((student) => (
                    <div key={student.id} className="rounded-lg border border-success/30 bg-success/5 p-3">
                      <p className="font-medium">{student.full_name}</p>
                      <p className="text-sm text-success">
                        {getMajorLabel(student.accepted_major)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {rejectedStudents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  Siswa Ditolak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {rejectedStudents.map((student) => (
                    <div key={student.id} className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                      <p className="font-medium">{student.full_name}</p>
                      {student.selection_notes && (
                        <p className="text-sm text-muted-foreground">{student.selection_notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={!!selectedStudent && !!selectionType} onOpenChange={() => {
        setSelectedStudent(null)
        setSelectionType(null)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectionType === "accept" ? "Terima Siswa" : "Tolak Siswa"}
            </DialogTitle>
            <DialogDescription>
              {selectionType === "accept"
                ? `Konfirmasi penerimaan ${selectedStudent?.full_name}`
                : `Konfirmasi penolakan ${selectedStudent?.full_name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectionType === "accept" && (
              <div className="space-y-2">
                <Label>Jurusan Diterima</Label>
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  {getMajorLabel(selectedStudent?.first_choice || null)}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Catatan (opsional)</Label>
              <Textarea
                placeholder={selectionType === "accept" ? "Catatan penerimaan..." : "Alasan penolakan..."}
                value={selectionNotes}
                onChange={(e) => setSelectionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedStudent(null)
              setSelectionType(null)
            }}>
              Batal
            </Button>
            <Button
              variant={selectionType === "accept" ? "default" : "destructive"}
              onClick={handleSelection}
              disabled={processing || (selectionType === "accept" && !selectedStudent?.first_choice)}
            >
              {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {selectionType === "accept" ? "Terima" : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
