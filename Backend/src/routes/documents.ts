import { Router } from "express"
import { asyncHandler } from "../lib/async-handler.js"
import { requireAuth } from "../middleware/auth.js"
import { requireRole } from "../middleware/require-role.js"
import { str } from "../lib/params.js"
import { adminPatchDocumentSchema } from "../schemas/document.schema.js"
import * as documentService from "../services/document.service.js"
import * as logService from "../services/admin-log.service.js"

export const documentsRouter = Router()

documentsRouter.patch(
  "/:id",
  requireAuth,
  requireRole("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    const body = adminPatchDocumentSchema.parse(req.body)
    const adminId = req.auth!.userId
    const out = await documentService.adminPatchDocument(str(req.params.id), adminId, body)
    const ip = req.ip ?? (req.headers["x-forwarded-for"] as string) ?? null
    await logService.createLog(
      adminId,
      {
        action: "document_verification",
        target_type: "document",
        target_id: str(req.params.id),
        details: { status: body.status },
      },
      ip
    )
    res.json(out)
  })
)
