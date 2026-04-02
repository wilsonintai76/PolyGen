-- Run this in your Supabase SQL Editor to create the global_mqfs table

CREATE TABLE IF NOT EXISTS global_mqfs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE global_mqfs ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for now (or adjust as needed)
CREATE POLICY "Allow all access on global_mqfs" ON global_mqfs FOR ALL USING (true) WITH CHECK (true);

-- Insert some default values if needed
INSERT INTO global_mqfs (code, description) VALUES
('MQF1', 'Knowledge and Understanding'),
('MQF2', 'Cognitive Skills'),
('MQF3', 'Practical Skills'),
('MQF4', 'Interpersonal Skills'),
('MQF5', 'Communication, Leadership and Teamwork Skills'),
('MQF6', 'Personal and Entrepreneurial Skills'),
('MQF7', 'Numeracy, Digital and Leadership Skills'),
('MQF8', 'Ethics and Professionalism')
ON CONFLICT (code) DO NOTHING;
