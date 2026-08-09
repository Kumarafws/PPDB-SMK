import { createClient } from "@/lib/ppdb-client/server"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History } from "lucide-react"

type AdminLog = {
  id: string
  action: string
  target_type: string | null
  target_id: string | null
  details: Record<string, unknown> | null
  created_at: string
  admin_email?: string | null
  admin_name?: string | null
}

export default async function SuperAdminLogsPage() {
  const api = await createClient()

  let logs: AdminLog[] = []
  try {
    const res = await api.get<{ data: AdminLog[] }>("/admin/logs?limit=100")
    logs = res.data ?? []
  } catch { logs = [] }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
        <SidebarTrigger />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Log Aktivitas Admin</h1>
          <p className="text-sm text-muted-foreground">Riwayat aksi admin dan super admin di sistem</p>
        </div>
      </header>

      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Riwayat Aktivitas
            </CardTitle>
            <CardDescription>Maksimal 100 aktivitas terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length > 0 ? (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="rounded-lg border p-3">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{log.action}</Badge>
                      {log.target_type && <Badge variant="secondary">{log.target_type}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Oleh: {log.admin_name || log.admin_email || "Admin"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Waktu: {new Date(log.created_at).toLocaleString("id-ID")}
                    </p>
                    {log.details && (
                      <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-xs">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">Belum ada log aktivitas</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
