-- Run this script in the Supabase SQL Editor to secure your database

-- 1. Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dublin_accords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_mqfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_mqfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_clos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_policies ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (if any) to start fresh
DROP POLICY IF EXISTS "Public Access" ON public.users;
DROP POLICY IF EXISTS "Public Access" ON public.departments;
DROP POLICY IF EXISTS "Public Access" ON public.programmes;
DROP POLICY IF EXISTS "Public Access" ON public.courses;
DROP POLICY IF EXISTS "Public Access" ON public.learning_domains;
DROP POLICY IF EXISTS "Public Access" ON public.taxonomies;
DROP POLICY IF EXISTS "Public Access" ON public.item_types;
DROP POLICY IF EXISTS "Public Access" ON public.dublin_accords;
DROP POLICY IF EXISTS "Public Access" ON public.global_mqfs;
DROP POLICY IF EXISTS "Public Access" ON public.course_mqfs;
DROP POLICY IF EXISTS "Public Access" ON public.course_clos;
DROP POLICY IF EXISTS "Public Access" ON public.course_topics;
DROP POLICY IF EXISTS "Public Access" ON public.assessment_policies;

-- 3. Create new policies based on authenticated users

-- Users table: 
-- Users can read all users (needed for admin panel and references)
CREATE POLICY "Users can read all users" ON public.users
  FOR SELECT TO authenticated USING (true);

-- Users can update their own profile, or Admins can update any profile
CREATE POLICY "Users can update own profile or Admins can update all" ON public.users
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'Administrator')
  );

-- Only Admins can delete users
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'Administrator'));

-- Allow insert during registration (since RLS might block insert if not authenticated yet, 
-- but Supabase auth.signUp logs the user in, so they are authenticated. 
-- However, just in case, we can allow authenticated users to insert their own record)
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- For all other tables (departments, courses, etc.):
-- Allow all authenticated users to read, insert, update, and delete.
-- (You can restrict this further later, e.g., only Admins can delete courses)

CREATE POLICY "Authenticated users can access departments" ON public.departments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access programmes" ON public.programmes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access courses" ON public.courses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access learning_domains" ON public.learning_domains FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access taxonomies" ON public.taxonomies FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access item_types" ON public.item_types FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access dublin_accords" ON public.dublin_accords FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access global_mqfs" ON public.global_mqfs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access course_mqfs" ON public.course_mqfs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access course_clos" ON public.course_clos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access course_topics" ON public.course_topics FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access assessment_policies" ON public.assessment_policies FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Storage Policies (if using Supabase Storage for avatars/files)
-- Assuming a bucket named 'avatars' or similar exists. If not, this will just be ignored or error safely.
-- DROP POLICY IF EXISTS "Public Access" ON storage.objects;
-- CREATE POLICY "Authenticated users can access storage" ON storage.objects FOR ALL TO authenticated USING (true) WITH CHECK (true);
