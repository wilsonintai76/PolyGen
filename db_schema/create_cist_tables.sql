-- 1. Global Lookup Tables
CREATE TABLE IF NOT EXISTS learning_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL -- 'Cognitive', 'Psychomotor', 'Affective'
);

CREATE TABLE IF NOT EXISTS taxonomies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID REFERENCES learning_domains(id) ON DELETE CASCADE,
    level TEXT NOT NULL, -- 'C1', 'C2', 'P1', 'A1'
    description TEXT
);

CREATE TABLE IF NOT EXISTS item_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- 'O', 'S', 'P', 'R', 'A'
    name TEXT NOT NULL -- 'Objective', 'Subjective', etc.
);

CREATE TABLE IF NOT EXISTS dublin_accords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- 'DK1', 'DK2'
    description TEXT NOT NULL
);

-- 2. Course-Level Tables
CREATE TABLE IF NOT EXISTS clos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- 'CLO 1'
    description TEXT NOT NULL,
    UNIQUE(course_id, code)
);

CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- '1.0'
    name TEXT NOT NULL, -- 'Hand Tools'
    UNIQUE(course_id, code)
);

CREATE TABLE IF NOT EXISTS constructs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- '1.1'
    description TEXT NOT NULL
);

-- 3. CIST Blueprint Tables
CREATE TABLE IF NOT EXISTS cist_blueprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    task TEXT NOT NULL, -- 'QUIZ', 'TEST', 'FINAL'
    UNIQUE(course_id, task)
);

CREATE TABLE IF NOT EXISTS cist_rows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blueprint_id UUID REFERENCES cist_blueprints(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE RESTRICT,
    construct_id UUID REFERENCES constructs(id) ON DELETE RESTRICT,
    domain_id UUID REFERENCES learning_domains(id) ON DELETE RESTRICT,
    dublin_accord_id UUID REFERENCES dublin_accords(id) ON DELETE RESTRICT,
    total_mark INTEGER NOT NULL DEFAULT 0
);

-- 4. Junction Tables for CIST Rows
CREATE TABLE IF NOT EXISTS cist_row_clos (
    row_id UUID REFERENCES cist_rows(id) ON DELETE CASCADE,
    clo_id UUID REFERENCES clos(id) ON DELETE CASCADE,
    PRIMARY KEY (row_id, clo_id)
);

CREATE TABLE IF NOT EXISTS cist_row_item_types (
    row_id UUID REFERENCES cist_rows(id) ON DELETE CASCADE,
    item_type_id UUID REFERENCES item_types(id) ON DELETE CASCADE,
    PRIMARY KEY (row_id, item_type_id)
);

CREATE TABLE IF NOT EXISTS cist_row_taxonomies (
    row_id UUID REFERENCES cist_rows(id) ON DELETE CASCADE,
    taxonomy_id UUID REFERENCES taxonomies(id) ON DELETE CASCADE,
    count INTEGER NOT NULL DEFAULT 0,
    marks INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (row_id, taxonomy_id)
);
