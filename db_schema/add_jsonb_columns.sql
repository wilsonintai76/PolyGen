-- 1. Add missing JSONB columns to questions
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS figure_label TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT,
ADD COLUMN IF NOT EXISTS table_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS construct TEXT,
ADD COLUMN IF NOT EXISTS domain TEXT,
ADD COLUMN IF NOT EXISTS answer_image_url TEXT,
ADD COLUMN IF NOT EXISTS answer_figure_label TEXT;

-- 2. Add missing JSONB columns to assessment_papers
ALTER TABLE public.assessment_papers
ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS clo_definitions JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS mqf_clusters JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS feedback TEXT,
ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS checklist_notes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb;
