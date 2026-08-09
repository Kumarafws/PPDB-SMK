-- Allow admin and superadmin to manage school_settings
DROP POLICY IF EXISTS "school_settings_manage_superadmin" ON public.school_settings;

CREATE POLICY "school_settings_manage_admin"
ON public.school_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);
