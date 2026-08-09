/**
 * Membaca reports/jest-results.json (keluaran jest --json)
 * dan menulis laporan teks + Markdown berisi ringkasan dan tabel untuk lampiran skripsi.
 *
 * Penggunaan:
 *   node scripts/format-jest-report.mjs
 */

import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const jsonPath = join(root, "reports", "jest-results.json")
const txtPath = join(root, "reports", "laporan-pengujian-jest.txt")
const mdPath = join(root, "reports", "laporan-pengujian-jest.md")

function pad(str, len) {
  const s = String(str)
  return s.length >= len ? s : s + " ".repeat(len - s.length)
}

function formatMs(ms) {
  if (ms == null || Number.isNaN(ms)) return "-"
  return `${Math.round(ms)} ms`
}

let data
try {
  const raw = readFileSync(jsonPath, "utf8")
  data = JSON.parse(raw)
} catch (e) {
  console.error(
    "Gagal membaca reports/jest-results.json. Jalankan dulu:\n  npm run test:report-json\n",
    e.message
  )
  process.exit(1)
}

const lines = []
const mdLines = []

const now = new Date().toISOString()

lines.push("=".repeat(76))
lines.push("LAPORAN HASIL PENGUJIAN OTOMATIS (JEST)")
lines.push("=".repeat(76))
lines.push("")
lines.push(`Waktu generate laporan (UTC): ${now}`)
lines.push(`Status keseluruhan: ${data.success ? "BERHASIL — semua tes lolos" : "ADA KEGAGALAN"}`)
lines.push("")

const totalSuites = data.numTotalTestSuites ?? 0
const passedSuites = data.numPassedTestSuites ?? 0
const failedSuites = data.numFailedTestSuites ?? 0
const totalTests = data.numTotalTests ?? 0
const passedTests = data.numPassedTests ?? 0
const failedTests = data.numFailedTests ?? 0

lines.push("-".repeat(76))
lines.push("RINGKASAN (SUMMARY)")
lines.push("-".repeat(76))
lines.push("")
lines.push("| Metrik                  | Nilai |")
lines.push("|-------------------------|-------|")
lines.push(`| Total file / suite uji  | ${pad(totalSuites, 5)} |`)
lines.push(`| Suite lolos             | ${pad(passedSuites, 5)} |`)
lines.push(`| Suite gagal             | ${pad(failedSuites, 5)} |`)
lines.push(`| Total kasus uji         | ${pad(totalTests, 5)} |`)
lines.push(`| Kasus lolos             | ${pad(passedTests, 5)} |`)
lines.push(`| Kasus gagal             | ${pad(failedTests, 5)} |`)
lines.push("")

mdLines.push("# Laporan hasil pengujian otomatis (Jest)")
mdLines.push("")
mdLines.push(`**Waktu generate (UTC):** ${now}`)
mdLines.push("")
mdLines.push(`**Status:** ${data.success ? "Semua tes lolos" : "Ada tes yang gagal"}`)
mdLines.push("")
mdLines.push("| Metrik | Nilai |")
mdLines.push("|--------|-------|")
mdLines.push(`| Total suite | ${totalSuites} |`)
mdLines.push(`| Suite lolos | ${passedSuites} |`)
mdLines.push(`| Suite gagal | ${failedSuites} |`)
mdLines.push(`| Total kasus uji | ${totalTests} |`)
mdLines.push(`| Kasus lolos | ${passedTests} |`)
mdLines.push(`| Kasus gagal | ${failedTests} |`)
mdLines.push("")

lines.push("-".repeat(76))
lines.push("DETAIL PER FILE UJI")
lines.push("-".repeat(76))
lines.push("")

mdLines.push("## Detail per file uji")
mdLines.push("")

const results = data.testResults ?? []
let idx = 0
for (const suite of results) {
  idx += 1
  const relName = suite.name?.replace(/\\/g, "/") ?? "(tanpa nama)"
  const suiteStatus = suite.status ?? "unknown"
  lines.push(`[${idx}] ${relName}`)
  lines.push(`    Status suite: ${suiteStatus}`)
  lines.push(`    Kasus uji:`)

  mdLines.push(`### ${idx}. \`${relName}\``)
  mdLines.push("")
  mdLines.push("| No | Nama kasus uji | Status | Durasi |")
  mdLines.push("|----|----------------|--------|--------|")

  const assertions = suite.assertionResults ?? []
  let no = 0
  for (const ar of assertions) {
    no += 1
    const title = ar.title ?? ""
    const st = ar.status ?? ""
    const dur = formatMs(ar.duration)
    const mark = st === "passed" ? "[OK] " : "[X]  "
    lines.push(`      ${mark}${title} (${dur})`)

    const statusMd = st === "passed" ? "Lolos" : st === "failed" ? "Gagal" : st
    const safeTitle = String(title).replace(/\|/g, "\\|")
    mdLines.push(`| ${no} | ${safeTitle} | ${statusMd} | ${dur} |`)
  }
  lines.push("")
  mdLines.push("")
}

lines.push("=".repeat(76))
lines.push("Akhir laporan")
lines.push("=".repeat(76))

writeFileSync(txtPath, lines.join("\n"), "utf8")
writeFileSync(mdPath, mdLines.join("\n"), "utf8")

console.log(`Laporan teks:             ${txtPath}`)
console.log(`Laporan Markdown (tabel): ${mdPath}`)
