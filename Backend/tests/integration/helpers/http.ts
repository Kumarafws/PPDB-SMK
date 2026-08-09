import type { Express } from "express"
import request from "supertest"

export async function loginAndGetToken(
  app: Express,
  email: string,
  password: string
): Promise<string> {
  const res = await request(app).post("/api/auth/login").send({ email, password })
  if (res.status !== 200) {
    throw new Error(`Login gagal (${res.status}): ${JSON.stringify(res.body)}`)
  }
  const token = res.body.access_token as string | undefined
  if (!token) {
    throw new Error("Respons login tanpa access_token")
  }
  return token
}

export function bearer(token: string) {
  return { Authorization: `Bearer ${token}` }
}
