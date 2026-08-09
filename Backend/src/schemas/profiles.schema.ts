import { z } from "zod"

export const createAdminSchema = z.object({
  full_name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email(),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password minimal 6 karakter"),
})
