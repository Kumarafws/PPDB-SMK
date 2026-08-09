import { prisma } from "../lib/prisma.js"
import { adminLogToJson } from "../mappers/json.js"
import type { createAdminLogSchema } from "../schemas/settings.schema.js"
import type { z } from "zod"

export async function createLog(
  adminId: string,
  input: z.infer<typeof createAdminLogSchema>,
  ip: string | null
) {
  const row = await prisma.adminLog.create({
    data: {
      adminId,
      action: input.action,
      targetType: input.target_type ?? null,
      targetId: input.target_id ?? null,
      detailsJson: input.details ? JSON.stringify(input.details) : null,
      ipAddress: ip,
    },
  })
  return adminLogToJson(row)
}

export async function listLogs(limit = 100) {
  const [total, rows] = await prisma.$transaction([
    prisma.adminLog.count(),
    prisma.adminLog.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 500),
      include: { admin: true },
    }),
  ])

  const data = rows.map((row) => ({
    ...adminLogToJson(row),
    admin_name: row.admin?.fullName ?? null,
    admin_email: row.admin?.email ?? null,
  }))

  return { data, total }
}
