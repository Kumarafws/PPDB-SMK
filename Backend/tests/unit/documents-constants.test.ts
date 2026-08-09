import { describe, expect, it } from "@jest/globals"
import { DocumentType } from "@prisma/client"
import { REQUIRED_DOCUMENT_TYPES } from "../../src/constants/documents.js"

describe("REQUIRED_DOCUMENT_TYPES", () => {
  it("berisi 6 jenis dokumen", () => {
    expect(REQUIRED_DOCUMENT_TYPES).toHaveLength(6)
  })

  it("memuat ktp, kk, ijazah, skhun, foto, akta", () => {
    expect(REQUIRED_DOCUMENT_TYPES).toContain(DocumentType.ktp)
    expect(REQUIRED_DOCUMENT_TYPES).toContain(DocumentType.kk)
    expect(REQUIRED_DOCUMENT_TYPES).toContain(DocumentType.ijazah)
    expect(REQUIRED_DOCUMENT_TYPES).toContain(DocumentType.skhun)
    expect(REQUIRED_DOCUMENT_TYPES).toContain(DocumentType.foto)
    expect(REQUIRED_DOCUMENT_TYPES).toContain(DocumentType.akta)
  })
})
