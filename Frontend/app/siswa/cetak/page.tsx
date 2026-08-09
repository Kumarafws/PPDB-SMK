"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { apiGet, ApiError } from "@/lib/ppdb-client/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, FileText, ArrowLeft, AlertCircle } from "lucide-react"
import { MAJOR_OPTIONS, type Student } from "@/lib/types"
import {
  Document as PdfDocument,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer"

const pdfStyles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    color: "#111827",
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 14,
    color: "#4B5563",
  },
  letterhead: {
    border: "1px solid #111827",
    padding: 8,
    marginBottom: 12,
  },
  letterheadRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  letterheadLogo: {
    width: 62,
    height: 62,
    marginRight: 10,
  },
  letterheadText: {
    flex: 1,
    alignItems: "center",
  },
  letterheadLine1: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  letterheadLine2: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  letterheadMeta: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 3,
  },
  letterheadAddr: {
    fontSize: 8.5,
    marginBottom: 1,
  },
  letterheadDivider: {
    borderTop: "1px solid #111827",
    marginTop: 6,
  },
  letterheadCompetency: {
    fontSize: 9,
    fontWeight: 700,
    marginTop: 6,
    textAlign: "center",
  },
  section: {
    marginBottom: 10,
    border: "1px solid #E5E7EB",
    borderRadius: 4,
    padding: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  key: {
    width: 160,
    color: "#4B5563",
  },
  value: {
    flex: 1,
  },
  footer: {
    marginTop: 12,
    fontSize: 9,
    color: "#6B7280",
  },
})

function formatDate(date: string | null | undefined) {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function valueOrDash(value: string | null | undefined) {
  return value && value.trim() ? value : "-"
}

function RegistrationPdf({
  student,
}: {
  student: Student
}) {

  const logoSrc = `${typeof window !== "undefined" ? window.location.origin : ""}/kop-logo.png`

  return (
    <PdfDocument>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.letterhead}>
          <View style={pdfStyles.letterheadRow}>
            <Image style={pdfStyles.letterheadLogo} src={logoSrc} />
            <View style={pdfStyles.letterheadText}>
              <Text style={pdfStyles.letterheadLine1}>YAYASAN PENDIDIKAN DAN TEKNOLOGI PANCA BHAKTI</Text>
              <Text style={pdfStyles.letterheadLine2}>SEKOLAH MENENGAH KEJURUAN (SMK) PANCA BHAKTI RAKIT</Text>
              <Text style={pdfStyles.letterheadMeta}>NIS: 400190. NSS: 342030411019. NPSN: 20362369</Text>
              <Text style={pdfStyles.letterheadAddr}>
                Jl. Raya Rakit Km. 2,7 Ds. Adipasar, Kec.RakitKab. Banjarnegara 53463
              </Text>
              <Text style={pdfStyles.letterheadAddr}>Telp. 085329699994, Email: smk_pabhara@yahoo.com</Text>
            </View>
          </View>
          <View style={pdfStyles.letterheadDivider} />
          <Text style={pdfStyles.letterheadCompetency}>
            Kompetensi Keahlian: 1. Teknik Kendaraan Ringan Otomotif; 2. Teknik Komputer Jaringan
          </Text>
        </View>

        <Text style={pdfStyles.title}>Formulir Pendaftaran PPDB</Text>
        <Text style={pdfStyles.subtitle}>Tanggal cetak: {new Date().toLocaleDateString("id-ID")}</Text>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Data Pribadi</Text>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Nama Lengkap</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.full_name)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>NISN</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.nisn)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>NIK</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.nik)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Tempat, Tanggal Lahir</Text>
            <Text style={pdfStyles.value}>
              {valueOrDash(student.birth_place)}, {formatDate(student.birth_date)}
            </Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Jenis Kelamin</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.gender)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Agama</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.religion)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>No. Telepon</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.phone)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Email</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.email)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Anak Ke</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.anak_ke)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Jumlah Saudara</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.jumlah_saudara)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Sumber Informasi</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.registration_info_source)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>No KIP</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.no_kip)}</Text>
          </View>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Alamat</Text>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Alamat Lengkap</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.address)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>RT/RW</Text>
            <Text style={pdfStyles.value}>
              {valueOrDash(student.rt)} / {valueOrDash(student.rw)}
            </Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Kelurahan, Kecamatan</Text>
            <Text style={pdfStyles.value}>
              {valueOrDash(student.village)}, {valueOrDash(student.district)}
            </Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Kota/Kabupaten, Provinsi</Text>
            <Text style={pdfStyles.value}>
              {valueOrDash(student.city)}, {valueOrDash(student.province)}
            </Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Kode Pos</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.postal_code)}</Text>
          </View>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Data Orang Tua/Wali</Text>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Nama Ayah</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.father_name)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Pekerjaan Ayah</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.father_occupation)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>No. Telepon Ayah</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.father_phone)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Nama Ibu</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.mother_name)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Pekerjaan Ibu</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.mother_occupation)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>No. Telepon Ibu</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.mother_phone)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Nama Wali</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.guardian_name)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Pekerjaan Wali</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.guardian_occupation)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>No. Telepon Wali</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.guardian_phone)}</Text>
          </View>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Asal Sekolah dan Jurusan</Text>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Sekolah Asal</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.school_origin)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Alamat Sekolah Asal</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.school_address)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Tahun Lulus</Text>
            <Text style={pdfStyles.value}>{valueOrDash(student.graduation_year)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.key}>Jurusan</Text>
            <Text style={pdfStyles.value}>
              {valueOrDash(MAJOR_OPTIONS.find((m) => m.value === student.first_choice)?.label || student.first_choice)}
            </Text>
          </View>
        </View>

        <Text style={pdfStyles.footer}>
          Dokumen ini dihasilkan otomatis oleh sistem PPDB.
        </Text>
      </Page>
    </PdfDocument>
  )
}

export default function CetakPage() {
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<Student | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiGet<{ student: Student | null }>("/students/me")
        if (res.student) setStudent(res.student)
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
        }
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const pdfFileName = useMemo(() => {
    const rawName = student?.full_name || "siswa"
    const safeName = rawName.replace(/[^a-zA-Z0-9-_ ]/g, "").trim().replace(/\s+/g, "-")
    return `formulir-ppdb-${safeName || "siswa"}.pdf`
  }, [student?.full_name])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="container mx-auto p-4 py-8">
        <Card className="mx-auto max-w-xl">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <AlertCircle className="mb-4 h-14 w-14 text-warning" />
            <h2 className="mb-2 text-xl font-semibold">Data pendaftaran belum tersedia</h2>
            <p className="mb-6 text-muted-foreground">
              Lengkapi formulir pendaftaran terlebih dahulu sebelum mencetak PDF.
            </p>
            <Link href="/siswa/pendaftaran">
              <Button>Isi Formulir</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Cetak Formulir</h1>
          <p className="mt-1 text-muted-foreground">
            Unduh formulir pendaftaran dalam format PDF.
          </p>
        </div>
        <Link href="/siswa/hasil">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Ringkasan Data Pendaftaran
          </CardTitle>
          <CardDescription>
            Pastikan data sudah benar sebelum file PDF diunduh.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Nama</p>
              <p className="font-medium">{student.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status Pendaftaran</p>
              <Badge variant="secondary" className="capitalize">
                {student.registration_status.replace("_", " ")}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sekolah Asal</p>
              <p className="font-medium">{valueOrDash(student.school_origin)}</p>
            </div>
          </div>

          <PDFDownloadLink
            document={<RegistrationPdf student={student} />}
            fileName={pdfFileName}
          >
            {({ loading: pdfLoading }) => (
              <Button size="lg" className="gap-2" disabled={pdfLoading}>
                {pdfLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyiapkan PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Unduh Formulir PDF
                  </>
                )}
              </Button>
            )}
          </PDFDownloadLink>
        </CardContent>
      </Card>
    </div>
  )
}
