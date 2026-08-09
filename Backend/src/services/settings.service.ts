import { AppError } from "../lib/app-error.js"
import { prisma } from "../lib/prisma.js"
import { schoolSettingToJson } from "../mappers/json.js"

export async function listSettings() {
  const rows = await prisma.schoolSetting.findMany({ orderBy: { key: "asc" } })
  return rows.map(schoolSettingToJson)
}

export async function getSetting(key: string) {
  const row = await prisma.schoolSetting.findUnique({ where: { key } })
  if (!row) {
    throw new AppError(404, "Setting tidak ditemukan")
  }
  return schoolSettingToJson(row)
}

export async function putSetting(key: string, value: string | null) {
  const row = await prisma.schoolSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  })
  return schoolSettingToJson(row)
}
