-- PPDB SMK Database Schema
-- This script creates all necessary tables for the student admission system

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'siswa' CHECK (role IN ('siswa', 'admin', 'superadmin')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Students table (student registration data)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Personal Information
  nisn TEXT,
  nik TEXT,
  full_name TEXT NOT NULL,
  birth_place TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('laki-laki', 'perempuan')),
  religion TEXT,
  address TEXT,
  rt TEXT,
  rw TEXT,
  village TEXT,
  district TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  anak_ke TEXT,
  jumlah_saudara TEXT,
  registration_info_source TEXT,
  no_kip TEXT,
  -- Parent/Guardian Information
  father_name TEXT,
  father_occupation TEXT,
  father_phone TEXT,
  mother_name TEXT,
  mother_occupation TEXT,
  mother_phone TEXT,
  guardian_name TEXT,
  guardian_occupation TEXT,
  guardian_phone TEXT,
  -- School Origin
  school_origin TEXT,
  school_address TEXT,
  graduation_year TEXT,
  -- Major Selection
  first_choice TEXT,
  second_choice TEXT,
  -- Status
  registration_status TEXT DEFAULT 'draft' CHECK (registration_status IN ('draft', 'submitted', 'verified', 'interview_scheduled', 'accepted', 'rejected')),
  document_status TEXT DEFAULT 'pending' CHECK (document_status IN ('pending', 'incomplete', 'complete', 'verified')),
  -- Interview
  interview_date TIMESTAMPTZ,
  interview_notes TEXT,
  -- Selection
  selection_status TEXT CHECK (selection_status IN ('pending', 'accepted', 'rejected')),
  selection_notes TEXT,
  accepted_major TEXT,
  -- Timestamps
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- 3. Documents table (uploaded documents)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('ktp', 'kk', 'ijazah', 'skhun', 'foto', 'akta')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, document_type)
);

-- 4. Admin Activity Logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. School Settings table (for storing school information)
CREATE TABLE IF NOT EXISTS public.school_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin/SuperAdmin can view all profiles
CREATE POLICY "profiles_admin_select" ON public.profiles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- SuperAdmin can manage all profiles
CREATE POLICY "profiles_superadmin_all" ON public.profiles 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- RLS Policies for students
CREATE POLICY "students_select_own" ON public.students 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "students_insert_own" ON public.students 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "students_update_own" ON public.students 
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "students_delete_own" ON public.students 
  FOR DELETE USING (user_id = auth.uid());

-- Admin/SuperAdmin can view and manage all students
CREATE POLICY "students_admin_select" ON public.students 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "students_admin_update" ON public.students 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- RLS Policies for documents
CREATE POLICY "documents_select_own" ON public.documents 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE students.id = documents.student_id AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "documents_insert_own" ON public.documents 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE students.id = documents.student_id AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "documents_update_own" ON public.documents 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE students.id = documents.student_id AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "documents_delete_own" ON public.documents 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE students.id = documents.student_id AND students.user_id = auth.uid()
    )
  );

-- Admin/SuperAdmin can view and manage all documents
CREATE POLICY "documents_admin_select" ON public.documents 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "documents_admin_update" ON public.documents 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- RLS Policies for admin_logs
CREATE POLICY "admin_logs_insert" ON public.admin_logs 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "admin_logs_select_superadmin" ON public.admin_logs 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- RLS Policies for school_settings
CREATE POLICY "school_settings_select_all" ON public.school_settings 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "school_settings_manage_superadmin" ON public.school_settings 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_registration_status ON public.students(registration_status);
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON public.documents(student_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at DESC);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_students_updated_at ON public.students;
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
