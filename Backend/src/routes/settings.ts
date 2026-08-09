import { Router } from "express"
import { asyncHandler } from "../lib/async-handler.js"
import { requireAuth } from "../middleware/auth.js"
import { requireRole } from "../middleware/require-role.js"
import { str } from "../lib/params.js"
import { putSettingSchema } from "../schemas/settings.schema.js"
import * as settingsService from "../services/settings.service.js"

export const settingsRouter = Router()

settingsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const data = await settingsService.listSettings()
    res.json({ settings: data })
  })
)

settingsRouter.get(
  "/key/:key",
  asyncHandler(async (req, res) => {
    const data = await settingsService.getSetting(str(req.params.key))
    res.json({ key: data.key, value: data.value })
  })
)

settingsRouter.put(
  "/key/:key",
  requireAuth,
  requireRole("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    const body = putSettingSchema.parse(req.body)
    const data = await settingsService.putSetting(str(req.params.key), body.value ?? null)
    res.json({ key: data.key, value: data.value })
  })
)
