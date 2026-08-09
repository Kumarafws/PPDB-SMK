/**
 * Ekstrak satu string dari req.params atau req.query yang bertipe string | string[].
 * Express v5 menggunakan tipe yang lebih ketat untuk params.
 */
export function str(val: string | string[] | undefined): string {
  if (Array.isArray(val)) return val[0] ?? ""
  return val ?? ""
}
