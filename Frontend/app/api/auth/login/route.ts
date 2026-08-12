import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("BACKEND_URL:", BACKEND_URL)
    console.log("LOGIN URL:", `${BACKEND_URL}/auth/login`)

    const backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const responseText = await backendRes.text()

    console.log("BACKEND STATUS:", backendRes.status)
    console.log("BACKEND RESPONSE:", responseText)

    let data

    try {
      data = JSON.parse(responseText)
    } catch {
      console.error(
        "BACKEND RESPONSE BUKAN JSON:",
        responseText
      )

      return NextResponse.json(
        {
          error: "Backend mengembalikan response yang bukan JSON",
          backendUrl: BACKEND_URL,
          backendStatus: backendRes.status,
          backendResponse: responseText.substring(0, 500),
        },
        { status: 502 }
      )
    }

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          error: data?.error ?? "Login gagal",
        },
        {
          status: backendRes.status,
        }
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
      {
        error: "Terjadi kesalahan server. Coba lagi nanti.",
      },
      {
        status: 500,
      }
    )
  }
}