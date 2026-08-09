import type { Prisma } from "@prisma/client"
import { AppError } from "../lib/app-error.js"
import { prisma } from "../lib/prisma.js"
import { studentToJson } from "../mappers/json.js"
import type { listStudentsQuerySchema, studentAdminPatchSchema, studentSelfPatchSchema } from "../schemas/student.schema.js"
import type { z } from "zod"

function parseDateInput(v: string | null | undefined): Date | null | undefined {
  if (v === undefined) return undefined
  if (v === null) return null
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) {
    throw new AppError(400, "Format tanggal tidak valid")
  }
  return d
}

function selfPatchToPrisma(
  body: z.infer<typeof studentSelfPatchSchema>
): Prisma.StudentUpdateInput {
  const data: Prisma.StudentUpdateInput = {}
  if (body.nisn !== undefined) data.nisn = body.nisn
  if (body.nik !== undefined) data.nik = body.nik
  if (body.full_name !== undefined) data.fullName = body.full_name
  if (body.birth_place !== undefined) data.birthPlace = body.birth_place
  if (body.birth_date !== undefined) data.birthDate = parseDateInput(body.birth_date)
  if (body.gender !== undefined) data.gender = body.gender
  if (body.religion !== undefined) data.religion = body.religion
  if (body.address !== undefined) data.address = body.address
  if (body.rt !== undefined) data.rt = body.rt
  if (body.rw !== undefined) data.rw = body.rw
  if (body.village !== undefined) data.village = body.village
  if (body.district !== undefined) data.district = body.district
  if (body.city !== undefined) data.city = body.city
  if (body.province !== undefined) data.province = body.province
  if (body.postal_code !== undefined) data.postalCode = body.postal_code
  if (body.phone !== undefined) data.phone = body.phone
  if (body.email !== undefined) data.email = body.email
  if (body.anak_ke !== undefined) data.anakKe = body.anak_ke
  if (body.jumlah_saudara !== undefined) data.jumlahSaudara = body.jumlah_saudara
  if (body.registration_info_source !== undefined) {
    data.registrationInfoSource = body.registration_info_source
  }
  if (body.no_kip !== undefined) data.noKip = body.no_kip
  if (body.father_name !== undefined) data.fatherName = body.father_name
  if (body.father_occupation !== undefined) data.fatherOccupation = body.father_occupation
  if (body.father_phone !== undefined) data.fatherPhone = body.father_phone
  if (body.mother_name !== undefined) data.motherName = body.mother_name
  if (body.mother_occupation !== undefined) data.motherOccupation = body.mother_occupation
  if (body.mother_phone !== undefined) data.motherPhone = body.mother_phone
  if (body.guardian_name !== undefined) data.guardianName = body.guardian_name
  if (body.guardian_occupation !== undefined) data.guardianOccupation = body.guardian_occupation
  if (body.guardian_phone !== undefined) data.guardianPhone = body.guardian_phone
  if (body.school_origin !== undefined) data.schoolOrigin = body.school_origin
  if (body.school_address !== undefined) data.schoolAddress = body.school_address
  if (body.graduation_year !== undefined) data.graduationYear = body.graduation_year
  if (body.first_choice !== undefined) data.firstChoice = body.first_choice
  if (body.registration_status !== undefined) data.registrationStatus = body.registration_status
  if (body.document_status !== undefined) data.documentStatus = body.document_status
  if (body.submitted_at !== undefined) data.submittedAt = parseDateInput(body.submitted_at)
  return data
}

function adminPatchToPrisma(
  body: z.infer<typeof studentAdminPatchSchema>
): Prisma.StudentUpdateInput {
  const base = selfPatchToPrisma(body)
  if (body.interview_date !== undefined) {
    base.interviewDate = parseDateInput(body.interview_date)
  }
  if (body.interview_notes !== undefined) base.interviewNotes = body.interview_notes
  if (body.selection_status !== undefined) base.selectionStatus = body.selection_status
  if (body.selection_notes !== undefined) base.selectionNotes = body.selection_notes
  if (body.accepted_major !== undefined) base.acceptedMajor = body.accepted_major
  if (body.verified_at !== undefined) base.verifiedAt = parseDateInput(body.verified_at)
  if (body.verified_by !== undefined) {
    base.verifier = body.verified_by
      ? { connect: { id: body.verified_by } }
      : { disconnect: true }
  }
  return base
}

export async function getStudentForUser(userId: string) {
  const student = await prisma.student.findUnique({ where: { userId } })
  return student ? studentToJson(student) : null
}

export async function patchStudentForUser(userId: string, body: z.infer<typeof studentSelfPatchSchema>) {
  const student = await prisma.student.findUnique({ where: { userId } })
  if (!student) {
    throw new AppError(404, "Data siswa tidak ditemukan")
  }
  const updated = await prisma.student.update({
    where: { id: student.id },
    data: selfPatchToPrisma(body),
  })
  return studentToJson(updated)
}

export async function listStudents(query: z.infer<typeof listStudentsQuerySchema>) {
  const { page, limit, registration_status, status, search } = query
  const where: Prisma.StudentWhereInput = {}

  if (status && status.length > 0) {
    where.registrationStatus = { in: status }
  } else if (registration_status) {
    where.registrationStatus = registration_status
  }

  if (search?.trim()) {
    const q = search.trim()
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { nisn: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
    ]
  }

  const [total, rows] = await prisma.$transaction([
    prisma.student.count({ where }),
    prisma.student.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])
  return {
    data: rows.map(studentToJson),
    total,
    meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
  }
}

export async function getStudentById(id: string) {
  const student = await prisma.student.findUnique({ where: { id } })
  if (!student) {
    throw new AppError(404, "Siswa tidak ditemukan")
  }
  return studentToJson(student)
}

export async function patchStudentById(id: string, body: z.infer<typeof studentAdminPatchSchema>) {
  const student = await prisma.student.findUnique({ where: { id } })
  if (!student) {
    throw new AppError(404, "Siswa tidak ditemukan")
  }
  const updated = await prisma.student.update({
    where: { id },
    data: adminPatchToPrisma(body),
  })
  return studentToJson(updated)
}
