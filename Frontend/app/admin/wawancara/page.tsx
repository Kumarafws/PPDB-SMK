"use client"

import { useState, useEffect } from "react"
import { apiGet, apiPatch } from "@/lib/ppdb-client/client"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { Loader2, Calendar, Clock, User } from "lucide-react"
import { MAJOR_OPTIONS, type Student } from "@/lib/types"

export default function WawancaraPage() {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [interviewDate, setInterviewDate] = useState("")
  const [interviewTime, setInterviewTime] = useState("")
  const [interviewNotes, setInterviewNotes] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await apiGet<{ data: Student[] }>(
        "/students?status=verified,interview_scheduled&limit=100"
      )
      setStudents(res.data ?? [])
    } catch (err) {
      console.error("loadData error:", err)
    }
    setLoading(false)
  }

  const handleScheduleInterview = async () => {
    if (!selectedStudent || !interviewDate || !interviewTime) return
    setProcessing(true)
    try {
      const interviewDateTime = new Date(`${interviewDate}T${interviewTime}`)
      await apiPatch(`/students/${selectedStudent.id}`, {
        registration_status: "interview_scheduled",
        interview_date: interviewDateTime.toISOString(),
        interview_notes: interviewNotes,
      })
      setSelectedStudent(null)
      setInterviewDate("")
      setInterviewTime("")
      setInterviewNotes("")
      await loadData()
    } catch (err) {
      console.error("Schedule error:", err)
    }
    setProcessing(false)
  }

  const getMajorLabel = (value: string | null) => {
    if (!value) return "-"
    return MAJOR_OPTIONS.find((m) => m.value === value)?.label || value
  }

  const formatDateTime = (date: string | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const verifiedStudents = students.filter((s) => s.registration_status === "verified")
  const scheduledStudents = students.filter((s) => s.registration_status === "interview_scheduled")

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
        <SidebarTrigger />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Jadwal Wawancara</h1>
          <p className="text-sm text-muted-foreground">Atur jadwal wawancara calon siswa</p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Belum Dijadwalkan
              </CardTitle>
              <CardDescription>
                {verifiedStudents.length} siswa siap untuk dijadwalkan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {verifiedStudents.length > 0 ? (
                <div className="space-y-3">
                  {verifiedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex flex-col items-start justify-between gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-medium">{student.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {getMajorLabel(student.first_choice)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setSelectedStudent(student)}
                        className="w-full sm:w-auto"
                      >
                        Jadwalkan
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  Tidak ada siswa yang menunggu jadwal
                </p>
              )}
            </CardContent>
          </Card>

          {/* Scheduled */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Sudah Dijadwalkan
              </CardTitle>
              <CardDescription>
                {scheduledStudents.length} siswa dengan jadwal wawancara
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledStudents.length > 0 ? (
                <div className="space-y-3">
                  {scheduledStudents.map((student) => (
                    <div
                      key={student.id}
                      className="rounded-lg border p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{student.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {getMajorLabel(student.first_choice)}
                          </p>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Terjadwal
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-primary">
                        <Calendar className="h-4 w-4" />
                        {formatDateTime(student.interview_date)}
                      </div>
                      {student.interview_notes && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Catatan: {student.interview_notes}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setSelectedStudent(student)
                          if (student.interview_date) {
                            const date = new Date(student.interview_date)
                            setInterviewDate(date.toISOString().split("T")[0])
                            setInterviewTime(date.toTimeString().slice(0, 5))
                          }
                          setInterviewNotes(student.interview_notes || "")
                        }}
                      >
                        Ubah Jadwal
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  Belum ada jadwal wawancara
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jadwalkan Wawancara</DialogTitle>
            <DialogDescription>
              Atur jadwal wawancara untuk {selectedStudent?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Waktu</Label>
                <Input
                  id="time"
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (opsional)</Label>
              <Textarea
                id="notes"
                placeholder="Catatan untuk siswa..."
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedStudent(null)}>
              Batal
            </Button>
            <Button
              onClick={handleScheduleInterview}
              disabled={!interviewDate || !interviewTime || processing}
            >
              {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Simpan Jadwal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
