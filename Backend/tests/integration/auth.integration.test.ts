import { describe, expect, it, beforeAll } from "@jest/globals"
import request from "supertest"
import { app } from "../../src/app.js"
import {
  ensureIntegrationTestAccounts,
  INTEGRATION_SISWA_EMAIL,
  INTEGRATION_SISWA_PASSWORD,
  INTEGRATION_SUPERADMIN_EMAIL,
  INTEGRATION_SUPERADMIN_PASSWORD,
} from "./helpers/setup-integration-accounts.js"
import { bearer, loginAndGetToken } from "./helpers/http.js"

describe("Integration — Auth API", () => {
  beforeAll(async () => {
    await ensureIntegrationTestAccounts()
  })

  it("POST /api/auth/register — berhasil membuat akun siswa", async () => {
    const email = `pendaftar.${Date.now()}@integration.test`
    const res = await request(app).post("/api/auth/register").send({
      email,
      password: "daftar123",
      full_name: "Pendaftar Test",
      phone: "08111111111",
    })
    expect(res.status).toBe(201)
    expect(res.body.access_token).toBeDefined()
    expect(res.body.user.email).toBe(email)
    expect(res.body.user.role).toBe("siswa")
    expect(res.body.student).toBeTruthy()
  })

  it("POST /api/auth/register — email duplikat → 409", async () => {
    const email = `duplikat.${Date.now()}@integration.test`
    const body = {
      email,
      password: "sandi123456",
      full_name: "Satu",
      phone: "08222222222",
    }
    const first = await request(app).post("/api/auth/register").send(body)
    expect(first.status).toBe(201)
    const second = await request(app).post("/api/auth/register").send(body)
    expect(second.status).toBe(409)
  })

  it("POST /api/auth/register — validasi gagal → 400", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "bukan-email",
      password: "123456",
      full_name: "X",
    })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it("POST /api/auth/login — kredensial benar", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: INTEGRATION_SISWA_EMAIL,
      password: INTEGRATION_SISWA_PASSWORD,
    })
    expect(res.status).toBe(200)
    expect(res.body.access_token).toBeDefined()
    expect(res.body.user.role).toBe("siswa")
  })

  it("POST /api/auth/login — password salah → 401", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: INTEGRATION_SISWA_EMAIL,
      password: "salah-password",
    })
    expect(res.status).toBe(401)
  })

  it("GET /api/auth/me — dengan token valid", async () => {
    const token = await loginAndGetToken(app, INTEGRATION_SUPERADMIN_EMAIL, INTEGRATION_SUPERADMIN_PASSWORD)
    const res = await request(app).get("/api/auth/me").set(bearer(token))
    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe(INTEGRATION_SUPERADMIN_EMAIL)
    expect(res.body.user.role).toBe("superadmin")
  })

  it("GET /api/auth/me — tanpa token → 401", async () => {
    const res = await request(app).get("/api/auth/me")
    expect(res.status).toBe(401)
  })
})
