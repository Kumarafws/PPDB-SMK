import { AppError } from "../lib/app-error.js"
import { prisma } from "../lib/prisma.js"
import { hashPassword } from "../lib/password.js"
import { profileToJson } from "../mappers/json.js"
import type { patchProfileRoleSchema } from "../schemas/settings.schema.js"
import type { createAdminSchema, resetPasswordSchema } from "../schemas/profiles.schema.js"
import type { z } from "zod"

export async function listProfiles(role?: string, limit = 200) {
  const where = role ? { role: role as "siswa" | "admin" | "superadmin" } : {}
  const rows = await prisma.profile.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 500),
  })
  const total = await prisma.profile.count({ where })
  return { data: rows.map(profileToJson), total }
}

export async function patchProfile(
  targetId: string,
  body: { full_name?: string | null; phone?: string | null }
) {
  const target = await prisma.profile.findUnique({ where: { id: targetId } })
  if (!target) {
    throw new AppError(404, "Pengguna tidak ditemukan")
  }
  const updated = await prisma.profile.update({
    where: { id: targetId },
    data: {
      ...(body.full_name !== undefined ? { fullName: body.full_name } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
    },
  })
  return profileToJson(updated)
}

export async function createAdmin(body: z.infer<typeof createAdminSchema>) {
  const exists = await prisma.profile.findUnique({ where: { email: body.email } })
  if (exists) {
    throw new AppError(409, "Email sudah terdaftar")
  }

  const passwordHash = await hashPassword(body.password)
  const created = await prisma.profile.create({
    data: {
      email: body.email,
      fullName: body.full_name,
      passwordHash,
      role: "admin",
    },
  })
  return profileToJson(created)
}

export async function resetProfilePassword(
  targetId: string,
  body: z.infer<typeof resetPasswordSchema>,
  actorId: string
) {
  if (targetId === actorId) {
    throw new AppError(400, "Tidak dapat mengubah password akun sendiri dari menu ini")
  }
  const target = await prisma.profile.findUnique({ where: { id: targetId } })
  if (!target) {
    throw new AppError(404, "Pengguna tidak ditemukan")
  }
  const passwordHash = await hashPassword(body.password)
  await prisma.profile.update({
    where: { id: targetId },
    data: { passwordHash },
  })
  return { ok: true }
}

export async function patchProfileRole(
  targetId: string,
  body: z.infer<typeof patchProfileRoleSchema>,
  actorId: string
) {
  if (targetId === actorId) {
    throw new AppError(400, "Tidak dapat mengubah role akun sendiri")
  }
  const target = await prisma.profile.findUnique({ where: { id: targetId } })
  if (!target) {
    throw new AppError(404, "Pengguna tidak ditemukan")
  }
  const updated = await prisma.profile.update({
    where: { id: targetId },
    data: { role: body.role },
  })
  return profileToJson(updated)
}

export async function deleteProfile(targetId: string, actorId: string) {
  if (targetId === actorId) {
    throw new AppError(400, "Tidak dapat menghapus akun sendiri")
  }
  const target = await prisma.profile.findUnique({ where: { id: targetId } })
  if (!target) {
    throw new AppError(404, "Pengguna tidak ditemukan")
  }
  await prisma.profile.delete({ where: { id: targetId } })
  return { ok: true }
}
