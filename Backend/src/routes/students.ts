import { Router } from "express"
import { asyncHandler } from "../lib/async-handler.js"
import { requireAuth } from "../middleware/auth.js"
import { requireRole } from "../middleware/require-role.js"
import { str } from "../lib/params.js"
import {
  listStudentsQuerySchema,
  studentAdminPatchSchema,
  studentSelfPatchSchema,
} from "../schemas/student.schema.js"
import { upsertStudentDocumentSchema } from "../schemas/document.schema.js"
import * as studentService from "../services/student.service.js"
import * as documentService from "../services/document.service.js"

export const studentsRouter = Router()

studentsRouter.get(
  "/me",
  requireAuth,
  requireRole("siswa"),
  asyncHandler(async (req, res) => {
    const data = await studentService.getStudentForUser(req.auth!.userId)
    res.json({ student: data })
  })
)

studentsRouter.patch(
  "/me",
  requireAuth,
  requireRole("siswa"),
  asyncHandler(async (req, res) => {
    const body = studentSelfPatchSchema.parse(req.body)
    const data = await studentService.patchStudentForUser(req.auth!.userId, body)
    res.json({ student: data })
  })
)

studentsRouter.get(
  "/me/documents",
  requireAuth,
  requireRole("siswa"),
  asyncHandler(async (req, res) => {
    const data = await documentService.listDocumentsForUser(req.auth!.userId)
    res.json({ documents: data })
  })
)

studentsRouter.post(
  "/me/documents",
  requireAuth,
  requireRole("siswa"),
  asyncHandler(async (req, res) => {
    const body = upsertStudentDocumentSchema.parse(req.body)
    const data = await documentService.upsertDocumentForUser(req.auth!.userId, body)
    res.status(201).json({ document: data })
  })
)

studentsRouter.delete(
  "/me/documents/:documentId",
  requireAuth,
  requireRole("siswa"),
  asyncHandler(async (req, res) => {
    const out = await documentService.deleteDocumentForUser(
      req.auth!.userId,
      str(req.params.documentId)
    )
    res.json(out)
  })
)

studentsRouter.get(
  "/",
  requireAuth,
  requireRole("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    const query = listStudentsQuerySchema.parse(req.query)
    const out = await studentService.listStudents(query)
    res.json(out)
  })
)

studentsRouter.get(
  "/:id",
  requireAuth,
  requireRole("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    const data = await studentService.getStudentById(str(req.params.id))
    res.json({ student: data })
  })
)

studentsRouter.patch(
  "/:id",
  requireAuth,
  requireRole("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    const body = studentAdminPatchSchema.parse(req.body)
    const data = await studentService.patchStudentById(str(req.params.id), body)
    res.json({ student: data })
  })
)

studentsRouter.get(
  "/:id/documents",
  requireAuth,
  requireRole("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    const data = await documentService.listDocumentsForStudentId(str(req.params.id))
    res.json({ documents: data })
  })
)
