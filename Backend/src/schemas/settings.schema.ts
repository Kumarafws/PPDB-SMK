import { z } from "zod"

export const putSettingSchema = z.object({
  value: z.string().nullable(),
})

export const createAdminLogSchema = z.object({
  action: z.string().min(1),
  target_type: z.string().nullable().optional(),
  target_id: z.string().nullable().optional(),
  details: z.record(z.string(), z.unknown()).nullable().optional(),
})

export const patchProfileRoleSchema = z.object({
  role: z.enum(["siswa", "admin", "superadmin"]),
})
