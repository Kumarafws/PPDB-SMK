import { describe, expect, it } from "@jest/globals"
import {
  DocumentType,
  DocumentVerificationStatus,
  RegistrationStatus,
  StudentDocumentStatus,
  UserRole,
} from "@prisma/client"
import type { AdminLog, Document, Profile, SchoolSetting, Student } from "@prisma/client"
import {
  adminLogToJson,
  documentToJson,
  profileToJson,
  schoolSettingToJson,
  studentToJson,
} from "../../src/mappers/json.js"

const fixed = new Date("2026-01-15T10:00:00.000Z")

function mockProfile(over: Partial<Profile> = {}): Profile {
  return {
    id: "p1",
    email: "e@test.com",
    passwordHash: "hash",
    fullName: "Nama",
    role: UserRole.siswa,
    phone: "08",
    createdAt: fixed,
    updatedAt: fixed,
    ...over,
  }
}

function mockStudent(over: Partial<Student> = {}): Student {
  return {
    id: "s1",
    userId: "p1",
    fullName: "Siswa",
    registrationStatus: RegistrationStatus.draft,
    documentStatus: StudentDocumentStatus.pending,
    createdAt: fixed,
    updatedAt: fixed,
    nisn: null,
    nik: null,
    birthPlace: null,
    birthDate: new Date("2010-05-01"),
    gender: null,
    religion: null,
    address: null,
    rt: null,
    rw: null,
    village: null,
    district: null,
    city: null,
    province: null,
    postalCode: null,
    phone: null,
    email: null,
    anakKe: null,
    jumlahSaudara: null,
    registrationInfoSource: null,
    noKip: null,
    fatherName: null,
    fatherOccupation: null,
    fatherPhone: null,
    motherName: null,
    motherOccupation: null,
    motherPhone: null,
    guardianName: null,
    guardianOccupation: null,
    guardianPhone: null,
    schoolOrigin: null,
    schoolAddress: null,
    graduationYear: null,
    firstChoice: null,
    interviewDate: null,
    interviewNotes: null,
    selectionStatus: null,
    selectionNotes: null,
    acceptedMajor: null,
    submittedAt: null,
    verifiedAt: null,
    verifierId: null,
    ...over,
  }
}

describe("profileToJson", () => {
  it("memetakan ke snake_case API", () => {
    const j = profileToJson(mockProfile())
    expect(j).toMatchObject({
      id: "p1",
      email: "e@test.com",
      full_name: "Nama",
      role: "siswa",
      phone: "08",
    })
    expect(j.created_at).toBe(fixed.toISOString())
  })
})

describe("studentToJson", () => {
  it("memetakan tanggal lahir ke format YYYY-MM-DD", () => {
    const j = studentToJson(mockStudent())
    expect(j.birth_date).toBe("2010-05-01")
    expect(j.full_name).toBe("Siswa")
    expect(j.registration_status).toBe("draft")
  })
})

describe("documentToJson", () => {
  it("memetakan dokumen", () => {
    const d: Document = {
      id: "d1",
      studentId: "s1",
      documentType: DocumentType.ktp,
      fileUrl: "https://x.com/a.pdf",
      fileName: "a.pdf",
      fileSize: 100,
      status: DocumentVerificationStatus.pending,
      rejectionReason: null,
      verifiedAt: null,
      verifiedById: null,
      createdAt: fixed,
      updatedAt: fixed,
    }
    const j = documentToJson(d)
    expect(j.document_type).toBe("ktp")
    expect(j.file_url).toBe("https://x.com/a.pdf")
    expect(j.status).toBe("pending")
  })
})

describe("adminLogToJson", () => {
  it("mengurai detailsJson valid ke object", () => {
    const log: AdminLog = {
      id: "l1",
      adminId: "a1",
      action: "test",
      targetType: "profile",
      targetId: "t1",
      detailsJson: '{"x":1}',
      ipAddress: "127.0.0.1",
      createdAt: fixed,
    }
    const j = adminLogToJson(log)
    expect(j.details).toEqual({ x: 1 })
    expect(j.action).toBe("test")
  })

  it("details null jika JSON rusak", () => {
    const log: AdminLog = {
      id: "l2",
      adminId: "a1",
      action: "x",
      targetType: null,
      targetId: null,
      detailsJson: "{not json",
      ipAddress: null,
      createdAt: fixed,
    }
    const j = adminLogToJson(log)
    expect(j.details).toBeNull()
  })
})

describe("schoolSettingToJson", () => {
  it("memetakan pengaturan sekolah", () => {
    const s: SchoolSetting = {
      id: "set1",
      key: "quota",
      value: "100",
      createdAt: fixed,
      updatedAt: fixed,
    }
    const j = schoolSettingToJson(s)
    expect(j.key).toBe("quota")
    expect(j.value).toBe("100")
  })
})
