import type { NextFunction, Request, Response } from "express"
import type { UserRole } from "@prisma/client"
import { AppError } from "../lib/app-error.js"

export function requireRole(...allowed: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new AppError(401, "Unauthorized"))
    }
    if (!allowed.includes(req.auth.role)) {
      return next(new AppError(403, "Forbidden"))
    }
    next()
  }
}
