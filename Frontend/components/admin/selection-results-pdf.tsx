"use client"

import { PDFDownloadLink, Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

type SelectionItem = {
  id: string
  full_name: string
  email: string | null
  major_label: string
  selection_notes: string | null
  wave_label: string
}

interface SelectionResultsPdfProps {
  acceptedStudents: SelectionItem[]
  rejectedStudents: SelectionItem[]
}

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
    color: "#111827",
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#4B5563",
    marginBottom: 12,
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
    marginBottom: 12,
    border: "1px solid #E5E7EB",
    borderRadius: 4,
    padding: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: "row",
    borderBottom: "1px solid #E5E7EB",
    paddingBottom: 4,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottom: "1px solid #F3F4F6",
  },
  colName: {
    width: "26%",
    paddingRight: 6,
  },
  colMajor: {
    width: "22%",
    paddingRight: 6,
  },
  colNotes: {
    width: "34%",
    paddingRight: 6,
  },
  colWave: {
    width: "18%",
  },
  muted: {
    color: "#6B7280",
  },
})

function Letterhead() {
  const logoSrc = `${typeof window !== "undefined" ? window.location.origin : ""}/kop-logo.png`
  return (
    <View style={styles.letterhead}>
      <View style={styles.letterheadRow}>
        <Image style={styles.letterheadLogo} src={logoSrc} />
        <View style={styles.letterheadText}>
          <Text style={styles.letterheadLine1}>YAYASAN PENDIDIKAN DAN TEKNOLOGI PANCA BHAKTI</Text>
          <Text style={styles.letterheadLine2}>SEKOLAH MENENGAH KEJURUAN (SMK) PANCA BHAKTI RAKIT</Text>
          <Text style={styles.letterheadMeta}>NIS: 400190. NSS: 342030411019. NPSN: 20362369</Text>
          <Text style={styles.letterheadAddr}>
            Jl. Raya Rakit Km. 2,7 Ds. Adipasar, Kec.RakitKab. Banjarnegara 53463
          </Text>
          <Text style={styles.letterheadAddr}>Telp. 085329699994, Email: smk_pabhara@yahoo.com</Text>
        </View>
      </View>
      <View style={styles.letterheadDivider} />
      <Text style={styles.letterheadCompetency}>
        Kompetensi Keahlian: 1. Teknik Kendaraan Ringan Otomotif; 2. Teknik Komputer Jaringan
      </Text>
    </View>
  )
}

function SelectionResultsDocument({
  items,
  title,
  majorHeader,
}: {
  items: SelectionItem[]
  title: string
  majorHeader: string
}) {
  const generatedAt = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  const renderRows = (items: SelectionItem[]) =>
    items.map((item) => (
      <View key={item.id} style={styles.row}>
        <Text style={styles.colName}>{item.full_name}</Text>
        <Text style={styles.colMajor}>{item.major_label}</Text>
        <Text style={styles.colNotes}>{item.selection_notes || "-"}</Text>
        <Text style={styles.colWave}>{item.wave_label || "-"}</Text>
      </View>
    ))

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Letterhead />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Tanggal cetak: {generatedAt}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total: {items.length}</Text>
          <View style={styles.headerRow}>
            <Text style={styles.colName}>Nama</Text>
            <Text style={styles.colMajor}>{majorHeader}</Text>
            <Text style={styles.colNotes}>Catatan</Text>
            <Text style={styles.colWave}>Gelombang</Text>
          </View>
          {items.length > 0 ? (
            renderRows(items)
          ) : (
            <Text style={styles.muted}>Data belum tersedia.</Text>
          )}
        </View>
      </Page>
    </Document>
  )
}

export function SelectionResultsPdf({ acceptedStudents, rejectedStudents }: SelectionResultsPdfProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
      <PDFDownloadLink
        document={
          <SelectionResultsDocument items={acceptedStudents} title="Hasil Seleksi PPDB - Siswa Diterima" majorHeader="Jurusan" />
        }
        fileName="hasil-seleksi-diterima.pdf"
      >
        {({ loading }) => (
          <Button variant="outline" className="gap-2" disabled={loading}>
            <Download className="h-4 w-4" />
            {loading ? "Menyiapkan PDF..." : "Export Diterima"}
          </Button>
        )}
      </PDFDownloadLink>

      <PDFDownloadLink
        document={
          <SelectionResultsDocument items={rejectedStudents} title="Hasil Seleksi PPDB - Siswa Ditolak" majorHeader="Jurusan" />
        }
        fileName="hasil-seleksi-ditolak.pdf"
      >
        {({ loading }) => (
          <Button variant="outline" className="gap-2" disabled={loading}>
            <Download className="h-4 w-4" />
            {loading ? "Menyiapkan PDF..." : "Export Ditolak"}
          </Button>
        )}
      </PDFDownloadLink>
    </div>
  )
}

