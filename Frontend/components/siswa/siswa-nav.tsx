"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
import { GraduationCap, Home, FileText, Upload, Calendar, CheckCircle, Download, Menu, User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AppUser } from "@/lib/auth/types"
import type { Profile } from "@/lib/types"
import { useState } from "react"

interface SiswaNavProps {
  user: AppUser
  profile: Profile
}

const navItems = [
  { href: "/siswa", label: "Dashboard", icon: Home },
  { href: "/siswa/pendaftaran", label: "Formulir", icon: FileText },
  { href: "/siswa/dokumen", label: "Dokumen", icon: Upload },
  { href: "/siswa/jadwal", label: "Jadwal", icon: Calendar },
  { href: "/siswa/hasil", label: "Hasil Seleksi", icon: CheckCircle },
  { href: "/siswa/cetak", label: "Cetak Formulir", icon: Download },
]

export function SiswaNav({ user, profile }: SiswaNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }


  return (
    <header className="sticky top-0 z-50 border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/siswa" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">PPDB SMK Panca Bhakti Rakit</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{profile.full_name || user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{profile.full_name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLogoutDialogOpen(true)} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t bg-card p-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
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
    </header>
  )
}
