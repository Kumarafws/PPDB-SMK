import { redirect } from "next/navigation"
import { createClient } from "@/lib/ppdb-client/server"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import type { Profile } from "@/lib/types"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const api = await createClient()

  let meData: { user: Profile; student: unknown } | null = null
  try {
    meData = await api.get<{ user: Profile; student: unknown }>("/auth/me")
  } catch {
    redirect("/auth/login")
  }

  if (!meData) redirect("/auth/login")

  const profile = meData.user

  if (!["admin", "superadmin"].includes(profile.role)) {
    redirect("/siswa")
  }

  const user = { id: profile.id, email: profile.email }

  return (
    <SidebarProvider>
      <AdminSidebar user={user} profile={profile} />
      <SidebarInset>
        <main className="flex-1 bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

