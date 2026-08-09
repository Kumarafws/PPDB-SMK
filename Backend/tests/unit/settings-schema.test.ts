import { describe, expect, it } from "@jest/globals"
import {
  createAdminLogSchema,
  patchProfileRoleSchema,
  putSettingSchema,
} from "../../src/schemas/settings.schema.js"

describe("putSettingSchema", () => {
  it("menerima value string atau null", () => {
    expect(putSettingSchema.parse({ value: "teks" }).value).toBe("teks")
    expect(putSettingSchema.parse({ value: null }).value).toBeNull()
  })
})

describe("createAdminLogSchema", () => {
  it("menerima log minimal", () => {
    const out = createAdminLogSchema.parse({
      action: "profile_role_change",
      target_type: "profile",
      target_id: "uuid-here",
      details: { role: "admin" },
    })
    expect(out.action).toBe("profile_role_change")
    expect(out.details?.role).toBe("admin")
  })

  it("detail boleh null", () => {
    const out = createAdminLogSchema.parse({
      action: "login",
      details: null,
    })
    expect(out.details).toBeNull()
  })
})

describe("patchProfileRoleSchema", () => {
  it("menerima salah satu role enum", () => {
    expect(patchProfileRoleSchema.parse({ role: "siswa" }).role).toBe("siswa")
    expect(patchProfileRoleSchema.parse({ role: "admin" }).role).toBe("admin")
    expect(patchProfileRoleSchema.parse({ role: "superadmin" }).role).toBe("superadmin")
  })

  it("menolak role di luar enum", () => {
    const parsed = patchProfileRoleSchema.safeParse({ role: "root" })
    expect(parsed.success).toBe(false)
  })
})
