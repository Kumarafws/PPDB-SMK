"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { apiGet, apiPost, apiDelete, apiPatch, ApiError } from "@/lib/ppdb-client/client"
import { upload } from "@vercel/blob/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload, FileText, CheckCircle, XCircle, AlertCircle, Trash2, Eye } from "lucide-react"
import { DOCUMENT_LABELS, type DocumentType, type Document, type Student } from "@/lib/types"

const documentTypes: DocumentType[] = ["ktp", "kk", "ijazah", "skhun", "foto", "akta"]

export default function DokumenPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<Student | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const studentRes = await apiGet<{ student: Student | null }>("/students/me")
      setStudent(studentRes.student)

      if (studentRes.student) {
        const docsRes = await apiGet<{ documents: Document[] }>("/students/me/documents")
        setDocuments(docsRes.documents ?? [])
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/auth/login")
        return
      }
    }
    setLoading(false)
  }

  const handleFileUpload = useCallback(async (docType: DocumentType, file: File) => {
    if (!student) return

    setUploading((prev) => ({ ...prev, [docType]: true }))
    setUploadProgress((prev) => ({ ...prev, [docType]: 0 }))

    try {
      const blob = await upload(`ppdb/${student.id}/${docType}-${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        onUploadProgress: (progress) => {
          setUploadProgress((prev) => ({
            ...prev,
            [docType]: Math.round((progress.loaded / progress.total) * 100),
          }))
        },
      })

      const docRes = await apiPost<{ document: Document }>("/students/me/documents", {
        document_type: docType,
        file_url: blob.url,
        file_name: file.name,
        file_size: file.size,
      })

      setDocuments((prev) => {
        const existing = prev.findIndex((d) => d.document_type === docType)
        if (existing >= 0) {
          const next = [...prev]
          next[existing] = docRes.document
          return next
        }
        return [...prev, docRes.document]
      })
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setUploading((prev) => ({ ...prev, [docType]: false }))
      setUploadProgress((prev) => ({ ...prev, [docType]: 0 }))
    }
  }, [student])

  const handleDeleteDocument = async (docId: string, docType: DocumentType) => {
    try {
      await apiDelete(`/students/me/documents/${docId}`)
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  const handleSubmit = async () => {
    try {
      await apiPatch("/students/me", {
        registration_status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      router.push("/siswa")
    } catch (err) {
      console.error("Submit error:", err)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-success" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-destructive" />
      default:
        return <AlertCircle className="h-5 w-5 text-warning" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "verified":
        return "Terverifikasi"
      case "rejected":
        return "Ditolak"
      default:
        return "Menunggu Verifikasi"
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const uploadedCount = documents.length
  const totalDocs = documentTypes.length
  const progress = Math.round((uploadedCount / totalDocs) * 100)
  const canSubmit = uploadedCount >= totalDocs

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Upload Dokumen</h1>
        <p className="mt-1 text-muted-foreground">
          Unggah dokumen yang diperlukan untuk pendaftaran
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Progress Upload</CardTitle>
          <CardDescription>
            {uploadedCount} dari {totalDocs} dokumen sudah diupload
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documentTypes.map((docType) => {
          const doc = documents.find((d) => d.document_type === docType)
          const isUploading = uploading[docType]
          const uploadPercent = uploadProgress[docType] || 0

          return (
            <Card key={docType} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5 text-primary" />
                  {DOCUMENT_LABELS[docType]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {doc ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      {getStatusIcon(doc.status)}
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium">{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {getStatusLabel(doc.status)}
                        </p>
                      </div>
                    </div>
                    {doc.status === "rejected" && doc.rejection_reason && (
                      <p className="text-xs text-destructive">
                        Alasan: {doc.rejection_reason}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                        asChild
                      >
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                          Lihat
                        </a>
                      </Button>
                      {/* Tombol hapus hanya tampil jika dokumen BUKAN verified */}
                      {doc.status !== "verified" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleDeleteDocument(doc.id, docType)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {doc.status !== "verified" && (
                      <label className="block">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(docType, file)
                          }}
                        />
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full gap-1"
                          asChild
                        >
                          <span>
                            <Upload className="h-4 w-4" />
                            {doc.status === "rejected" ? "Upload Ulang" : "Ganti Dokumen"}
                          </span>
                        </Button>
                      </label>
                    )}
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(docType, file)
                      }}
                    />
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-6 transition-colors hover:border-primary/50 hover:bg-muted">
                      {isUploading ? (
                        <>
                          <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">
                            Mengupload... {uploadPercent}%
                          </p>
                          <Progress value={uploadPercent} className="mt-2 h-1 w-full" />
                        </>
                      ) : (
                        <>
                          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                          <p className="text-sm font-medium text-muted-foreground">
                            Klik untuk upload
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            JPG, PNG, atau PDF (Maks. 2MB)
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full gap-2 sm:w-auto"
        >
          <CheckCircle className="h-5 w-5" />
          Kirim Pendaftaran
        </Button>
      </div>

      {!canSubmit && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Lengkapi semua dokumen untuk dapat mengirim pendaftaran
        </p>
      )}
    </div>
  )
}
