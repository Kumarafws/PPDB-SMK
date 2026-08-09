import { Router } from "express"
import { asyncHandler } from "../lib/async-handler.js"
import { requireAuth } from "../middleware/auth.js"
import { requireRole } from "../middleware/require-role.js"
import { createAdminLogSchema } from "../schemas/settings.schema.js"
import * as logService from "../services/admin-log.service.js"

export const adminRouter = Router()

adminRouter.get(
  "/logs",
  requireAuth,
  requireRole("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 100
    const result = await logService.listLogs(Number.isFinite(limit) ? limit : 100)
    res.json(result)
  })
)

adminRouter.post(
  "/logs",
  requireAuth,
  requireRole("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    const body = createAdminLogSchema.parse(req.body)
    const ip = req.ip ?? (req.headers["x-forwarded-for"] as string) ?? null
    const row = await logService.createLog(req.auth!.userId, body, ip)
    res.status(201).json({ log: row })
  })
)
