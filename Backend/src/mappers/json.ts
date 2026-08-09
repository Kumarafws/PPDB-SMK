import type { AdminLog, Document, Profile, SchoolSetting, Student } from "@prisma/client"

function iso(d: Date | null | undefined): string | null {
  return d ? d.toISOString() : null
}

function dateOnly(d: Date | null | undefined): string | null {
  if (!d) return null
  return d.toISOString().slice(0, 10)
}

export function profileToJson(p: Profile) {
  return {
    id: p.id,
    email: p.email,
    full_name: p.fullName,
    role: p.role,
    phone: p.phone,
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
  }
}

export function studentToJson(s: Student) {
  return {
    id: s.id,
    user_id: s.userId,
    nisn: s.nisn,
    nik: s.nik,
    full_name: s.fullName,
    birth_place: s.birthPlace,
    birth_date: dateOnly(s.birthDate),
    gender: s.gender,
    religion: s.religion,
    address: s.address,
    rt: s.rt,
    rw: s.rw,
    village: s.village,
    district: s.district,
    city: s.city,
    province: s.province,
    postal_code: s.postalCode,
    phone: s.phone,
    email: s.email,
    anak_ke: s.anakKe,
    jumlah_saudara: s.jumlahSaudara,
    registration_info_source: s.registrationInfoSource,
    no_kip: s.noKip,
    father_name: s.fatherName,
    father_occupation: s.fatherOccupation,
    father_phone: s.fatherPhone,
    mother_name: s.motherName,
    mother_occupation: s.motherOccupation,
    mother_phone: s.motherPhone,
    guardian_name: s.guardianName,
    guardian_occupation: s.guardianOccupation,
    guardian_phone: s.guardianPhone,
    school_origin: s.schoolOrigin,
    school_address: s.schoolAddress,
    graduation_year: s.graduationYear,
    first_choice: s.firstChoice,
    registration_status: s.registrationStatus,
    document_status: s.documentStatus,
    interview_date: iso(s.interviewDate),
    interview_notes: s.interviewNotes,
    selection_status: s.selectionStatus,
    selection_notes: s.selectionNotes,
    accepted_major: s.acceptedMajor,
    submitted_at: iso(s.submittedAt),
    verified_at: iso(s.verifiedAt),
    verified_by: s.verifierId,
    created_at: s.createdAt.toISOString(),
    updated_at: s.updatedAt.toISOString(),
  }
}

export function documentToJson(d: Document) {
  return {
    id: d.id,
    student_id: d.studentId,
    document_type: d.documentType,
    file_url: d.fileUrl,
    file_name: d.fileName,
    file_size: d.fileSize,
    status: d.status,
    rejection_reason: d.rejectionReason,
    verified_at: iso(d.verifiedAt),
    verified_by: d.verifiedById,
    created_at: d.createdAt.toISOString(),
    updated_at: d.updatedAt.toISOString(),
  }
}

export function adminLogToJson(l: AdminLog) {
  let details: Record<string, unknown> | null = null
  if (l.detailsJson) {
    try {
      details = JSON.parse(l.detailsJson) as Record<string, unknown>
    } catch {
      details = null
    }
  }
  return {
    id: l.id,
    admin_id: l.adminId,
    action: l.action,
    target_type: l.targetType,
    target_id: l.targetId,
    details,
    ip_address: l.ipAddress,
    created_at: l.createdAt.toISOString(),
  }
}

export function schoolSettingToJson(s: SchoolSetting) {
  return {
    id: s.id,
    key: s.key,
    value: s.value,
    created_at: s.createdAt.toISOString(),
    updated_at: s.updatedAt.toISOString(),
  }
}
