-- PPDB schema (match Prisma schema.prisma)
-- Recommended: run as a single script in psql/pgAdmin

BEGIN;

-- UUID generator
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('siswa', 'admin', 'superadmin');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status') THEN
    CREATE TYPE registration_status AS ENUM (
      'draft', 'submitted', 'verified', 'interview_scheduled', 'accepted', 'rejected'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'student_document_status') THEN
    CREATE TYPE student_document_status AS ENUM ('pending', 'incomplete', 'complete', 'verified');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
    CREATE TYPE document_type AS ENUM ('ktp', 'kk', 'ijazah', 'skhun', 'foto', 'akta');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_verification_status') THEN
    CREATE TYPE document_verification_status AS ENUM ('pending', 'verified', 'rejected');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'selection_status') THEN
    CREATE TYPE selection_status AS ENUM ('pending', 'accepted', 'rejected');
  END IF;
END $$;

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text      NOT NULL UNIQUE,
  password_hash text      NOT NULL,
  full_name     text,
  role          user_role NOT NULL DEFAULT 'siswa',
  phone         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Table: students
CREATE TABLE IF NOT EXISTS students (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

  nisn      text,
  nik       text,
  full_name text NOT NULL,

  birth_place text,
  birth_date  timestamptz,
  gender      text,
  religion    text,

  address     text,
  rt          text,
  rw          text,
  village     text,
  district    text,
  city        text,
  province    text,
  postal_code text,

  phone text,
  email text,

  anak_ke                  text,
  jumlah_saudara           text,
  registration_info_source text,
  no_kip                   text,

  father_name         text,
  father_occupation   text,
  father_phone        text,
  mother_name         text,
  mother_occupation   text,
  mother_phone        text,
  guardian_name       text,
  guardian_occupation text,
  guardian_phone      text,

  school_origin   text,
  school_address  text,
  graduation_year text,
  first_choice    text,

  registration_status registration_status NOT NULL DEFAULT 'draft',
  document_status     student_document_status NOT NULL DEFAULT 'pending',

  interview_date  timestamptz,
  interview_notes text,

  selection_status selection_status,
  selection_notes  text,
  accepted_major   text,

  submitted_at timestamptz,
  verified_at  timestamptz,
  verifier_id  uuid REFERENCES profiles(id),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_students_updated_at ON students;
CREATE TRIGGER trg_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Helpful indexes for common queries
CREATE INDEX IF NOT EXISTS idx_students_registration_status ON students(registration_status);
CREATE INDEX IF NOT EXISTS idx_students_full_name ON students(full_name);
CREATE INDEX IF NOT EXISTS idx_students_verifier_id ON students(verifier_id);

-- Table: documents
CREATE TABLE IF NOT EXISTS documents (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  document_type document_type NOT NULL,
  file_url      text NOT NULL,
  file_name     text NOT NULL,
  file_size     integer,

  status           document_verification_status NOT NULL DEFAULT 'pending',
  rejection_reason text,
  verified_at      timestamptz,
  verified_by_id   uuid REFERENCES profiles(id),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_documents_student_type UNIQUE (student_id, document_type)
);

DROP TRIGGER IF EXISTS trg_documents_updated_at ON documents;
CREATE TRIGGER trg_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_documents_student_id ON documents(student_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_verified_by_id ON documents(verified_by_id);

-- Table: admin_logs
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  admin_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  action       text NOT NULL,
  target_type  text,
  target_id    text,
  details_json text,
  ip_address   text,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);

-- Table: school_settings
CREATE TABLE IF NOT EXISTS school_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_school_settings_updated_at ON school_settings;
CREATE TRIGGER trg_school_settings_updated_at
BEFORE UPDATE ON school_settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;