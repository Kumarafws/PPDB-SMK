/**
 * Route Handler: POST /api/auth/login
 * ------------------------------------
 * Bertindak sebagai "jembatan" antara form login di frontend dan backend Express.
 * Alur:
 *  1. Form login mengirim POST ke sini (bukan langsung ke backend)
 *  2. Route ini meneruskan request ke backend Express
 *  3. Jika backend berhasil, token JWT disimpan sebagai HttpOnly Cookie `ppdb_token`
 *  4. Redirect dilakukan sesuai role user
 *
 * Menyimpan token sebagai HttpOnly Cookie (bukan localStorage) agar:
 *  - Tidak bisa diakses oleh JavaScript (mencegah XSS)
 *  - Dapat dibaca oleh Next.js middleware untuk proteksi rute
 */

import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await backendRes.json()

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data?.error ?? "Login gagal" },
        { status: backendRes.status }
      )
    }

    const response = NextResponse.json({
      user: data.user,
      student: data.student,
    })

    response.cookies.set("ppdb_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    response.cookies.set("ppdb_token_client", data.access_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (err) {
    console.error("[/api/auth/login]", err)
    return NextResponse.json(
      { error: "Terjadi kesalahan server. Coba lagi nanti." },
      { status: 500 }
    )
  }
}
