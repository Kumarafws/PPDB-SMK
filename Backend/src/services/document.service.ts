import type { DocumentVerificationStatus, StudentDocumentStatus } from "@prisma/client"
import { AppError } from "../lib/app-error.js"
import { prisma } from "../lib/prisma.js"
import { REQUIRED_DOCUMENT_TYPES } from "../constants/documents.js"
import { documentToJson, studentToJson } from "../mappers/json.js"
import type { adminPatchDocumentSchema, upsertStudentDocumentSchema } from "../schemas/document.schema.js"
import type { z } from "zod"

async function syncStudentDocumentAggregate(studentId: string) {
  const docs = await prisma.document.findMany({ where: { studentId } })
  const map = new Map(docs.map((d) => [d.documentType, d]))

  let uploaded = 0
  for (const t of REQUIRED_DOCUMENT_TYPES) {
    if (map.has(t)) uploaded++
  }

  const allVerified = REQUIRED_DOCUMENT_TYPES.every(
    (t) => map.get(t)?.status === "verified"
  )
  const anyRejected = REQUIRED_DOCUMENT_TYPES.some((t) => map.get(t)?.status === "rejected")

  let documentStatus: StudentDocumentStatus
  if (allVerified && uploaded === REQUIRED_DOCUMENT_TYPES.length) {
    documentStatus = "verified"
  } else if (uploaded >= REQUIRED_DOCUMENT_TYPES.length) {
    documentStatus = "complete"
  } else if (uploaded > 0) {
    documentStatus = "incomplete"
  } else {
    documentStatus = "pending"
  }

  if (anyRejected) {
    documentStatus = "incomplete"
  }

  await prisma.student.update({
    where: { id: studentId },
    data: { documentStatus },
  })
}

export async function listDocumentsForUser(userId: string) {
  const student = await prisma.student.findUnique({ where: { userId } })
  if (!student) {
    throw new AppError(404, "Data siswa tidak ditemukan")
  }
  const docs = await prisma.document.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "asc" },
  })
  return docs.map(documentToJson)
}

export async function upsertDocumentForUser(
  userId: string,
  body: z.infer<typeof upsertStudentDocumentSchema>
) {
  const student = await prisma.student.findUnique({ where: { userId } })
  if (!student) {
    throw new AppError(404, "Data siswa tidak ditemukan")
  }

  const doc = await prisma.document.upsert({
    where: {
      studentId_documentType: {
        studentId: student.id,
        documentType: body.document_type,
      },
    },
    create: {
      studentId: student.id,
      documentType: body.document_type,
      fileUrl: body.file_url,
      fileName: body.file_name,
      fileSize: body.file_size ?? null,
      status: "pending",
    },
    update: {
      fileUrl: body.file_url,
      fileName: body.file_name,
      fileSize: body.file_size ?? null,
      status: "pending",
      rejectionReason: null,
      verifiedAt: null,
      verifiedById: null,
    },
  })

  await syncStudentDocumentAggregate(student.id)
  const refreshed = await prisma.document.findUnique({ where: { id: doc.id } })
  return documentToJson(refreshed!)
}

export async function deleteDocumentForUser(userId: string, documentId: string) {
  const student = await prisma.student.findUnique({ where: { userId } })
  if (!student) {
    throw new AppError(404, "Data siswa tidak ditemukan")
  }
  const doc = await prisma.document.findFirst({
    where: { id: documentId, studentId: student.id },
  })
  if (!doc) {
    throw new AppError(404, "Dokumen tidak ditemukan")
  }
  await prisma.document.delete({ where: { id: documentId } })
  await syncStudentDocumentAggregate(student.id)
  return { ok: true }
}

export async function listDocumentsForStudentId(studentId: string) {
  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) {
    throw new AppError(404, "Siswa tidak ditemukan")
  }
  const docs = await prisma.document.findMany({
    where: { studentId },
    orderBy: { createdAt: "asc" },
  })
  return docs.map(documentToJson)
}

export async function adminPatchDocument(
  documentId: string,
  adminProfileId: string,
  body: z.infer<typeof adminPatchDocumentSchema>
) {
  const doc = await prisma.document.findUnique({ where: { id: documentId } })
  if (!doc) {
    throw new AppError(404, "Dokumen tidak ditemukan")
  }

  let status: DocumentVerificationStatus = body.status
  let rejectionReason: string | null = body.rejection_reason ?? null
  let verifiedAt: Date | null = null
  let verifiedById: string | null = null

  if (status === "verified") {
    verifiedAt = new Date()
    verifiedById = adminProfileId
    rejectionReason = null
  } else if (status === "rejected") {
    verifiedAt = new Date()
    verifiedById = adminProfileId
    if (!rejectionReason?.trim()) {
      throw new AppError(400, "rejection_reason wajib diisi saat menolak dokumen")
    }
  } else {
    verifiedAt = null
    verifiedById = null
  }

  const updated = await prisma.document.update({
    where: { id: documentId },
    data: {
      status,
      rejectionReason,
      verifiedAt,
      verifiedById,
    },
  })

  await syncStudentDocumentAggregate(doc.studentId)

  if (status === "rejected") {
    await prisma.student.update({
      where: { id: doc.studentId },
      data: {
        registrationStatus: "submitted",
        verifiedAt: null,
        verifierId: null,
      },
    })
  } else if (await checkAllDocumentsVerified(doc.studentId)) {
    await prisma.student.update({
      where: { id: doc.studentId },
      data: {
        registrationStatus: "verified",
        verifiedAt: new Date(),
        verifierId: adminProfileId,
        documentStatus: "verified",
      },
    })
  }

  const studentRow = await prisma.student.findUnique({ where: { id: doc.studentId } })
  return {
    document: documentToJson(updated),
    student: studentRow ? studentToJson(studentRow) : null,
  }
}

async function checkAllDocumentsVerified(studentId: string): Promise<boolean> {
  const docs = await prisma.document.findMany({ where: { studentId } })
  const map = new Map(docs.map((d) => [d.documentType, d]))
  return REQUIRED_DOCUMENT_TYPES.every((t) => map.get(t)?.status === "verified")
}
