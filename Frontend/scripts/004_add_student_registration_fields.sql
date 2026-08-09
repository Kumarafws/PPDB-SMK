-- Add additional registration fields for student form
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS anak_ke TEXT,
  ADD COLUMN IF NOT EXISTS jumlah_saudara TEXT,
  ADD COLUMN IF NOT EXISTS registration_info_source TEXT,
  ADD COLUMN IF NOT EXISTS no_kip TEXT;
