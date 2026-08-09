import type { AcademicWave, AcademicYear } from "@/lib/types"

type AcademicYearConfig = {
  years?: AcademicYear[]
}

export function parseAcademicYears(rawValue: string | null): AcademicYear[] {
  if (!rawValue) return []

  try {
    const parsed = JSON.parse(rawValue) as AcademicYearConfig
    if (!Array.isArray(parsed.years)) return []
    return parsed.years
  } catch {
    return []
  }
}

export function getActiveAcademicYear(years: AcademicYear[]): AcademicYear | null {
  return years.find((year) => year.is_active) || null
}

export function getWaveByRegistrationDate(
  registrationDate: string | null,
  activeYear: AcademicYear | null
): AcademicWave | null {
  if (!registrationDate || !activeYear) return null

  const registrationTime = new Date(registrationDate).getTime()
  if (Number.isNaN(registrationTime)) return null

  for (const wave of activeYear.waves) {
    const start = new Date(wave.start_at).getTime()
    const end = new Date(wave.end_at).getTime()
    if (Number.isNaN(start) || Number.isNaN(end)) continue

    if (registrationTime >= start && registrationTime <= end) {
      return wave
    }
  }

  return null
}
