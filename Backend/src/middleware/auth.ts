import type { NextFunction, Request, Response } from "express"
import { AppError } from "../lib/app-error.js"
import { verifyAccessToken } from "../lib/jwt.js"

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError(401, "Unauthorized"))
  }
  const token = header.slice("Bearer ".length).trim()
  if (!token) {
    return next(new AppError(401, "Unauthorized"))
  }
  try {
    const { sub, email, role } = verifyAccessToken(token)
    req.auth = { userId: sub, email, role }
    next()
  } catch {
    next(new AppError(401, "Invalid or expired token"))
  }
}
