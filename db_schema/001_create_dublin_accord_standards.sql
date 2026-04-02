-- Create Dublin Accord Standards table
CREATE TABLE IF NOT EXISTS dublin_accord_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_type TEXT NOT NULL CHECK (profile_type IN ('DK', 'DP', 'NA')),
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert DK Standards
INSERT INTO dublin_accord_standards (profile_type, code, title, description) VALUES
('DK', 'DK1', 'Natural Sciences', 'A descriptive, formula-based understanding of the natural sciences (Physics, Chemistry, etc.) relevant to the sub-discipline.'),
('DK', 'DK2', 'Mathematics', 'Knowledge of procedural mathematics, numerical analysis, statistics, and algebraic methods to support engineering solutions.'),
('DK', 'DK3', 'Engineering Fundamentals', 'A procedural-based understanding of the core engineering fundamentals of the practice area.'),
('DK', 'DK4', 'Specialist Knowledge', 'Specialized technical knowledge that provides the body of knowledge for the specific technician practice area.'),
('DK', 'DK5', 'Engineering Design', 'Knowledge that supports the design or operation of systems using established techniques and procedures.'),
('DK', 'DK6', 'Practical Engineering', 'A deep understanding of codified practical knowledge, including handbooks, manuals, and technical standards.'),
('DK', 'DK7', 'Issues & Ethics', 'Knowledge of professional ethics, statutory requirements, and the impact of engineering on society/environment (including Sustainable Development Goals and Diversity & Inclusion).');

-- Insert DP Standards
INSERT INTO dublin_accord_standards (profile_type, code, title, description) VALUES
('DP', 'DP1', 'Range of Knowledge', 'Can be solved using limited theoretical knowledge but requires extensive practical knowledge.'),
('DP', 'DP2', 'Conflict of Requirements', 'Involves a limited range of conflicting requirements and constraints.'),
('DP', 'DP3', 'Depth of Analysis', 'Solved by applying specific techniques, codes of practice, or documented procedures.'),
('DP', 'DP4', 'Familiarity of Issues', 'Issues are frequently encountered and involve discrete components or processes.'),
('DP', 'DP5', 'Extent of Applicable Codes', 'Solutions are encompassed by existing standards or documented practice.'),
('DP', 'DP6', 'Stakeholder Involvement', 'Involves a limited range of stakeholders with localized interests.'),
('DP', 'DP7', 'Interdependence', 'Problems have consequences that are locally important but technically limited.');

-- Insert NA Standards
INSERT INTO dublin_accord_standards (profile_type, code, title, description) VALUES
('NA', 'NA1', 'Range of Resources', 'Involves a limited range of resources, including people, money, equipment, and materials.'),
('NA', 'NA2', 'Level of Interactions', 'Requires the resolution of interactions between limited technical and engineering issues.'),
('NA', 'NA3', 'Innovation/Creativity', 'Involves the use of existing materials or processes in modified or improved ways.'),
('NA', 'NA4', 'Consequences to Society', 'Activities have locally important consequences for social, cultural, environmental, or economic aspects.'),
('NA', 'NA5', 'Familiarity', 'Requires knowledge of practical procedures and practices for widely applied tasks.');
