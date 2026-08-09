import { Router } from "express"
import { asyncHandler } from "../lib/async-handler.js"
import { registerSchema, loginSchema } from "../schemas/auth.schema.js"
import * as authService from "../services/auth.service.js"
import { requireAuth } from "../middleware/auth.js"

export const authRouter = Router()

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body)
    const out = await authService.register(body)
    res.status(201).json(out)
  })
)

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body)
    const out = await authService.login(body)
    res.json(out)
  })
)

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const out = await authService.me(req.auth!.userId)
    res.json(out)
  })
)
