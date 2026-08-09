import type { NextFunction, Request, Response } from "express"
import { ZodError } from "zod"
import { AppError } from "../lib/app-error.js"

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details != null ? { details: err.details } : {}),
    })
  }
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation error",
      details: err.flatten(),
    })
  }
  console.error(err)
  return res.status(500).json({ error: "Internal server error" })
}
