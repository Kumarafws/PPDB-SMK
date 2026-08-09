import { describe, expect, it } from "@jest/globals"
import { DocumentType, DocumentVerificationStatus } from "@prisma/client"
import { adminPatchDocumentSchema, upsertStudentDocumentSchema } from "../../src/schemas/document.schema.js"

describe("upsertStudentDocumentSchema", () => {
  it("menerima payload dokumen valid", () => {
    const out = upsertStudentDocumentSchema.parse({
      document_type: DocumentType.ktp,
      file_url: "https://example.com/file.pdf",
      file_name: "ktp.pdf",
      file_size: 1024,
    })
    expect(out.document_type).toBe(DocumentType.ktp)
    expect(out.file_size).toBe(1024)
  })

  it("menolak URL tidak valid", () => {
    const parsed = upsertStudentDocumentSchema.safeParse({
      document_type: DocumentType.kk,
      file_url: "bukan-url",
      file_name: "x.pdf",
    })
    expect(parsed.success).toBe(false)
  })

  it("file_size boleh null atau tidak diisi", () => {
    const out = upsertStudentDocumentSchema.parse({
      document_type: DocumentType.foto,
      file_url: "https://x.com/a.png",
      file_name: "foto.png",
      file_size: null,
    })
    expect(out.file_size).toBeNull()
  })
})

describe("adminPatchDocumentSchema", () => {
  it("menerima status verifikasi", () => {
    const out = adminPatchDocumentSchema.parse({
      status: DocumentVerificationStatus.verified,
    })
    expect(out.status).toBe(DocumentVerificationStatus.verified)
  })
})
