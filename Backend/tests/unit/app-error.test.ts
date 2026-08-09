import { describe, expect, it } from "@jest/globals"
import { AppError } from "../../src/lib/app-error.js"

describe("AppError", () => {
  it("menyimpan statusCode dan message", () => {
    const err = new AppError(404, "Tidak ada")
    expect(err.statusCode).toBe(404)
    expect(err.message).toBe("Tidak ada")
    expect(err.name).toBe("AppError")
  })

  it("bisa menyimpan details", () => {
    const err = new AppError(400, "Bad", { field: "email" })
    expect(err.details).toEqual({ field: "email" })
  })
})
