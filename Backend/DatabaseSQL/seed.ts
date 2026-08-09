/// <reference types="node" />
import { PrismaClient, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10)

  const admin = await prisma.profile.upsert({
    where: { email: "admin@ppdb.local" },
    update: {},
    create: {
      email: "admin@ppdb.local",
      passwordHash,
      fullName: "Admin Demo",
      role: UserRole.admin,
      phone: "0800000001",
    },
  })

  await prisma.profile.upsert({
    where: { email: "superadmin@ppdb.local" },
    update: {},
    create: {
      email: "superadmin@ppdb.local",
      passwordHash,
      fullName: "Superadmin Demo",
      role: UserRole.superadmin,
      phone: "0800000002",
    },
  })

  const siswaEmail = "siswa@ppdb.local"
  const siswaPass = await bcrypt.hash("siswa123", 10)
  const siswaProfile = await prisma.profile.upsert({
    where: { email: siswaEmail },
    update: {},
    create: {
      email: siswaEmail,
      passwordHash: siswaPass,
      fullName: "Calon Siswa Demo",
      role: UserRole.siswa,
      phone: "0800000003",
    },
  })

  await prisma.student.upsert({
    where: { userId: siswaProfile.id },
    update: {},
    create: {
      userId: siswaProfile.id,
      fullName: "Calon Siswa Demo",
      nisn: "0012345678",
      registrationStatus: "draft",
      documentStatus: "pending",
    },
  })

  await prisma.schoolSetting.upsert({
    where: { key: "academic_year_config" },
    update: {},
    create: {
      key: "academic_year_config",
      value: JSON.stringify({
        years: [
          {
            id: "demo-year",
            name: "2026/2027",
            is_active: true,
            waves: [
              { type: "peminatan", label: "Gelombang Peminatan", start_at: "2026-01-01T00:00:00.000Z", end_at: "2026-12-31T23:59:59.000Z" },
            ],
          },
        ],
      }),
    },
  })

  console.log("Seed OK. Akun demo:")
  console.log("  admin@ppdb.local / admin123")
  console.log("  superadmin@ppdb.local / admin123")
  console.log("  siswa@ppdb.local / siswa123")
  console.log("Admin profile id:", admin.id)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
