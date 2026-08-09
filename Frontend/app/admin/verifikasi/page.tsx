"use client"

import { useState, useEffect } from "react"
import { apiGet, apiPatch } from "@/lib/ppdb-client/client"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, CheckCircle, XCircle, Eye, FileText } from "lucide-react"
import {
  DOCUMENT_LABELS,
  DOCUMENT_TYPE_ORDER,
  type Document,
  type Student,
} from "@/lib/types"

const REQUIRED_DOC_COUNT = DOCUMENT_TYPE_ORDER.length

function areAllDocumentsVerified(docs: Document[]) {
  return DOCUMENT_TYPE_ORDER.every((type) => {
    const row = docs.find((d) => d.document_type === type)
    return row?.status === "verified"
  })
}

export default function VerifikasiPage() {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<(Student & { documents: Document[] })[]>([])
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await apiGet<{ data: Student[] }>(
        "/students?status=submitted,verified&limit=100"
      )
      const studentsData = res.data ?? []

      const studentsWithDocs = await Promise.all(
        studentsData.map(async (student) => {
          const docsRes = await apiGet<{ documents: Document[] }>(
            `/students/${student.id}/documents`
          )
          return { ...student, documents: docsRes.documents ?? [] }
        })
      )
      setStudents(studentsWithDocs)
    } catch (err) {
      console.error("loadData error:", err)
    }
    setLoading(false)
  }

  const handleVerify = async (doc: Document) => {
    setProcessing(true)
    try {
      await apiPatch(`/documents/${doc.id}`, { status: "verified" })
      await loadData()
    } catch (err) {
      console.error("Verify error:", err)
    }
    setProcessing(false)
  }

  const handleReject = async () => {
    if (!selectedDoc || !rejectReason) return
    setProcessing(true)
    try {
      await apiPatch(`/documents/${selectedDoc.id}`, {
        status: "rejected",
        rejection_reason: rejectReason,
      })
      setSelectedDoc(null)
      setRejectReason("")
      await loadData()
    } catch (err) {
      console.error("Reject error:", err)
    }
    setProcessing(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-success text-success-foreground">Terverifikasi</Badge>
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const pendingStudents = students.filter((s) =>
    s.documents.some((d) => d.status === "pending")
  )

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
        <SidebarTrigger />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Verifikasi Dokumen</h1>
          <p className="text-sm text-muted-foreground">
            {pendingStudents.length} pendaftar menunggu verifikasi
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6">
        {pendingStudents.length > 0 ? (
          <div className="space-y-6">
            {pendingStudents.map((student) => (
              <Card key={student.id}>
                <CardHeader>
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                    <div>
                      <CardTitle>{student.full_name}</CardTitle>
                      <CardDescription>
                        NISN: {student.nisn || "-"} | Email: {student.email}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {
                        DOCUMENT_TYPE_ORDER.filter(
                          (type) =>
                            student.documents.find((d) => d.document_type === type)?.status ===
                            "verified"
                        ).length
                      }{" "}
                      / {REQUIRED_DOC_COUNT} terverifikasi
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {DOCUMENT_TYPE_ORDER.map((docType) => {
                      const doc = student.documents.find((d) => d.document_type === docType)
                      return (
                        <div
                          key={docType}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium">
                                {DOCUMENT_LABELS[docType]}
                              </p>
                              {doc ? (
                                getStatusBadge(doc.status)
                              ) : (
                                <Badge variant="outline" className="mt-1 text-muted-foreground">
                                  Belum diupload
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            {doc ? (
                              <>
                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </a>
                                {doc.status === "pending" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-success hover:bg-success/10 hover:text-success"
                                      onClick={() => handleVerify(doc)}
                                      disabled={processing}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                      disabled={processing}
                                      onClick={() => setSelectedDoc(doc)}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <CheckCircle className="mb-4 h-16 w-16 text-success" />
              <h3 className="mb-2 text-lg font-semibold">Semua Dokumen Terverifikasi</h3>
              <p className="text-muted-foreground">
                Tidak ada dokumen yang menunggu verifikasi
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Dokumen</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan dokumen ini
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Alasan penolakan..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDoc(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason || processing}
            >
              {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Tolak Dokumen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
