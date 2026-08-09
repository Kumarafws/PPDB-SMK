"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  FileCheck,
  Calendar,
  CalendarRange,
  CheckSquare,
  CheckCircle,
  User,
  LogOut,
  ChevronUp,
} from "lucide-react"
import type { AppUser } from "@/lib/auth/types"
import type { Profile } from "@/lib/types"
import { useState } from "react"

interface AdminSidebarProps {
  user: AppUser
  profile: Profile
}

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pendaftar", label: "Data Pendaftar", icon: Users },
  { href: "/admin/verifikasi", label: "Verifikasi Dokumen", icon: FileCheck },
  { href: "/admin/wawancara", label: "Jadwal Wawancara", icon: Calendar },
  { href: "/admin/tahun-ajaran", label: "Tahun Ajaran", icon: CalendarRange },
  { href: "/admin/seleksi", label: "Seleksi Penerimaan", icon: CheckSquare },
  { href: "/admin/hasil-seleksi", label: "Hasil Seleksi", icon: CheckCircle },
]

export function AdminSidebar({ user, profile }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }


  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <GraduationCap className="h-8 w-8 text-sidebar-primary" />
          <div>
            <h1 className="font-bold text-sidebar-foreground">PPDB SMK Panca Bhakti Rakit</h1>
            <p className="text-xs text-sidebar-foreground/70">Panel Admin</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <User className="h-4 w-4" />
                  <div className="flex flex-1 flex-col items-start text-left">
                    <span className="text-sm font-medium">{profile.full_name}</span>
                    <span className="text-xs text-sidebar-foreground/70 capitalize">
                      {profile.role}
                    </span>
                  </div>
                  <ChevronUp className="h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{profile.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                {profile.role === "superadmin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/superadmin">Panel Super Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setLogoutDialogOpen(true)} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Keluar</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin keluar dari akun ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Ya, Keluar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  )
}
