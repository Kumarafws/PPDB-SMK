import { describe, expect, it, beforeAll } from "@jest/globals"
import request from "supertest"
import { app } from "../../src/app.js"
import {
  ensureIntegrationTestAccounts,
  deleteProfileByEmail,
  INTEGRATION_SISWA_EMAIL,
  INTEGRATION_SISWA_PASSWORD,
  INTEGRATION_SUPERADMIN_EMAIL,
  INTEGRATION_SUPERADMIN_PASSWORD,
} from "./helpers/setup-integration-accounts.js"
import { bearer, loginAndGetToken } from "./helpers/http.js"

describe("Integration — Profiles (superadmin)", () => {
  let siswaUserId: string
  let superadminToken: string
  let createdAdminEmail: string | null = null

  beforeAll(async () => {
    const acc = await ensureIntegrationTestAccounts()
    siswaUserId = acc.siswaUserId
    superadminToken = await loginAndGetToken(app, INTEGRATION_SUPERADMIN_EMAIL, INTEGRATION_SUPERADMIN_PASSWORD)
  })

  it("GET /api/profiles — tanpa token → 401", async () => {
    const res = await request(app).get("/api/profiles")
    expect(res.status).toBe(401)
  })

  it("GET /api/profiles — sebagai siswa → 403", async () => {
    const siswaToken = await loginAndGetToken(app, INTEGRATION_SISWA_EMAIL, INTEGRATION_SISWA_PASSWORD)
    const res = await request(app).get("/api/profiles").set(bearer(siswaToken))
    expect(res.status).toBe(403)
  })

  it("GET /api/profiles?role=admin — superadmin → 200", async () => {
    const res = await request(app)
      .get("/api/profiles")
      .query({ role: "admin", limit: "50" })
      .set(bearer(superadminToken))
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(typeof res.body.total).toBe("number")
  })

  it("POST /api/profiles/admins — membuat admin baru", async () => {
    createdAdminEmail = `admin.baru.${Date.now()}@integration.test`
    const res = await request(app)
      .post("/api/profiles/admins")
      .set(bearer(superadminToken))
      .send({
        full_name: "Admin Baru Integration",
        email: createdAdminEmail,
        password: "adminbaru12",
      })
    expect(res.status).toBe(201)
    expect(res.body.profile.email).toBe(createdAdminEmail)
    expect(res.body.profile.role).toBe("admin")
  })

  it("POST /api/profiles/admins — email duplikat → 409", async () => {
    expect(createdAdminEmail).toBeTruthy()
    const res = await request(app)
      .post("/api/profiles/admins")
      .set(bearer(superadminToken))
      .send({
        full_name: "Duplikat",
        email: createdAdminEmail!,
        password: "sandi123456",
      })
    expect(res.status).toBe(409)
  })

  it("PATCH /api/profiles/:id/password — reset password siswa", async () => {
    const res = await request(app)
      .patch(`/api/profiles/${siswaUserId}/password`)
      .set(bearer(superadminToken))
      .send({ password: "resetSiswa12" })
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)

    const loginAfter = await request(app).post("/api/auth/login").send({
      email: INTEGRATION_SISWA_EMAIL,
      password: "resetSiswa12",
    })
    expect(loginAfter.status).toBe(200)

    const { prisma } = await import("../../src/lib/prisma.js")
    const { hashPassword } = await import("../../src/lib/password.js")
    await prisma.profile.update({
      where: { id: siswaUserId },
      data: { passwordHash: await hashPassword(INTEGRATION_SISWA_PASSWORD) },
    })
  })

  it("PATCH /api/profiles/:id/password — reset password diri sendiri → 400", async () => {
    const me = await request(app).get("/api/auth/me").set(bearer(superadminToken))
    const superId = me.body.user.id as string
    const res = await request(app)
      .patch(`/api/profiles/${superId}/password`)
      .set(bearer(superadminToken))
      .send({ password: "tidakBoleh12" })
    expect(res.status).toBe(400)
  })

  afterAll(async () => {
    if (createdAdminEmail) {
      await deleteProfileByEmail(createdAdminEmail)
    }
  })
})
