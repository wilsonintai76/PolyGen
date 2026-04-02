-- PolyGen: Assessment Paper Generator - Supabase Schema
-- This schema defines the structure for institutional data, question banks, and generated papers.

-- 1. Institutional Data
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.programmes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    programme_id UUID REFERENCES public.programmes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    position TEXT,
    department_id UUID REFERENCES public.departments(id),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Question Bank
CREATE TABLE IF NOT EXISTS public.question_bank (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content JSONB NOT NULL, -- Stores question text, options, correct answer
    type TEXT NOT NULL, -- MCQ, TRUE_FALSE, SHORT_ANSWER, ESSAY
    difficulty TEXT CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    clo TEXT, -- Course Learning Outcome mapping
    bloom_level TEXT, -- C1-C6
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Assessment Papers
CREATE TABLE IF NOT EXISTS public.assessment_papers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    total_marks INTEGER DEFAULT 0,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FINAL', 'ARCHIVED')),
    settings JSONB DEFAULT '{}'::jsonb, -- Stores paper configuration (time limit, instructions, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Paper Questions (Junction Table)
CREATE TABLE IF NOT EXISTS public.paper_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paper_id UUID REFERENCES public.assessment_papers(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.question_bank(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    marks INTEGER DEFAULT 1,
    UNIQUE(paper_id, question_id)
);

-- 6. Global MQF/CIST Data (Existing)
CREATE TABLE IF NOT EXISTS public.global_mqfs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_mqfs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public/Authenticated Read Access for Institutional Data
CREATE POLICY "Allow read access to all for departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Allow read access to all for programmes" ON public.programmes FOR SELECT USING (true);
CREATE POLICY "Allow read access to all for courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow read access to all for global_mqfs" ON public.global_mqfs FOR SELECT USING (true);

-- Profiles: Users can view all, but only edit their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Question Bank: Users can view all, but only manage their own
CREATE POLICY "Questions are viewable by authenticated users" ON public.question_bank FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own questions" ON public.question_bank FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own questions" ON public.question_bank FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own questions" ON public.question_bank FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Assessment Papers: Users can view all, but only manage their own
CREATE POLICY "Papers are viewable by authenticated users" ON public.assessment_papers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own papers" ON public.assessment_papers FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own papers" ON public.assessment_papers FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own papers" ON public.assessment_papers FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Paper Questions: Linked to paper ownership
CREATE POLICY "Paper questions are viewable by authenticated users" ON public.paper_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage questions in their own papers" ON public.paper_questions FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.assessment_papers WHERE id = paper_id AND author_id = auth.uid()));

-- 7. Triggers for Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Default Data for Departments
INSERT INTO public.departments (name, code) VALUES
    ('JABATAN TEKNOLOGI MAKLUMAT & KOMUNIKASI', 'JTMK'),
    ('JABATAN KEJURUTERAAN ELEKTRIK', 'JKE'),
    ('JABATAN KEJURUTERAAN MEKANIKAL', 'JKM'),
    ('JABATAN KEJURUTERAAN AWAM', 'JKA')
ON CONFLICT DO NOTHING;
