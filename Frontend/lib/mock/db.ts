import type { AdminLog, Document, Profile, SchoolSetting, Student, UserRole } from "@/lib/types"

type DbState = {
  profiles: Profile[]
  students: Student[]
  documents: Document[]
  admin_logs: AdminLog[]
  school_settings: SchoolSetting[]
}

function nowIso() {
  return new Date().toISOString()
}

function uuidFromSeed(seed: string) {
  // Deterministic-ish id for mock use (not a real UUID, but stable)
  return `mock-${seed}`
}

function ensureSeedData(): DbState {
  const g = globalThis as unknown as { __PPDB_MOCK_DB__?: DbState }
  if (g.__PPDB_MOCK_DB__) return g.__PPDB_MOCK_DB__

  const createdAt = nowIso()
  const updatedAt = createdAt

  const superadminId = uuidFromSeed("superadmin")
  const adminId = uuidFromSeed("admin")
  const siswaId = uuidFromSeed("siswa")
  const siswa2Id = uuidFromSeed("siswa-2")
  const siswa3Id = uuidFromSeed("siswa-3")

  const profiles: Profile[] = [
    {
      id: superadminId,
      email: "superadmin@ppdb.test",
      full_name: "Super Admin",
      role: "superadmin",
      phone: "080000000001",
      created_at: createdAt,
      updated_at: updatedAt,
    },
    {
      id: adminId,
      email: "admin@ppdb.test",
      full_name: "Admin PPDB",
      role: "admin",
      phone: "080000000002",
      created_at: createdAt,
      updated_at: updatedAt,
    },
    {
      id: siswaId,
      email: "siswa@ppdb.test",
      full_name: "Siswa Demo",
      role: "siswa",
      phone: "080000000003",
      created_at: createdAt,
      updated_at: updatedAt,
    },
    {
      id: siswa2Id,
      email: "siswa2@ppdb.test",
      full_name: "Siswa Verifikasi",
      role: "siswa",
      phone: "080000000004",
      created_at: createdAt,
      updated_at: updatedAt,
    },
    {
      id: siswa3Id,
      email: "siswa3@ppdb.test",
      full_name: "Rizky Alfiansyah",
      role: "siswa",
      phone: "080000000005",
      created_at: createdAt,
      updated_at: updatedAt,
    },
  ]

  const students: Student[] = [
    {
      id: uuidFromSeed("student-1"),
      user_id: siswaId,
      nisn: "1234567890",
      nik: "3201010101010101",
      full_name: "Siswa Demo",
      birth_place: "Bandung",
      birth_date: "2009-01-01",
      gender: "laki-laki",
      religion: "Islam",
      address: "Jl. Contoh No. 1",
      rt: "001",
      rw: "002",
      village: "Sukamaju",
      district: "Cicendo",
      city: "Bandung",
      province: "Jawa Barat",
      postal_code: "40100",
      phone: "080000000003",
      email: "siswa@ppdb.test",
      father_name: "Bapak Demo",
      father_occupation: "Karyawan",
      father_phone: "080000000010",
      mother_name: "Ibu Demo",
      mother_occupation: "Ibu Rumah Tangga",
      mother_phone: "080000000011",
      guardian_name: null,
      guardian_occupation: null,
      guardian_phone: null,
      school_origin: "SMP Negeri 1",
      school_address: "Jl. Sekolah No. 1",
      graduation_year: "2026",
      first_choice: "rpl",
      registration_status: "interview_scheduled",
      document_status: "verified",
      interview_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      interview_notes: "Datang 15 menit lebih awal.",
      selection_status: "pending",
      selection_notes: null,
      accepted_major: null,
      submitted_at: createdAt,
      verified_at: createdAt,
      verified_by: adminId,
      created_at: createdAt,
      updated_at: updatedAt,
    },
    {
      id: uuidFromSeed("student-2"),
      user_id: siswa2Id,
      nisn: "0987654321",
      nik: "3202020202020202",
      full_name: "Siswa Verifikasi",
      birth_place: "Jakarta",
      birth_date: "2009-05-12",
      gender: "perempuan",
      religion: "Islam",
      address: "Jl. Uji Verifikasi No. 2",
      rt: "003",
      rw: "004",
      village: "Sukamukti",
      district: "Kemayoran",
      city: "Jakarta Pusat",
      province: "DKI Jakarta",
      postal_code: "10620",
      phone: "080000000004",
      email: "siswa2@ppdb.test",
      father_name: "Bapak Verifikasi",
      father_occupation: "Wiraswasta",
      father_phone: "080000000020",
      mother_name: "Ibu Verifikasi",
      mother_occupation: "Karyawan",
      mother_phone: "080000000021",
      guardian_name: null,
      guardian_occupation: null,
      guardian_phone: null,
      school_origin: "SMP Negeri 2",
      school_address: "Jl. Sekolah No. 2",
      graduation_year: "2026",
      first_choice: "tkj",
      registration_status: "submitted",
      document_status: "complete",
      interview_date: null,
      interview_notes: null,
      selection_status: "pending",
      selection_notes: null,
      accepted_major: null,
      submitted_at: createdAt,
      verified_at: null,
      verified_by: null,
      created_at: createdAt,
      updated_at: updatedAt,
    },
    {
      id: uuidFromSeed("student-3"),
      user_id: siswa3Id,
      nisn: "1122334455",
      nik: "3203030303030303",
      full_name: "Rizky Alfiansyah",
      birth_place: "Surabaya",
      birth_date: "2009-09-09",
      gender: "laki-laki",
      religion: "Islam",
      address: "Jl. Menunggu Jadwal No. 3",
      rt: "005",
      rw: "006",
      village: "Sukajadi",
      district: "Tegalsari",
      city: "Surabaya",
      province: "Jawa Timur",
      postal_code: "60200",
      phone: "080000000005",
      email: "siswa3@ppdb.test",
      father_name: "Agus Alfiansyah",
      father_occupation: "Karyawan",
      father_phone: "080000000030",
      mother_name: "Siti Nuraini",
      mother_occupation: "Wiraswasta",
      mother_phone: "080000000031",
      guardian_name: null,
      guardian_occupation: null,
      guardian_phone: null,
      school_origin: "SMP Negeri 3",
      school_address: "Jl. Sekolah No. 3",
      graduation_year: "2026",
      first_choice: "rpl",
      registration_status: "verified",
      document_status: "verified",
      interview_date: null,
      interview_notes: null,
      selection_status: "pending",
      selection_notes: null,
      accepted_major: null,
      submitted_at: createdAt,
      verified_at: createdAt,
      verified_by: adminId,
      created_at: createdAt,
      updated_at: updatedAt,
    },
  ]

  const documents: Document[] = [
    {
      id: uuidFromSeed("doc-ktp"),
      student_id: students[0].id,
      document_type: "ktp",
      file_url: "https://example.com/mock/ktp.pdf",
      file_name: "ktp.pdf",
      file_size: 123_456,
      status: "verified",
      rejection_reason: null,
      verified_at: createdAt,
      verified_by: adminId,
      created_at: createdAt,
      updated_at: updatedAt,
    },
    {
      id: uuidFromSeed("doc-kk"),
      student_id: students[0].id,
      document_type: "kk",
      file_url: "https://example.com/mock/kk.pdf",
      file_name: "kk.pdf",
      file_size: 222_222,
      status: "verified",
      rejection_reason: null,
      verified_at: createdAt,
      verified_by: adminId,
      created_at: createdAt,
      updated_at: updatedAt,
    },
    // --- documents for student-2 (to show Admin Verifikasi UI) ---
    {
      id: uuidFromSeed("s2-doc-ktp"),
      student_id: students[1].id,
      document_type: "ktp",
      file_url: "https://example.com/mock/s2-ktp.pdf",
      file_name: "ktp-siswa2.pdf",
      file_size: 120_000,
      status: "pending",
      rejection_reason: null,
      verified_at: null,
      verified_by: null,
      created_at: createdAt,
      updated_at: updatedAt,
    },
    {
      id: uuidFromSeed("s2-doc-kk"),
      student_id: students[1].id,
      document_type: "kk",
      file_url: "https://example.com/mock/s2-kk.pdf",
      file_name: "kk-siswa2.pdf",
      file_size: 210_000,
      status: "pending",
      rejection_reason: null,
      verified_at: null,
      verified_by: null,
      created_at: createdAt,
      updated_at: updatedAt,
    },
    {
      id: uuidFromSeed("s2-doc-foto"),
      student_id: students[1].id,
      document_type: "foto",
      file_url: "https://example.com/mock/s2-foto.jpg",
      file_name: "foto-siswa2.jpg",
      file_size: 80_000,
      status: "rejected",
      rejection_reason: "Foto buram, mohon upload ulang yang lebih jelas.",
      verified_at: createdAt,
      verified_by: adminId,
      created_at: createdAt,
      updated_at: updatedAt,
    },
  ]

  const admin_logs: AdminLog[] = [
    {
      id: uuidFromSeed("log-1"),
      admin_id: adminId,
      action: "verify_document",
      target_type: "document",
      target_id: documents[0].id,
      details: { document_type: "ktp" },
      ip_address: "127.0.0.1",
      created_at: createdAt,
    },
    {
      id: uuidFromSeed("log-2"),
      admin_id: adminId,
      action: "reject_document",
      target_type: "document",
      target_id: uuidFromSeed("s2-doc-foto"),
      details: { document_type: "foto", reason: "Foto buram" },
      ip_address: "127.0.0.1",
      created_at: createdAt,
    },
  ]

  const school_settings: SchoolSetting[] = []

  g.__PPDB_MOCK_DB__ = { profiles, students, documents, admin_logs, school_settings }
  return g.__PPDB_MOCK_DB__
}

export function mockDb() {
  return ensureSeedData()
}

export function getMockUserByRole(role: UserRole) {
  const db = mockDb()
  return db.profiles.find((p) => p.role === role) || db.profiles[0]
}

export function getMockProfileByEmail(email: string) {
  const db = mockDb()
  return db.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) || null
}

export function upsertMockProfile(profile: Profile) {
  const db = mockDb()
  const idx = db.profiles.findIndex((p) => p.id === profile.id)
  if (idx >= 0) db.profiles[idx] = profile
  else db.profiles.unshift(profile)
}

