import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken"
import type { UserRole } from "@prisma/client"
import { env } from "../config/env.js"

export type AccessTokenPayload = {
  sub: string
  email: string
  role: UserRole
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN,
    subject: payload.sub,
  }
  return jwt.sign({ email: payload.email, role: payload.role }, env.JWT_SECRET, options)
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET)
  if (typeof decoded === "string" || !decoded || typeof decoded !== "object") {
    throw new Error("Invalid token")
  }
  const obj = decoded as JwtPayload
  const sub = obj.sub
  const email = obj.email as string | undefined
  const role = obj.role as string | undefined
  if (typeof sub !== "string" || typeof email !== "string" || typeof role !== "string") {
    throw new Error("Invalid token payload")
  }
  return { sub, email, role: role as AccessTokenPayload["role"] }
}
