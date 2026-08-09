"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiGet, apiPatch, ApiError } from "@/lib/ppdb-client/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ChevronLeft, ChevronRight, Save, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  MAJOR_OPTIONS,
  REGISTRATION_INFO_SOURCE_OPTIONS,
  RELIGION_OPTIONS,
  type Student,
} from "@/lib/types"

const steps = [
  { id: 1, title: "Data Pribadi", description: "Informasi dasar diri" },
  { id: 2, title: "Alamat", description: "Tempat tinggal" },
  { id: 3, title: "Data Orang Tua", description: "Informasi orang tua/wali" },
  { id: 4, title: "Asal Sekolah", description: "Pendidikan sebelumnya" },
  { id: 5, title: "Jurusan", description: "Jurusan yang diminati" },
]

const requiredFieldsByStep: Record<number, Array<{ key: keyof Student; label: string }>> = {
  1: [
    { key: "full_name", label: "Nama Lengkap" },
    { key: "nik", label: "NIK" },
    { key: "birth_place", label: "Tempat Lahir" },
    { key: "birth_date", label: "Tanggal Lahir" },
    { key: "gender", label: "Jenis Kelamin" },
    { key: "religion", label: "Agama" },
    { key: "phone", label: "No. Telepon" },
    { key: "email", label: "Email" },
    { key: "anak_ke", label: "Anak Ke" },
    { key: "jumlah_saudara", label: "Jumlah Saudara" },
    { key: "registration_info_source", label: "Sumber Informasi Pendaftaran" },
  ],
  2: [
    { key: "address", label: "Alamat Lengkap" },
    { key: "village", label: "Kelurahan/Desa" },
    { key: "district", label: "Kecamatan" },
    { key: "city", label: "Kota/Kabupaten" },
    { key: "province", label: "Provinsi" },
  ],
  3: [
    { key: "father_name", label: "Nama Ayah" },
    { key: "mother_name", label: "Nama Ibu" },
  ],
  4: [
    { key: "school_origin", label: "Nama Sekolah Asal" },
    { key: "graduation_year", label: "Tahun Lulus" },
  ],
  5: [{ key: "first_choice", label: "Jurusan" }],
}

export default function PendaftaranPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [student, setStudent] = useState<Partial<Student> | null>(null)
  const [formData, setFormData] = useState<Partial<Student>>({})
  const [showValidationByStep, setShowValidationByStep] = useState<Record<number, boolean>>({})

  useEffect(() => {
    loadStudentData()
  }, [])

  const loadStudentData = async () => {
    try {
      const res = await apiGet<{ student: Student | null }>("/students/me")
      const existingStudent = res.student
      if (existingStudent) {
        setStudent(existingStudent)
        setFormData(existingStudent)
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/auth/login")
        return
      }
      // Siswa baru tanpa data belum jadi error
    }
    setLoading(false)
  }

  const handleInputChange = (field: keyof Student, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getMissingRequiredFields = (step: number) => {
    const required = requiredFieldsByStep[step] ?? []
    return required
      .filter(({ key }) => {
        const value = formData[key]
        if (value === null || value === undefined) return true
        if (typeof value === "string") return value.trim().length === 0
        return false
      })
      .map(({ label }) => label)
  }

  const isRequiredField = (step: number, field: keyof Student) =>
    (requiredFieldsByStep[step] ?? []).some((item) => item.key === field)

  const isFieldEmpty = (field: keyof Student) => {
    const value = formData[field]
    if (value === null || value === undefined) return true
    if (typeof value === "string") return value.trim().length === 0
    return false
  }

  const isFieldInvalid = (field: keyof Student) =>
    !!showValidationByStep[currentStep] && isRequiredField(currentStep, field) && isFieldEmpty(field)

  const markStepValidationVisible = (step: number) => {
    setShowValidationByStep((prev) => ({ ...prev, [step]: true }))
  }

  const handleStepClick = (targetStep: number) => {
    if (targetStep <= currentStep) {
      setCurrentStep(targetStep)
      return
    }

    for (let step = 1; step < targetStep; step += 1) {
      const missingFields = getMissingRequiredFields(step)
      if (missingFields.length > 0) {
        markStepValidationVisible(step)
        setCurrentStep(step)
        toast.error(`Field wajib belum diisi: ${missingFields.join(", ")}`)
        return
      }
    }

    setCurrentStep(targetStep)
  }

  const saveProgress = async () => {
    setSaving(true)
    try {
      // Ambil field yang relevan dari formData (hapus field read-only)
      const { id, user_id, registration_status, document_status,
        interview_date, interview_notes, selection_status, selection_notes,
        accepted_major, submitted_at, verified_at, verified_by,
        created_at, updated_at, ...patchable } = formData as Student

      const res = await apiPatch<{ student: Student }>("/students/me", patchable)
      setStudent(res.student)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/auth/login")
      }
    }
    setSaving(false)
  }

  const nextStep = async () => {
    const missingFields = getMissingRequiredFields(currentStep)
    if (missingFields.length > 0) {
      markStepValidationVisible(currentStep)
      toast.error(`Field wajib belum diisi: ${missingFields.join(", ")}`)
      return
    }
    await saveProgress()
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Formulir Pendaftaran</h1>
        <p className="mt-1 text-muted-foreground">Lengkapi data diri Anda dengan benar</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-lg border p-3 text-center transition-colors",
                currentStep === step.id
                  ? "border-primary bg-primary/5"
                  : currentStep > step.id
                  ? "border-success/30 bg-success/5"
                  : "border-border bg-card hover:bg-muted/50"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step.id
                    ? "bg-success text-success-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step.id ? <CheckCircle className="h-4 w-4" /> : step.id}
              </div>
              <span className="hidden text-sm font-medium sm:block">{step.title}</span>
              <span className="hidden text-xs text-muted-foreground sm:block">{step.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="full_name">Nama Lengkap *</Label>
                <Input
                  id="full_name"
                  className={cn(isFieldInvalid("full_name") && "border-destructive focus-visible:ring-destructive")}
                  value={formData.full_name || ""}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nisn">NISN</Label>
                <Input
                  id="nisn"
                  value={formData.nisn || ""}
                  onChange={(e) => handleInputChange("nisn", e.target.value)}
                  placeholder="10 digit NISN"
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nik">NIK *</Label>
                <Input
                  id="nik"
                  className={cn(isFieldInvalid("nik") && "border-destructive focus-visible:ring-destructive")}
                  value={formData.nik || ""}
                  onChange={(e) => handleInputChange("nik", e.target.value)}
                  placeholder="16 digit NIK"
                  maxLength={16}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_place">Tempat Lahir *</Label>
                <Input
                  id="birth_place"
                  className={cn(isFieldInvalid("birth_place") && "border-destructive focus-visible:ring-destructive")}
                  value={formData.birth_place || ""}
                  onChange={(e) => handleInputChange("birth_place", e.target.value)}
                  placeholder="Kota kelahiran"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_date">Tanggal Lahir *</Label>
                <Input
                  id="birth_date"
                  type="date"
                  className={cn(isFieldInvalid("birth_date") && "border-destructive focus-visible:ring-destructive")}
                  value={formData.birth_date || ""}
                  onChange={(e) => handleInputChange("birth_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Jenis Kelamin *</Label>
                <Select
                  value={formData.gender || ""}
                  onValueChange={(value) => handleInputChange("gender", value)}
                >
                  <SelectTrigger className={cn(isFieldInvalid("gender") && "border-destructive focus:ring-destructive")}>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="religion">Agama *</Label>
                <Select
                  value={formData.religion || ""}
                  onValueChange={(value) => handleInputChange("religion", value)}
                >
                  <SelectTrigger className={cn(isFieldInvalid("religion") && "border-destructive focus:ring-destructive")}>
                    <SelectValue placeholder="Pilih agama" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELIGION_OPTIONS.map((religion) => (
                      <SelectItem key={religion} value={religion}>
                        {religion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  className={cn(isFieldInvalid("phone") && "border-destructive focus-visible:ring-destructive")}
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  className={cn(isFieldInvalid("email") && "border-destructive focus-visible:ring-destructive")}
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="nama@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anak_ke">Anak Ke *</Label>
                <Input
                  id="anak_ke"
                  className={cn(isFieldInvalid("anak_ke") && "border-destructive focus-visible:ring-destructive")}
                  value={formData.anak_ke || ""}
                  onChange={(e) => handleInputChange("anak_ke", e.target.value)}
                  placeholder="Contoh: 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jumlah_saudara">Jumlah Saudara *</Label>
                <Input
                  id="jumlah_saudara"
                  className={cn(isFieldInvalid("jumlah_saudara") && "border-destructive focus-visible:ring-destructive")}
                  value={formData.jumlah_saudara || ""}
                  onChange={(e) => handleInputChange("jumlah_saudara", e.target.value)}
                  placeholder="Contoh: 2"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="registration_info_source">
                  DARI MANA MENDAPATKAN INFORMASI PENDAFTARAN INI *
                </Label>
                <Select
                  value={formData.registration_info_source || ""}
                  onValueChange={(value) => handleInputChange("registration_info_source", value)}
                >
                  <SelectTrigger className={cn(isFieldInvalid("registration_info_source") && "border-destructive focus:ring-destructive")}>
                    <SelectValue placeholder="Pilih sumber informasi" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGISTRATION_INFO_SOURCE_OPTIONS.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="no_kip">No KIP</Label>
                <Input
                  id="no_kip"
                  value={formData.no_kip || ""}
                  onChange={(e) => handleInputChange("no_kip", e.target.value)}
                  placeholder="Opsional"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Alamat Lengkap *</Label>
                <Textarea
                  id="address"
                  className={cn(isFieldInvalid("address") && "border-destructive focus-visible:ring-destructive")}
                  value={formData.address || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Jalan, nomor rumah, nama gedung, dll"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rt">RT</Label>
                <Input
                  id="rt"
                  value={formData.rt || ""}
                  onChange={(e) => handleInputChange("rt", e.target.value)}
                  placeholder="001"
                  maxLength={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rw">RW</Label>
                <Input
                  id="rw"
                  value={formData.rw || ""}
                  onChange={(e) => handleInputChange("rw", e.target.value)}
                  placeholder="001"
                  maxLength={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="village">Kelurahan/Desa *</Label>
                <Input
                  id="village"
                  className={cn(isFieldInvalid("village") && "border-destructive focus-visible:ring-destructive")}
                  value={formData.village || ""}
                  onChange={(e) => handleInputChange("village", e.target.value)}
                  placeholder="Nama kelurahan/desa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">Kecamatan *</Label>
                <Input
                  id="district"
                  className={cn(isFieldInvalid("district") && "border-destructive focus-visible:ring-destructive")}
                  value={formData.district || ""}
                  onChange={(e) => handleInputChange("district", e.target.value)}
                  placeholder="Nama kecamatan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Kota/Kabupaten *</Label>
                <Input
                  id="city"
                  className={cn(isFieldInvalid("city") && "border-destructive focus-visible:ring-destructive")}
                  value={formData.city || ""}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Nama kota/kabupaten"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Provinsi *</Label>
                <Input
                  id="province"
                  className={cn(isFieldInvalid("province") && "border-destructive focus-visible:ring-destructive")}
                  value={formData.province || ""}
                  onChange={(e) => handleInputChange("province", e.target.value)}
                  placeholder="Nama provinsi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Kode Pos</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code || ""}
                  onChange={(e) => handleInputChange("postal_code", e.target.value)}
                  placeholder="12345"
                  maxLength={5}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 font-medium text-foreground">Data Ayah</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="father_name">Nama Ayah *</Label>
                    <Input
                      id="father_name"
                      className={cn(isFieldInvalid("father_name") && "border-destructive focus-visible:ring-destructive")}
                      value={formData.father_name || ""}
                      onChange={(e) => handleInputChange("father_name", e.target.value)}
                      placeholder="Nama lengkap ayah"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="father_occupation">Pekerjaan</Label>
                    <Input
                      id="father_occupation"
                      value={formData.father_occupation || ""}
                      onChange={(e) => handleInputChange("father_occupation", e.target.value)}
                      placeholder="Pekerjaan ayah"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="father_phone">No. Telepon</Label>
                    <Input
                      id="father_phone"
                      type="tel"
                      value={formData.father_phone || ""}
                      onChange={(e) => handleInputChange("father_phone", e.target.value)}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-medium text-foreground">Data Ibu</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="mother_name">Nama Ibu *</Label>
                    <Input
                      id="mother_name"
                      className={cn(isFieldInvalid("mother_name") && "border-destructive focus-visible:ring-destructive")}
                      value={formData.mother_name || ""}
                      onChange={(e) => handleInputChange("mother_name", e.target.value)}
                      placeholder="Nama lengkap ibu"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mother_occupation">Pekerjaan</Label>
                    <Input
                      id="mother_occupation"
                      value={formData.mother_occupation || ""}
                      onChange={(e) => handleInputChange("mother_occupation", e.target.value)}
                      placeholder="Pekerjaan ibu"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mother_phone">No. Telepon</Label>
                    <Input
                      id="mother_phone"
                      type="tel"
                      value={formData.mother_phone || ""}
                      onChange={(e) => handleInputChange("mother_phone", e.target.value)}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-medium text-foreground">Data Wali (Opsional)</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="guardian_name">Nama Wali</Label>
                    <Input
                      id="guardian_name"
                      value={formData.guardian_name || ""}
                      onChange={(e) => handleInputChange("guardian_name", e.target.value)}
                      placeholder="Nama lengkap wali"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardian_occupation">Pekerjaan</Label>
                    <Input
                      id="guardian_occupation"
                      value={formData.guardian_occupation || ""}
                      onChange={(e) => handleInputChange("guardian_occupation", e.target.value)}
                      placeholder="Pekerjaan wali"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardian_phone">No. Telepon</Label>
                    <Input
                      id="guardian_phone"
                      type="tel"
                      value={formData.guardian_phone || ""}
                      onChange={(e) => handleInputChange("guardian_phone", e.target.value)}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="school_origin">Nama Sekolah Asal *</Label>
                <Input
                  id="school_origin"
                  className={cn(isFieldInvalid("school_origin") && "border-destructive focus-visible:ring-destructive")}
                  value={formData.school_origin || ""}
                  onChange={(e) => handleInputChange("school_origin", e.target.value)}
                  placeholder="SMP/MTs Negeri 1 ..."
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="school_address">Alamat Sekolah</Label>
                <Textarea
                  id="school_address"
                  value={formData.school_address || ""}
                  onChange={(e) => handleInputChange("school_address", e.target.value)}
                  placeholder="Alamat sekolah asal"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="graduation_year">Tahun Lulus *</Label>
                <Select
                  value={formData.graduation_year || ""}
                  onValueChange={(value) => handleInputChange("graduation_year", value)}
                >
                  <SelectTrigger className={cn(isFieldInvalid("graduation_year") && "border-destructive focus:ring-destructive")}>
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_choice">Jurusan *</Label>
                <Select
                  value={formData.first_choice || ""}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      first_choice: value,
                    }))
                  }}
                >
                  <SelectTrigger className={cn(isFieldInvalid("first_choice") && "border-destructive focus:ring-destructive")}>
                    <SelectValue placeholder="Pilih jurusan" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAJOR_OPTIONS.map((major) => (
                      <SelectItem key={major.value} value={major.value}>
                        {major.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 sm:col-span-2">
                <h4 className="mb-2 font-medium text-foreground">Informasi Jurusan</h4>
                {formData.first_choice && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Jurusan:</strong>{" "}
                    {MAJOR_OPTIONS.find((m) => m.value === formData.first_choice)?.label}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>

            <Button
              variant="ghost"
              onClick={saveProgress}
              disabled={saving}
              className="gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan
            </Button>

            {currentStep < steps.length ? (
              <Button onClick={nextStep} disabled={saving} className="gap-2">
                Selanjutnya
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={async () => {
                  await saveProgress()
                  router.push("/siswa/dokumen")
                }}
                disabled={saving}
                className="gap-2"
              >
                Lanjut ke Dokumen
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
