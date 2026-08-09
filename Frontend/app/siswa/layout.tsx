import { redirect } from "next/navigation"
import { createClient } from "@/lib/ppdb-client/server"
import { SiswaNav } from "@/components/siswa/siswa-nav"
import type { Profile } from "@/lib/types"

export default async function SiswaLayout({
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

  if (profile.role === "admin") redirect("/admin")
  if (profile.role === "superadmin") redirect("/superadmin")

  const user = { id: profile.id, email: profile.email }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiswaNav user={user} profile={profile} />
      <main className="flex-1">{children}</main>
    </div>
  )
}

