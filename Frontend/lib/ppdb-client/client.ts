/**
 * client.ts
 * ---------
 * Re-export helper fetch untuk dipakai di Client Components (browser-side).
 * Token JWT dibaca otomatis dari cookie `ppdb_token` di browser.
 */
export {
  apiFetch,
  apiGet,
  apiPost,
  apiPatch,
  apiPut,
  apiDelete,
  ApiError,
} from "@/lib/ppdb-client/fetch-client"

