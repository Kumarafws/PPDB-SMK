import { describe, expect, it } from "@jest/globals"
import { createAdminSchema, resetPasswordSchema } from "../../src/schemas/profiles.schema.js"

describe("createAdminSchema", () => {
  it("menerima payload admin baru yang valid", () => {
    const parsed = createAdminSchema.safeParse({
      full_name: "Admin Uji",
      email: "admin.uji@example.com",
      password: "secret12",
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.full_name).toBe("Admin Uji")
      expect(parsed.data.email).toBe("admin.uji@example.com")
    }
  })

  it("menolak password kurang dari 6 karakter", () => {
    const parsed = createAdminSchema.safeParse({
      full_name: "X",
      email: "a@b.com",
      password: "12345",
    })
    expect(parsed.success).toBe(false)
  })

  it("menolak email tidak valid", () => {
    const parsed = createAdminSchema.safeParse({
      full_name: "X",
      email: "bukan-email",
      password: "123456",
    })
    expect(parsed.success).toBe(false)
  })

  it("menolak nama kosong", () => {
    const parsed = createAdminSchema.safeParse({
      full_name: "",
      email: "a@b.com",
      password: "123456",
    })
    expect(parsed.success).toBe(false)
  })
})

describe("resetPasswordSchema", () => {
  it("menerima password minimal 6 karakter", () => {
    const parsed = resetPasswordSchema.safeParse({ password: "abcdef" })
    expect(parsed.success).toBe(true)
  })

  it("menolak password pendek", () => {
    const parsed = resetPasswordSchema.safeParse({ password: "12345" })
    expect(parsed.success).toBe(false)
  })
})
