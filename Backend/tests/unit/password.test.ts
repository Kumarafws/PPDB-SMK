import { describe, expect, it } from "@jest/globals"
import { hashPassword, verifyPassword } from "../../src/lib/password.js"

describe("password", () => {
  it("hash tidak sama dengan plain text", async () => {
    const plain = "rahasia123"
    const hash = await hashPassword(plain)
    expect(hash).not.toBe(plain)
    expect(hash.length).toBeGreaterThan(20)
  })

  it("verifyPassword true untuk password yang sama", async () => {
    const plain = "sandinyaa"
    const hash = await hashPassword(plain)
    await expect(verifyPassword(plain, hash)).resolves.toBe(true)
  })

  it("verifyPassword false untuk password salah", async () => {
    const hash = await hashPassword("satu")
    await expect(verifyPassword("dua", hash)).resolves.toBe(false)
  })
})
