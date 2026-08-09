import { z } from "zod"
import { DocumentType, DocumentVerificationStatus } from "@prisma/client"

export const upsertStudentDocumentSchema = z
  .object({
    document_type: z.nativeEnum(DocumentType),
    file_url: z.string().url(),
    file_name: z.string().min(1),
    file_size: z.number().int().nonnegative().nullable().optional(),
  })

export const adminPatchDocumentSchema = z
  .object({
    status: z.nativeEnum(DocumentVerificationStatus),
    rejection_reason: z.string().nullable().optional(),
  })
