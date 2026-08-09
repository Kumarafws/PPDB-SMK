import { describe, expect, it } from "@jest/globals"
import request from "supertest"
import { app } from "../../src/app.js"

describe("HTTP integration — root API", () => {
  it("GET /api mengembalikan info API", async () => {
    const res = await request(app).get("/api")
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      name: "PPDB API",
    })
  })

  it("GET /health mengembalikan status ok", async () => {
    const res = await request(app).get("/health")
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      status: "ok",
      service: "ppdb-backend",
    })
  })
})
