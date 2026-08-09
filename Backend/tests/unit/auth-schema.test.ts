import { describe, expect, it } from "@jest/globals"
import { loginSchema, registerSchema } from "../../src/schemas/auth.schema.js"

describe("registerSchema", () => {
  it("menerima registrasi valid", () => {
    const out = registerSchema.parse({
      email: "siswa@test.com",
      password: "sandinya",
      full_name: "Siswa Test",
      phone: "081234567890",
    })
    expect(out.email).toBe("siswa@test.com")
    expect(out.phone).toBe("081234567890")
  })

  it("telepon opsional boleh dihilangkan", () => {
    const out = registerSchema.parse({
      email: "a@b.com",
      password: "123456",
      full_name: "Nama",
    })
    expect(out.phone).toBeUndefined()
  })

  it("menolak email tidak valid", () => {
    expect(() =>
      registerSchema.parse({
        email: "invalid",
        password: "123456",
        full_name: "X",
      })
    ).toThrow()
  })

  it("menolak password kurang dari 6 karakter", () => {
    expect(() =>
      registerSchema.parse({
        email: "a@b.com",
        password: "12345",
        full_name: "X",
      })
    ).toThrow()
  })
})

describe("loginSchema", () => {
  it("menerima login valid", () => {
    const out = loginSchema.parse({
      email: "user@test.com",
      password: "apa saja",
    })
    expect(out.password.length).toBeGreaterThan(0)
  })

  it("menolak password kosong jika min(1) tidak terpenuhi — string kosong", () => {
    expect(() =>
      loginSchema.parse({
        email: "a@b.com",
        password: "",
      })
    ).toThrow()
  })
})
