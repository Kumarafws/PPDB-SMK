import { NextResponse, type NextRequest } from 'next/server'
import { setMockRole } from '@/lib/mock/ppdb-mock'

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request })
  const cookieAdapter = {
    get(name: string) {
      return request.cookies.get(name)?.value
    },
    set(name: string, value: string) {
      response.cookies.set(name, value, { path: "/" })
    },
    remove(name: string) {
      response.cookies.set(name, "", { path: "/", maxAge: 0 })
    },
  }

  const roleParam = request.nextUrl.searchParams.get("mockRole") as any
  if (roleParam === "siswa" || roleParam === "admin" || roleParam === "superadmin") {
    setMockRole(cookieAdapter, roleParam)
  }

  const isProtected =
    request.nextUrl.pathname.startsWith("/siswa") ||
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/superadmin")

  if (isProtected && !cookieAdapter.get("ppdb_mock_uid")) {
    setMockRole(cookieAdapter, "siswa")
  }

  return response
}
