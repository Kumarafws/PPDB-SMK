import { describe, expect, it } from "@jest/globals"
import {
  listStudentsQuerySchema,
  studentAdminPatchSchema,
  studentSelfPatchSchema,
} from "../../src/schemas/student.schema.js"

describe("studentSelfPatchSchema", () => {
  it("menerima patch parsial", () => {
    const out = studentSelfPatchSchema.parse({
      full_name: "Nama Baru",
      phone: "08111111111",
    })
    expect(out.full_name).toBe("Nama Baru")
    expect(out.phone).toBe("08111111111")
  })

  it("menerima birth_date null", () => {
    const out = studentSelfPatchSchema.parse({ birth_date: null })
    expect(out.birth_date).toBeNull()
  })
})

describe("studentAdminPatchSchema", () => {
  it("menerima field khusus admin", () => {
    const out = studentAdminPatchSchema.parse({
      interview_notes: "Catatan",
      selection_status: null,
    })
    expect(out.interview_notes).toBe("Catatan")
    expect(out.selection_status).toBeNull()
  })
})

describe("listStudentsQuerySchema", () => {
  it("default page dan limit", () => {
    const out = listStudentsQuerySchema.parse({})
    expect(out.page).toBe(1)
    expect(out.limit).toBe(20)
  })

  it("memecah status comma-separated", () => {
    const out = listStudentsQuerySchema.parse({
      status: "verified , interview_scheduled ",
    })
    expect(out.status).toEqual(["verified", "interview_scheduled"])
  })

  it("menerima page dan limit dari string query", () => {
    const out = listStudentsQuerySchema.parse({
      page: "3",
      limit: "50",
    })
    expect(out.page).toBe(3)
    expect(out.limit).toBe(50)
  })

  it("menolak status yang bukan enum RegistrationStatus", () => {
    const parsed = listStudentsQuerySchema.safeParse({
      status: "tidak_ada",
    })
    expect(parsed.success).toBe(false)
  })

  it("menolak limit di atas 500", () => {
    const parsed = listStudentsQuerySchema.safeParse({ limit: "501" })
    expect(parsed.success).toBe(false)
  })
})
