import { Router } from "express"
import { asyncHandler } from "../lib/async-handler.js"
import { requireAuth } from "../middleware/auth.js"
import { requireRole } from "../middleware/require-role.js"
import { str } from "../lib/params.js"
import { patchProfileRoleSchema } from "../schemas/settings.schema.js"
import { createAdminSchema, resetPasswordSchema } from "../schemas/profiles.schema.js"
import * as profilesService from "../services/profiles.service.js"
import * as logService from "../services/admin-log.service.js"

export const profilesRouter = Router()

profilesRouter.get(
  "/",
  requireAuth,
  requireRole("superadmin"),
  asyncHandler(async (req, res) => {
    const role = typeof req.query.role === "string" ? req.query.role : undefined
    const limit = req.query.limit ? Number(req.query.limit) : 200
    const data = await profilesService.listProfiles(role, Number.isFinite(limit) ? limit : 200)
    res.json(data) 
  })
)

profilesRouter.patch(
  "/:id",
  requireAuth,
  requireRole("superadmin"),
  asyncHandler(async (req, res) => {
    const { full_name, phone } = req.body as { full_name?: string | null; phone?: string | null }
    const data = await profilesService.patchProfile(str(req.params.id), { full_name, phone })
    res.json({ profile: data })
  })
)

profilesRouter.post(
  "/admins",
  requireAuth,
  requireRole("superadmin"),
  asyncHandler(async (req, res) => {
    const body = createAdminSchema.parse(req.body)
    const data = await profilesService.createAdmin(body)
    const ip = req.ip ?? (req.headers["x-forwarded-for"] as string) ?? null
    await logService.createLog(
      req.auth!.userId,
      {
        action: "admin_create",
        target_type: "profile",
        target_id: data.id,
        details: { email: data.email },
      },
      ip
    )
    res.status(201).json({ profile: data })
  })
)

profilesRouter.patch(
  "/:id/password",
  requireAuth,
  requireRole("superadmin"),
  asyncHandler(async (req, res) => {
    const body = resetPasswordSchema.parse(req.body)
    const out = await profilesService.resetProfilePassword(
      str(req.params.id),
      body,
      req.auth!.userId
    )
    const ip = req.ip ?? (req.headers["x-forwarded-for"] as string) ?? null
    await logService.createLog(
      req.auth!.userId,
      {
        action: "profile_password_reset",
        target_type: "profile",
        target_id: str(req.params.id),
      },
      ip
    )
    res.json(out)
  })
)

profilesRouter.patch(
  "/:id/role",
  requireAuth,
  requireRole("superadmin"),
  asyncHandler(async (req, res) => {
    const body = patchProfileRoleSchema.parse(req.body)
    const data = await profilesService.patchProfileRole(
      str(req.params.id),
      body,
      req.auth!.userId
    )
    const ip = req.ip ?? (req.headers["x-forwarded-for"] as string) ?? null
    await logService.createLog(
      req.auth!.userId,
      {
        action: "profile_role_change",
        target_type: "profile",
        target_id: str(req.params.id),
        details: { role: body.role },
      },
      ip
    )
    res.json({ profile: data })
  })
)

profilesRouter.delete(
  "/:id",
  requireAuth,
  requireRole("superadmin"),
  asyncHandler(async (req, res) => {
    await profilesService.deleteProfile(str(req.params.id), req.auth!.userId)
    const ip = req.ip ?? (req.headers["x-forwarded-for"] as string) ?? null
    await logService.createLog(
      req.auth!.userId,
      {
        action: "profile_delete",
        target_type: "profile",
        target_id: str(req.params.id),
      },
      ip
    )
    res.json({ ok: true })
  })
)
