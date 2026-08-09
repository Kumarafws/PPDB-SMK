import { describe, expect, it } from "@jest/globals"
import { str } from "../../src/lib/params.js"

describe("str", () => {
  it("mengembalikan string apa adanya", () => {
    expect(str("abc")).toBe("abc")
  })

  it("mengembalikan string kosong jika undefined", () => {
    expect(str(undefined)).toBe("")
  })

  it("mengambil elemen pertama dari array", () => {
    expect(str(["first", "second"])).toBe("first")
  })

  it("mengembalikan kosong jika array kosong", () => {
    expect(str([])).toBe("")
  })
})
