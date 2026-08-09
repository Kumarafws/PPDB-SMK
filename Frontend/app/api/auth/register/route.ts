import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const backendRes = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await backendRes.json()

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data?.error ?? "Registrasi gagal" },
        { status: backendRes.status }
      )
    }

    const response = NextResponse.json(
      {
        user: data.user,
        student: data.student,
      },
      { status: 201 }
    )

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
    console.error("[/api/auth/register]", err)
    return NextResponse.json(
      { error: "Terjadi kesalahan server. Coba lagi nanti." },
      { status: 500 }
    )
  }
}
