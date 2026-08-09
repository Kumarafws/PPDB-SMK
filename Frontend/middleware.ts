import { NextResponse, type NextRequest } from "next/server"

/**
 * Middleware PPDB – proteksi rute berdasarkan cookie `ppdb_token`.
 *
 * Cara kerja:
 *  1. Baca cookie `ppdb_token` dari request
 *  2. Decode payload JWT (tanpa verifikasi signature – itu urusan backend)
 *  3. Jika belum login dan mengakses halaman terproteksi → redirect ke /auth/login
 *  4. Jika sudah login tapi mengakses /auth/* → redirect ke dashboard sesuai role
 */

/** Decode payload JWT tanpa library tambahan (hanya untuk baca role, bukan verifikasi) */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const payload = parts[1]!
    // Base64url → Base64 → JSON
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const json = atob(base64)
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

const PROTECTED_PREFIXES = ["/siswa", "/admin", "/superadmin"]
const AUTH_PREFIXES = ["/auth/login", "/auth/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("ppdb_token")?.value

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PREFIXES.some((p) => pathname.startsWith(p))

  // ── Belum login ──────────────────────────────────────────────────────────────
  if (!token) {
    if (isProtected) {
      // Simpan halaman tujuan agar bisa redirect balik setelah login
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = "/auth/login"
      loginUrl.searchParams.set("next", pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // ── Sudah login: decode role dari JWT ────────────────────────────────────────
  const payload = decodeJwtPayload(token)
  const role = (payload?.role as string | undefined) ?? "siswa"

  // Token expired?
  const exp = payload?.exp as number | undefined
  if (exp && Date.now() / 1000 > exp) {
    // Hapus cookie dan redirect ke login
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/auth/login"
    const res = NextResponse.redirect(loginUrl)
    res.cookies.set("ppdb_token", "", { maxAge: 0, path: "/" })
    return res
  }

  // Jika sudah login tapi membuka halaman auth → redirect ke dashboard
  if (isAuthPage) {
    const redirectUrl = request.nextUrl.clone()
    if (role === "superadmin") redirectUrl.pathname = "/superadmin"
    else if (role === "admin") redirectUrl.pathname = "/admin"
    else redirectUrl.pathname = "/siswa"
    redirectUrl.searchParams.delete("next")
    return NextResponse.redirect(redirectUrl)
  }

  // Proteksi antar-role: siswa tidak boleh akses /admin, dll.
  if (pathname.startsWith("/superadmin") && role !== "superadmin") {
    const url = request.nextUrl.clone()
    url.pathname = role === "admin" ? "/admin" : "/siswa"
    return NextResponse.redirect(url)
  }
  if (pathname.startsWith("/admin") && role !== "admin" && role !== "superadmin") {
    const url = request.nextUrl.clone()
    url.pathname = "/siswa"
    return NextResponse.redirect(url)
  }
  if (pathname.startsWith("/siswa") && (role === "admin" || role === "superadmin")) {
    const url = request.nextUrl.clone()
    url.pathname = role === "superadmin" ? "/superadmin" : "/admin"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

