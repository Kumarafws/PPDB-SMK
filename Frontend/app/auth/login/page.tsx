"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error ?? "Email atau password salah")
        setLoading(false)
        return
      }
      const role = data?.user?.role
      if (role === "superadmin") {
        router.push("/superadmin")
      } else if (role === "admin") {
        router.push("/admin")
      } else {
        router.push("/siswa")
      }
    } catch {
      setError("Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.")
      setLoading(false)
    }
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-4 w-full max-w-md">
        <Button asChild variant="ghost" className="-ml-2 gap-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>
      <Link href="/" className="mb-8 flex items-center gap-2">
        <GraduationCap className="h-10 w-10 text-primary" />
        <span className="text-2xl font-bold text-foreground">PPDB SMK Panca Bhakti Rakit</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Masuk ke Akun</CardTitle>
          <CardDescription>
            Masukkan email dan password untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              Daftar sekarang
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
