import { AppError } from "../lib/app-error.js"
import { prisma } from "../lib/prisma.js"
import { hashPassword, verifyPassword } from "../lib/password.js"
import { signAccessToken } from "../lib/jwt.js"
import { profileToJson, studentToJson } from "../mappers/json.js"
import type { registerSchema, loginSchema } from "../schemas/auth.schema.js"
import type { z } from "zod"

export async function register(input: z.infer<typeof registerSchema>) {
  const exists = await prisma.profile.findUnique({ where: { email: input.email } })
  if (exists) {
    throw new AppError(409, "Email sudah terdaftar")
  }

  const passwordHash = await hashPassword(input.password)

  const result = await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.create({
      data: {
        email: input.email,
        passwordHash,
        fullName: input.full_name,
        phone: input.phone ?? null,
        role: "siswa",
      },
    })
    const student = await tx.student.create({
      data: {
        userId: profile.id,
        fullName: input.full_name,
        registrationStatus: "draft",
        documentStatus: "pending",
      },
    })
    return { profile, student }
  })

  const token = signAccessToken({
    sub: result.profile.id,
    email: result.profile.email,
    role: result.profile.role,
  })

  return {
    access_token: token,
    token_type: "Bearer" as const,
    user: profileToJson(result.profile),
    student: studentToJson(result.student),
  }
}

export async function login(input: z.infer<typeof loginSchema>) {
  const profile = await prisma.profile.findUnique({ where: { email: input.email } })
  if (!profile) {
    throw new AppError(401, "Email atau password salah")
  }
  const ok = await verifyPassword(input.password, profile.passwordHash)
  if (!ok) {
    throw new AppError(401, "Email atau password salah")
  }

  const student = await prisma.student.findUnique({ where: { userId: profile.id } })

  const token = signAccessToken({
    sub: profile.id,
    email: profile.email,
    role: profile.role,
  })

  return {
    access_token: token,
    token_type: "Bearer" as const,
    user: profileToJson(profile),
    student: student ? studentToJson(student) : null,
  }
}

export async function me(profileId: string) {
  const profile = await prisma.profile.findUnique({ where: { id: profileId } })
  if (!profile) {
    throw new AppError(404, "User tidak ditemukan")
  }
  const student = await prisma.student.findUnique({ where: { userId: profileId } })
  return {
    user: profileToJson(profile),
    student: student ? studentToJson(student) : null,
  }
}
