import { describe, expect, it } from "@jest/globals"
import { signAccessToken, verifyAccessToken } from "../../src/lib/jwt.js"

describe("JWT access token", () => {
  it("sign + verify mengembalikan payload yang sama", () => {
    const payload = {
      sub: "user-id-1",
      email: "u@test.com",
      role: "siswa" as const,
    }
    const token = signAccessToken(payload)
    const decoded = verifyAccessToken(token)
    expect(decoded.sub).toBe(payload.sub)
    expect(decoded.email).toBe(payload.email)
    expect(decoded.role).toBe(payload.role)
  })

  it("token tidak valid melempar error", () => {
    expect(() => verifyAccessToken("bukan.jwt.token")).toThrow()
  })
})
