import { z } from "zod"
import { RegistrationStatus, SelectionStatus, StudentDocumentStatus } from "@prisma/client"

const optionalStr = z.string().nullable().optional()

export const studentSelfPatchSchema = z
  .object({
    nisn: optionalStr,
    nik: optionalStr,
    full_name: z.string().min(1).optional(),
    birth_place: optionalStr,
    birth_date: z.union([z.string(), z.null()]).optional(),
    gender: optionalStr,
    religion: optionalStr,
    address: optionalStr,
    rt: optionalStr,
    rw: optionalStr,
    village: optionalStr,
    district: optionalStr,
    city: optionalStr,
    province: optionalStr,
    postal_code: optionalStr,
    phone: optionalStr,
    email: optionalStr,
    anak_ke: optionalStr,
    jumlah_saudara: optionalStr,
    registration_info_source: optionalStr,
    no_kip: optionalStr,
    father_name: optionalStr,
    father_occupation: optionalStr,
    father_phone: optionalStr,
    mother_name: optionalStr,
    mother_occupation: optionalStr,
    mother_phone: optionalStr,
    guardian_name: optionalStr,
    guardian_occupation: optionalStr,
    guardian_phone: optionalStr,
    school_origin: optionalStr,
    school_address: optionalStr,
    graduation_year: optionalStr,
    first_choice: optionalStr,
    registration_status: z.nativeEnum(RegistrationStatus).optional(),
    document_status: z.nativeEnum(StudentDocumentStatus).optional(),
    submitted_at: z.union([z.string(), z.null()]).optional(),
  })

export const studentAdminPatchSchema = studentSelfPatchSchema
  .extend({
    interview_date: z.union([z.string(), z.null()]).optional(),
    interview_notes: optionalStr,
    selection_status: z.nativeEnum(SelectionStatus).nullable().optional(),
    selection_notes: optionalStr,
    accepted_major: optionalStr,
    verified_at: z.union([z.string(), z.null()]).optional(),
    verified_by: z.union([z.string(), z.null()]).optional(),
  })

export const listStudentsQuerySchema = z.object({
  status: z
    .string()
    .optional()
    .transform((val) =>
      val ? val.split(",").map((s) => s.trim()).filter(Boolean) : undefined
    )
    .pipe(
      z.array(z.nativeEnum(RegistrationStatus)).optional()
    ),
  registration_status: z.nativeEnum(RegistrationStatus).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(20),
})
