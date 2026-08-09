/**
 * server.ts
 * ---------
 * Wrapper fetch untuk dipakai di Server Components & Route Handlers.
 * Cookie `ppdb_token` dibaca dari `next/headers` (cookies()) agar token
 * bisa dikirimkan dari server ke backend saat menjalankan data fetching.
 *
 * Contoh pemakaian di Server Component:
 * ```ts
 * import { createClient } from '@/lib/ppdb-client/server'
 *
 * export default async function Page() {
 *   const api = await createClient()
 *   const data = await api.get<{ student: Student }>('/students/me')
 *   ...
 * }
 * ```
 */
import { cookies } from "next/headers"
import { createServerFetch } from "@/lib/ppdb-client/fetch-client"

export async function createClient() {
  const cookieStore = await cookies()
  return createServerFetch(cookieStore)
}

