/**
 * fetch-client.ts
 * ---------------
 * Utilitas fetch terpusat untuk berkomunikasi dengan backend Express.
 * Semua request ke API backend harus melalui helper ini agar:
 *  - Base URL otomatis diarahkan ke NEXT_PUBLIC_API_URL (default: http://localhost:4000/api)
 *  - Bearer token dari cookie `ppdb_token` disisipkan secara otomatis
 *  - Error respons dari backend diubah menjadi throw agar mudah di-catch
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

/** Tipe generik response sukses dari backend */
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

/** Error yang dilempar saat status HTTP >= 400 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/**
 * Membaca cookie `ppdb_token` sesuai environment:
 * - Client-side  : membaca langsung dari `document.cookie`
 * - Server-side  : perlu diinjeksikan dari luar (lihat createServerFetch)
 */
function getTokenFromDocumentCookie(): string | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie.match(/(?:^|; )ppdb_token_client=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : undefined
}

/** Opsi tambahan yang bisa disertakan ke setiap request */
export interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  /** Token override – digunakan oleh server-side fetch (dari cookies()) */
  token?: string
}

/**
 * Fungsi fetch inti.
 *
 * @param path   - Path endpoint tanpa base URL, contoh: `/auth/login`
 * @param options - FetchOptions
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, token: tokenOverride, headers: extraHeaders, ...rest } = options

  const token = tokenOverride ?? getTokenFromDocumentCookie()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(extraHeaders as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // Coba parse JSON meskipun error agar pesan backend bisa ditampilkan
  let json: unknown
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    json = await response.json()
  } else {
    json = await response.text()
  }

  if (!response.ok) {
    const message =
      (json as any)?.error ??
      (json as any)?.message ??
      `HTTP ${response.status}`
    throw new ApiError(response.status, message)
  }

  return json as T
}

// ─── Shorthand helpers ────────────────────────────────────────────────────────

export const apiGet = <T = unknown>(path: string, opts?: FetchOptions) =>
  apiFetch<T>(path, { method: "GET", ...opts })

export const apiPost = <T = unknown>(
  path: string,
  body: unknown,
  opts?: FetchOptions
) => apiFetch<T>(path, { method: "POST", body, ...opts })

export const apiPatch = <T = unknown>(
  path: string,
  body: unknown,
  opts?: FetchOptions
) => apiFetch<T>(path, { method: "PATCH", body, ...opts })

export const apiPut = <T = unknown>(
  path: string,
  body: unknown,
  opts?: FetchOptions
) => apiFetch<T>(path, { method: "PUT", body, ...opts })

export const apiDelete = <T = unknown>(path: string, opts?: FetchOptions) =>
  apiFetch<T>(path, { method: "DELETE", ...opts })

/**
 * Membuat instance fetch yang sudah disisipkan token secara manual.
 * Digunakan di Server Components / Route Handlers yang sudah punya akses
 * ke `cookies()` dari next/headers.
 *
 * Contoh pemakaian di Server Component:
 * ```ts
 * import { cookies } from 'next/headers'
 * import { createServerFetch } from '@/lib/ppdb-client/fetch-client'
 *
 * const { get } = createServerFetch(await cookies())
 * const data = await get('/students/me')
 * ```
 */
export function createServerFetch(cookieStore: {
  get(name: string): { value: string } | undefined
}) {
  const token = cookieStore.get("ppdb_token")?.value

  return {
    get: <T = unknown>(path: string, opts?: FetchOptions) =>
      apiGet<T>(path, { ...opts, token }),
    post: <T = unknown>(path: string, body: unknown, opts?: FetchOptions) =>
      apiPost<T>(path, body, { ...opts, token }),
    patch: <T = unknown>(path: string, body: unknown, opts?: FetchOptions) =>
      apiPatch<T>(path, body, { ...opts, token }),
    put: <T = unknown>(path: string, body: unknown, opts?: FetchOptions) =>
      apiPut<T>(path, body, { ...opts, token }),
    delete: <T = unknown>(path: string, opts?: FetchOptions) =>
      apiDelete<T>(path, { ...opts, token }),
  }
}
