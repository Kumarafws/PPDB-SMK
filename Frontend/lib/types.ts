// Database Types for PPDB SMK

export type UserRole = 'siswa' | 'admin' | 'superadmin'

export type RegistrationStatus = 'draft' | 'submitted' | 'verified' | 'interview_scheduled' | 'accepted' | 'rejected'

export type DocumentStatus = 'pending' | 'incomplete' | 'complete' | 'verified'

export type DocumentType = 'ktp' | 'kk' | 'ijazah' | 'skhun' | 'foto' | 'akta'

/** Urutan dokumen wajib; selaras dengan formulir upload siswa (6 dokumen). */
export const DOCUMENT_TYPE_ORDER: DocumentType[] = [
  'ktp',
  'kk',
  'ijazah',
  'skhun',
  'foto',
  'akta',
]

export type SelectionStatus = 'pending' | 'accepted' | 'rejected'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  user_id: string
  // Personal Information
  nisn: string | null
  nik: string | null
  full_name: string
  birth_place: string | null
  birth_date: string | null
  gender: 'laki-laki' | 'perempuan' | null
  religion: string | null
  address: string | null
  rt: string | null
  rw: string | null
  village: string | null
  district: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  phone: string | null
  email: string | null
  anak_ke: string | null
  jumlah_saudara: string | null
  registration_info_source: string | null
  no_kip: string | null
  // Parent/Guardian Information
  father_name: string | null
  father_occupation: string | null
  father_phone: string | null
  mother_name: string | null
  mother_occupation: string | null
  mother_phone: string | null
  guardian_name: string | null
  guardian_occupation: string | null
  guardian_phone: string | null
  // School Origin
  school_origin: string | null
  school_address: string | null
  graduation_year: string | null
  // Major Selection
  first_choice: string | null
  // Status
  registration_status: RegistrationStatus
  document_status: DocumentStatus
  // Interview
  interview_date: string | null
  interview_notes: string | null
  // Selection
  selection_status: SelectionStatus | null
  selection_notes: string | null
  accepted_major: string | null
  // Timestamps
  submitted_at: string | null
  verified_at: string | null
  verified_by: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  student_id: string
  document_type: DocumentType
  file_url: string
  file_name: string
  file_size: number | null
  status: 'pending' | 'verified' | 'rejected'
  rejection_reason: string | null
  verified_at: string | null
  verified_by: string | null
  created_at: string
  updated_at: string
}

export interface AdminLog {
  id: string
  admin_id: string
  action: string
  target_type: string | null
  target_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export interface SchoolSetting {
  id: string
  key: string
  value: string | null
  created_at: string
  updated_at: string
}

export type WaveType = "peminatan" | "umum_1" | "umum_2"

export interface AcademicWave {
  type: WaveType
  label: string
  start_at: string
  end_at: string
}

export interface AcademicYear {
  id: string
  name: string
  is_active: boolean
  waves: AcademicWave[]
  created_at: string
  updated_at: string
}

// Form types for multi-step registration
export interface PersonalInfoForm {
  nisn: string
  nik: string
  full_name: string
  birth_place: string
  birth_date: string
  gender: 'laki-laki' | 'perempuan'
  religion: string
  phone: string
  email: string
}

export interface AddressForm {
  address: string
  rt: string
  rw: string
  village: string
  district: string
  city: string
  province: string
  postal_code: string
}

export interface ParentForm {
  father_name: string
  father_occupation: string
  father_phone: string
  mother_name: string
  mother_occupation: string
  mother_phone: string
  guardian_name?: string
  guardian_occupation?: string
  guardian_phone?: string
}

export interface SchoolForm {
  school_origin: string
  school_address: string
  graduation_year: string
  first_choice: string
}

// Dashboard statistics
export interface DashboardStats {
  totalPendaftar: number
  pendaftarBaru: number
  sudahVerifikasi: number
  jadwalWawancara: number
  diterima: number
  ditolak: number
}

// Major options
export const MAJOR_OPTIONS = [
  { value: 'rpl', label: 'Rekayasa Perangkat Lunak (RPL)' },
  { value: 'otomotif', label: 'Otomotif' },
] as const

export const RELIGION_OPTIONS = [
  'Islam',
  'Kristen',
  'Katolik',
  'Hindu',
  'Buddha',
  'Konghucu',
] as const

export const REGISTRATION_INFO_SOURCE_OPTIONS = [
  "Orang Tua/Saudara",
  "Teman",
  "Grup WA",
  "Sosial Media",
] as const

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  ktp: 'KTP/Kartu Pelajar',
  kk: 'Kartu Keluarga',
  ijazah: 'Ijazah/Surat Keterangan Lulus',
  skhun: 'SKHUN/Transkrip Nilai',
  foto: 'Pas Foto 3x4',
  akta: 'Akta Kelahiran',
}

export const STATUS_LABELS: Record<RegistrationStatus, string> = {
  draft: 'Draft',
  submitted: 'Menunggu Verifikasi',
  verified: 'Terverifikasi',
  interview_scheduled: 'Jadwal Wawancara',
  accepted: 'Diterima',
  rejected: 'Ditolak',
}

export const STATUS_COLORS: Record<RegistrationStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  submitted: 'bg-warning/20 text-warning-foreground',
  verified: 'bg-primary/20 text-primary',
  interview_scheduled: 'bg-accent/20 text-accent-foreground',
  accepted: 'bg-success/20 text-success',
  rejected: 'bg-destructive/20 text-destructive',
}
