import { describe, expect, it, beforeAll } from "@jest/globals"
import request from "supertest"
import { app } from "../../src/app.js"
import {
  ensureIntegrationTestAccounts,
  INTEGRATION_SUPERADMIN_EMAIL,
  INTEGRATION_SUPERADMIN_PASSWORD,
} from "./helpers/setup-integration-accounts.js"
import { bearer, loginAndGetToken } from "./helpers/http.js"

describe("Integration — Students (admin/superadmin)", () => {
  let token: string

  beforeAll(async () => {
    await ensureIntegrationTestAccounts()
    token = await loginAndGetToken(app, INTEGRATION_SUPERADMIN_EMAIL, INTEGRATION_SUPERADMIN_PASSWORD)
  })

  it("GET /api/students — tanpa token → 401", async () => {
    const res = await request(app).get("/api/students")
    expect(res.status).toBe(401)
  })

  it("GET /api/students — superadmin → 200 dengan struktur paginasi", async () => {
    const res = await request(app)
      .get("/api/students")
      .query({ page: "1", limit: "10" })
      .set(bearer(token))

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.meta).toMatchObject({
      page: 1,
      limit: 10,
    })
    expect(typeof res.body.total).toBe("number")
  })

  it("GET /api/students — query status comma-separated di-parse", async () => {
    const res = await request(app)
      .get("/api/students")
      .query({ status: "draft,submitted", limit: "5" })
      .set(bearer(token))

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
  })
})
