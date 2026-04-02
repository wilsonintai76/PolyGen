
-- Seed Learning Domains
INSERT INTO learning_domains (name) VALUES 
('Cognitive'),
('Psychomotor'),
('Affective')
ON CONFLICT (name) DO NOTHING;

-- Seed Taxonomies
DO $$
DECLARE
    cog_id UUID;
    psy_id UUID;
    aff_id UUID;
BEGIN
    SELECT id INTO cog_id FROM learning_domains WHERE name = 'Cognitive';
    SELECT id INTO psy_id FROM learning_domains WHERE name = 'Psychomotor';
    SELECT id INTO aff_id FROM learning_domains WHERE name = 'Affective';

    -- Cognitive
    INSERT INTO taxonomies (domain_id, level, description) VALUES
    (cog_id, 'C1', 'Knowledge'),
    (cog_id, 'C2', 'Comprehension'),
    (cog_id, 'C3', 'Application'),
    (cog_id, 'C4', 'Analysis'),
    (cog_id, 'C5', 'Synthesis'),
    (cog_id, 'C6', 'Evaluation')
    ON CONFLICT DO NOTHING;

    -- Psychomotor
    INSERT INTO taxonomies (domain_id, level, description) VALUES
    (psy_id, 'P1', 'Perception'),
    (psy_id, 'P2', 'Set'),
    (psy_id, 'P3', 'Guided Response'),
    (psy_id, 'P4', 'Mechanism'),
    (psy_id, 'P5', 'Complex Overt Response'),
    (psy_id, 'P6', 'Adaptation'),
    (psy_id, 'P7', 'Origination')
    ON CONFLICT DO NOTHING;

    -- Affective
    INSERT INTO taxonomies (domain_id, level, description) VALUES
    (aff_id, 'A1', 'Receiving'),
    (aff_id, 'A2', 'Responding'),
    (aff_id, 'A3', 'Valuing'),
    (aff_id, 'A4', 'Organization'),
    (aff_id, 'A5', 'Characterization')
    ON CONFLICT DO NOTHING;
END $$;

-- Seed Item Types
INSERT INTO item_types (code, name) VALUES
('O', 'Objective'),
('S', 'Subjective'),
('P', 'Practical'),
('R', 'Report'),
('A', 'Assignment')
ON CONFLICT (code) DO NOTHING;

-- Seed Dublin Accords
INSERT INTO dublin_accords (code, description) VALUES
('DK1', 'A systematic, theory-based understanding of the natural sciences applicable to the sub-discipline'),
('DK2', 'Concept-based theoretical background of engineering fundamentals required to help provide a foundation for engineering design and solve well-defined engineering problems'),
('DK3', 'A systematic, theory-based understanding of the natural sciences applicable to the sub-discipline'),
('DK4', 'Concept-based theoretical background of engineering fundamentals required to help provide a foundation for engineering design and solve well-defined engineering problems')
ON CONFLICT (code) DO NOTHING;
