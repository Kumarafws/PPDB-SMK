/**
 * Akun tetap untuk integration test (upsert — aman dijalankan berulang).
 * Pastikan DATABASE_URL di .env mengarah ke database pengujian (mis. PPDB_testing).
 */
import { UserRole } from "@prisma/client"
import { prisma } from "../../../src/lib/prisma.js"
import { hashPassword } from "../../../src/lib/password.js"

export const INTEGRATION_SUPERADMIN_EMAIL = "superadmin.integration@ppdb.test"
export const INTEGRATION_SUPERADMIN_PASSWORD = "IntegrationSuper1"

export const INTEGRATION_SISWA_EMAIL = "siswa.integration@ppdb.test"
export const INTEGRATION_SISWA_PASSWORD = "IntegrationSiswa1"

export type IntegrationAccounts = {
  superadminId: string
  siswaUserId: string
}

export async function ensureIntegrationTestAccounts(): Promise<IntegrationAccounts> {
  const hashSuper = await hashPassword(INTEGRATION_SUPERADMIN_PASSWORD)
  const superProfile = await prisma.profile.upsert({
    where: { email: INTEGRATION_SUPERADMIN_EMAIL },
    update: {
      passwordHash: hashSuper,
      role: UserRole.superadmin,
      fullName: "Super Integration",
    },
    create: {
      email: INTEGRATION_SUPERADMIN_EMAIL,
      passwordHash: hashSuper,
      fullName: "Super Integration",
      role: UserRole.superadmin,
      phone: "08999000001",
    },
  })

  const hashSiswa = await hashPassword(INTEGRATION_SISWA_PASSWORD)
  const siswaProfile = await prisma.profile.upsert({
    where: { email: INTEGRATION_SISWA_EMAIL },
    update: {
      passwordHash: hashSiswa,
      role: UserRole.siswa,
      fullName: "Siswa Integration",
    },
    create: {
      email: INTEGRATION_SISWA_EMAIL,
      passwordHash: hashSiswa,
      fullName: "Siswa Integration",
      role: UserRole.siswa,
      phone: "08999000002",
    },
  })

  await prisma.student.upsert({
    where: { userId: siswaProfile.id },
    update: { fullName: "Siswa Integration" },
    create: {
      userId: siswaProfile.id,
      fullName: "Siswa Integration",
      registrationStatus: "draft",
      documentStatus: "pending",
    },
  })

  return { superadminId: superProfile.id, siswaUserId: siswaProfile.id }
}

export async function deleteProfileByEmail(email: string): Promise<void> {
  await prisma.profile.deleteMany({ where: { email } })
}
