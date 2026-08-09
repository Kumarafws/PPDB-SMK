import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, FileText, Calendar, CheckCircle, Users, Clock, ArrowRight } from "lucide-react"

const waveFeeCards = [
  {
    title: "Jalur Peminatan",
    period: "12 Januari 2026 - 28 Februari 2026",
    total: "Rp.1.100.000",
    items: [
      { label: "Seragam, Wearpack dan Atribut", amount: "Rp.950.000" },
      { label: "BPP Bulan Juli", amount: "Rp.150.000" },
      { label: "Adm. Pendidikan & Asuransi", amount: "Rp.130.000", discountAmount: "Gratis" },
      { label: "Bantuan Praktikum", amount: "Rp.170.000", discountAmount: "Gratis" },
      { label: "PLS", amount: "Rp.80.000", discountAmount: "Gratis" },
      { label: "Ekskul dan Osis", amount: "Rp.170.000", discountAmount: "Gratis" },
      { label: "PSG & BKK", amount: "Rp.150.000", discountAmount: "Gratis" },
    ],
  },
  {
    title: "Jalur Umum Gel 1",
    period: "01 Maret 2026 - 31 Mei 2026",
    total: "Rp.1.550.000",
    items: [
      { label: "Seragam, Wearpack dan Atribut", amount: "Rp.950.000" },
      { label: "BPP Bulan Juli", amount: "Rp.150.000" },
      { label: "Adm. Pendidikan & Asuransi", amount: "Rp.130.000", discountAmount: "Rp.100.000" },
      { label: "Bantuan Praktikum", amount: "Rp.170.000", discountAmount: "Rp.100.000" },
      { label: "PLS", amount: "Rp.80.000", discountAmount: "Rp.50.000" },
      { label: "Ekskul dan Osis", amount: "Rp.170.000", discountAmount: "Rp.100.000" },
      { label: "PSG & BKK", amount: "Rp.150.000", discountAmount: "Rp.100.000" },
    ],
  },
  {
    title: "Jalur Umum Gel 2",
    period: "01 Juni 2026 - 20 Juli 2026",
    total: "Rp.1.800.000",
    items: [
      { label: "Seragam, Wearpack dan Atribut", amount: "Rp.950.000" },
      { label: "BPP Bulan Juli", amount: "Rp.150.000" },
      { label: "Adm. Pendidikan & Asuransi", amount: "Rp.130.000" },
      { label: "Bantuan Praktikum", amount: "Rp.170.000" },
      { label: "PLS", amount: "Rp.80.000" },
      { label: "Ekskul dan Osis", amount: "Rp.170.000" },
      { label: "PSG & BKK", amount: "Rp.150.000" },
    ],
  },
]

const kegiatanCards = [
  { title: "Praktik TJKT", subtitle: "SMK Panca Bhakti Rakit" },
  { title: "Praktik TJKT", subtitle: "SMK Panca Bhakti Rakit" },
  { title: "Praktik TJKT", subtitle: "SMK Panca Bhakti Rakit" },
  { title: "Praktik TO", subtitle: "SMK Panca Bhakti Rakit" },
  { title: "Praktik TO", subtitle: "SMK Panca Bhakti Rakit" },
  { title: "Praktik TO", subtitle: "SMK Panca Bhakti Rakit" },
  { title: "PMR PBR", subtitle: "SMK Panca Bhakti Rakit" },
  {
    title: "Juara 3 Kategori Speed Kicking Junior Putri",
    subtitle: "Kejurnas Taekwondo Papua Open 2021 Piala Kemenpora",
  },
  { title: "Paskibra 2022", subtitle: "SMK Panca Bhakti Rakit" },
  { title: "Pelantikan OSIS", subtitle: "SMK Panca Bhakti Rakit" },
  { title: "LDKS Gabungan", subtitle: "SMK Panca Bhakti Rakit" },
  { title: "Kegiatan P5", subtitle: "SMK Panca Bhakti Rakit" },
  { title: "Pramuka PBR", subtitle: "SMK Panca Bhakti Rakit" },
  { title: "Multimedia PBR", subtitle: "SMK Panca Bhakti Rakit" },
  { title: "KI PBR", subtitle: "SMK Panca Bhakti Raki" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">PPDB SMK Panca Bhakti Rakit</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#alur" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Alur Pendaftaran
            </Link>
            <Link href="#jurusan" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Jurusan
            </Link>
            <Link href="#jadwal" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Jadwal
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">Masuk</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Daftar Sekarang</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-primary/5 to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-pretty text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Penerimaan Peserta Didik Baru SMK Panca Bhakti Rakit
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Daftarkan diri Anda untuk menjadi bagian dari keluarga besar SMK kami. 
              Proses pendaftaran mudah, cepat, dan dapat dilakukan secara online.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/register">
                <Button size="lg" className="w-full gap-2 sm:w-auto">
                  Mulai Pendaftaran
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#alur">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Lihat Alur Pendaftaran
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gelombang & Biaya Section */}
      <section className="border-t bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">
              Informasi Gelombang dan Biaya
            </h2>
            <p className="text-muted-foreground">
              Pilih jalur pendaftaran sesuai periode dan rincian biaya yang berlaku.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {waveFeeCards.map((wave) => (
              <Card key={wave.title} className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl">{wave.title}</CardTitle>
                  <CardDescription>{wave.period}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {wave.items.map((item) => (
                      <div
                        key={`${wave.title}-${item.label}`}
                        className="flex items-start justify-between gap-3 border-b pb-2 text-sm last:border-b-0"
                      >
                        <p className="text-muted-foreground">{item.label}</p>
                        <div className="text-right">
                          <p className={item.discountAmount ? "text-xs text-muted-foreground line-through" : ""}>
                            {item.amount}
                          </p>
                          {item.discountAmount ? (
                            <p className="font-medium text-success">{item.discountAmount}</p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-md bg-primary/5 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">Total</p>
                    <p className="text-xl font-bold text-foreground">{wave.total}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="border-y bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary lg:text-4xl">500+</div>
              <div className="mt-1 text-sm text-muted-foreground">Pendaftar</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary lg:text-4xl">2</div>
              <div className="mt-1 text-sm text-muted-foreground">Jurusan</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary lg:text-4xl">95%</div>
              <div className="mt-1 text-sm text-muted-foreground">Tingkat Kelulusan</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary lg:text-4xl">50+</div>
              <div className="mt-1 text-sm text-muted-foreground">Guru Profesional</div>
            </div>
          </div>
        </div>
      </section>

      {/* Keunggulan Sekolah Section */}
      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-center text-3xl font-bold text-foreground">
              Mengapa harus sekolah di SMK Panca Bhakti Rakit?
            </h2>
            <Card>
              <CardContent className="p-6 md:p-8">
                <ul className="space-y-3 text-muted-foreground">
                  <li>• Sekolah aman.</li>
                  <li>• Biaya sekolah murah.</li>
                  <li>• Diajar oleh guru berpengalaman dengan tingkat pendidikan S1-S2.</li>
                  <li>• Pembelajaran praktik kejuruan mengacu standar industri.</li>
                  <li>• Disalurkan ke dunia kerja.</li>
                  <li>• Alumni dibekali sertifikat kompetensi berstandar nasional / BNSP.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Alur Pendaftaran Section */}
      <section id="alur" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Alur Pendaftaran</h2>
            <p className="text-muted-foreground">
              Ikuti langkah-langkah berikut untuk mendaftar menjadi siswa baru
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative">
              <div className="absolute -top-3 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                1
              </div>
              <CardHeader className="pt-8">
                <Users className="mb-2 h-8 w-8 text-primary" />
                <CardTitle className="text-lg">Registrasi Akun</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Buat akun dengan email dan password untuk memulai pendaftaran
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="relative">
              <div className="absolute -top-3 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                2
              </div>
              <CardHeader className="pt-8">
                <FileText className="mb-2 h-8 w-8 text-primary" />
                <CardTitle className="text-lg">Isi Formulir</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Lengkapi data diri, data orang tua, dan pilihan jurusan
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="relative">
              <div className="absolute -top-3 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                3
              </div>
              <CardHeader className="pt-8">
                <Calendar className="mb-2 h-8 w-8 text-primary" />
                <CardTitle className="text-lg">Upload Dokumen</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Unggah dokumen yang diperlukan seperti ijazah, KK, dan foto
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="relative">
              <div className="absolute -top-3 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                4
              </div>
              <CardHeader className="pt-8">
                <CheckCircle className="mb-2 h-8 w-8 text-primary" />
                <CardTitle className="text-lg">Verifikasi</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Tunggu verifikasi dan pengumuman hasil seleksi penerimaan
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Jurusan Section */}
      <section id="jurusan" className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Jurusan</h2>
            <p className="text-muted-foreground">
              Pilih jurusan yang sesuai dengan minat dan bakatmu
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
            {[
              {
                code: "TJKT",
                name: "Teknik Jaringan Komputer & Telekomunikasi",
                desc: "Dalam jurusan TJKT ini, siswa diajak untuk menguasai perangkat keras komputer, membuat jaringannya, Cloud Computing, serta dibekali juga tentang keamanan siber.",
                expertise: [
                  "Cloud Computing",
                  "Keamanan Cyber",
                  "Internet Of Things",
                  "Perakitan Komputer",
                  "Instalasi Software",
                  "Fiber Optic Networking",
                  "Wireless Networking",
                  "Design Graphics",
                  "Server Administration",
                ],
              },
              {
                code: "TO",
                name: "Teknik Otomotif",
                desc: "Dalam jurusan TO ini, siswa akan diajak belajar cara merancang, membuat, merawat hingga memperbaiki kendaraan ringan baik motor maupun mobil.",
                expertise: [
                  "Tune Up",
                  "Kelistrikan",
                  "Chasis",
                  "Maintainance Otomotif",
                  "Overhoul",
                  "Pengapian",
                  "Measuring Tools",
                ],
              },
            ].map((jurusan) => (
              <Card key={jurusan.code} className="w-full transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">{jurusan.code}</CardTitle>
                  <CardDescription className="text-base font-medium text-foreground">
                    {jurusan.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <p className="text-sm text-muted-foreground">{jurusan.desc}</p>
                  <div>
                    <p className="mb-3 text-sm font-semibold tracking-wide text-foreground">EXPERTISE</p>
                    <div className="flex flex-wrap gap-2">
                      {jurusan.expertise.map((item) => (
                        <span
                          key={`${jurusan.code}-${item}`}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Kegiatan Kami Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-2 text-3xl font-bold text-foreground">Kegiatan Kami</h2>
            <p className="mb-2 text-lg font-medium text-foreground">Apa aja?</p>
            <p className="text-muted-foreground">Berikut kegiatan kami dari tahun ke tahun</p>
          </div>

          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {kegiatanCards.map((item, index) => (
              <Card key={`${item.title}-${index}`} className="overflow-hidden transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex aspect-video items-center justify-center rounded-md border-2 border-dashed bg-muted/40 text-sm text-muted-foreground">
                    Gambar akan ditambahkan
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Jadwal Section */}
      <section id="jadwal" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Jadwal Penting</h2>
            <p className="text-muted-foreground">
              Pastikan Anda tidak melewatkan tanggal-tanggal penting berikut
            </p>
          </div>
          <div className="mx-auto max-w-2xl">
            <div className="space-y-4">
              {[
                { date: '1 - 30 Juni 2026', event: 'Pendaftaran Online', status: 'active' },
                { date: '1 - 7 Juli 2026', event: 'Verifikasi Dokumen', status: 'upcoming' },
                { date: '8 - 14 Juli 2026', event: 'Wawancara', status: 'upcoming' },
                { date: '15 Juli 2026', event: 'Pengumuman Hasil Seleksi', status: 'upcoming' },
                { date: '16 - 20 Juli 2026', event: 'Daftar Ulang', status: 'upcoming' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 rounded-lg border bg-card p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{item.event}</div>
                    <div className="text-sm text-muted-foreground">{item.date}</div>
                  </div>
                  {item.status === 'active' && (
                    <span className="rounded-full bg-success/20 px-3 py-1 text-xs font-medium text-success">
                      Berlangsung
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
            Siap Bergabung?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
            Jangan lewatkan kesempatan untuk menjadi bagian dari SMK kami. 
            Daftarkan diri Anda sekarang!
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="gap-2">
              Daftar Sekarang
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Lokasi Sekolah Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">Lokasi Sekolah</h2>
            <p className="text-muted-foreground">
              Kunjungi sekolah secara langsung. Gunakan peta berikut untuk akses rute tercepat.
            </p>
          </div>

          <Card className="mx-auto max-w-5xl overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video w-full">
                <iframe
                  src="https://www.google.com/maps?cid=10670006345224765363&hl=id&gl=ID&output=embed"
                  title="Lokasi SMK Panca Bhakti Rakit"
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="flex justify-end border-t p-4">
                <a
                  href="https://maps.google.com/?cid=10670006345224765363&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYASAA&hl=id&gl=ID&source=embed"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">Buka di Google Maps</Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Kontak Admin Section */}
      <section className="border-t bg-muted/30 py-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground sm:text-base">
            Jika ada pertanyaan, hubungi admin via WhatsApp{" "}
            <a
              href="https://wa.me/6285293355133"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              +62 852-9335-5133
            </a>
            .
          </p>
          <a
            href="https://wa.me/6285293355133"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center rounded-md bg-green-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Hubungi Admin via WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-semibold text-foreground">PPDB SMK Panca Bhakti Rakit</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2026 SMK Panca Bhakti Rakit. Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
