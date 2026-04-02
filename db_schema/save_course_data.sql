
-- Function to save course data including CIST blueprints
CREATE OR REPLACE FUNCTION save_course_data(course_json JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_course_id UUID;
    v_clo_key TEXT;
    v_clo_desc TEXT;
    v_topic_str TEXT;
    v_topic_code TEXT;
    v_topic_name TEXT;
    
    -- Variables for CIST processing
    v_blueprint JSONB;
    v_blueprint_id UUID;
    v_row JSONB;
    v_row_id UUID;
    v_topic_id UUID;
    v_clo_id UUID;
    v_item_type_id UUID;
    v_taxonomy_id UUID;
    v_taxonomy_data JSONB;
    v_level TEXT;
    v_domain_name TEXT;
    v_domain_id UUID;
    v_accord_code TEXT;
    v_accord_id UUID;
    v_item_type_code TEXT;
    v_clo_code TEXT;
BEGIN
    -- 1. Insert or Update the Course
    IF (course_json->>'id') IS NOT NULL AND (course_json->>'id') NOT LIKE 'local-%' THEN
        v_course_id := (course_json->>'id')::UUID;
        UPDATE courses SET
            code = course_json->>'code',
            name = course_json->>'name',
            department_id = (course_json->>'deptId')::UUID,
            programme_id = (course_json->>'programmeId')::UUID,
            assessment_policies = course_json->'assessmentPolicies',
            jsu_template = course_json->'jsuTemplate',
            mqfs = course_json->'mqfs',
            mqf_mappings = course_json->'mqfMappings',
            syllabus = course_json->>'syllabus'
        WHERE id = v_course_id;
    ELSE
        INSERT INTO courses (code, name, department_id, programme_id, assessment_policies, jsu_template, mqfs, mqf_mappings, syllabus)
        VALUES (
            course_json->>'code',
            course_json->>'name',
            (course_json->>'deptId')::UUID,
            (course_json->>'programmeId')::UUID,
            course_json->'assessmentPolicies',
            course_json->'jsuTemplate',
            course_json->'mqfs',
            course_json->'mqfMappings',
            course_json->>'syllabus'
        ) RETURNING id INTO v_course_id;
    END IF;

    -- 2. Sync CLOs
    DELETE FROM clos WHERE course_id = v_course_id;
    IF course_json ? 'clos' THEN
        FOR v_clo_key, v_clo_desc IN SELECT * FROM jsonb_each_text(course_json->'clos')
        LOOP
            INSERT INTO clos (course_id, code, description) VALUES (v_course_id, v_clo_key, v_clo_desc);
        END LOOP;
    END IF;

    -- 3. Sync Topics
    DELETE FROM topics WHERE course_id = v_course_id;
    IF course_json ? 'topics' THEN
        FOR v_topic_str IN SELECT * FROM jsonb_array_elements_text(course_json->'topics')
        LOOP
            v_topic_code := split_part(v_topic_str, ' ', 1);
            v_topic_name := substr(v_topic_str, length(v_topic_code) + 2);
            INSERT INTO topics (course_id, code, name) VALUES (v_course_id, v_topic_code, v_topic_name);
        END LOOP;
    END IF;

    -- 4. Sync CIST Blueprints
    DELETE FROM cist_blueprints WHERE course_id = v_course_id;
    
    IF course_json ? 'blueprints' THEN
        FOR v_blueprint IN SELECT * FROM jsonb_array_elements(course_json->'blueprints')
        LOOP
            INSERT INTO cist_blueprints (course_id, task)
            VALUES (v_course_id, v_blueprint->>'task')
            RETURNING id INTO v_blueprint_id;

            IF v_blueprint ? 'rows' THEN
                FOR v_row IN SELECT * FROM jsonb_array_elements(v_blueprint->'rows')
                LOOP
                    -- Resolve Topic ID from Code
                    v_topic_code := v_row->>'topicCode';
                    SELECT id INTO v_topic_id FROM topics WHERE course_id = v_course_id AND code = v_topic_code;
                    
                    INSERT INTO cist_rows (
                        blueprint_id, 
                        topic_id, 
                        construct_id, 
                        domain_id, 
                        dublin_accord_id, 
                        total_mark
                    )
                    VALUES (
                        v_blueprint_id,
                        v_topic_id,
                        NULL, -- Construct ID not fully handled yet
                        (v_row->>'domain_id')::UUID,
                        (v_row->>'dublin_accord_id')::UUID,
                        (v_row->>'total_mark')::INTEGER
                    )
                    RETURNING id INTO v_row_id;

                    -- Insert Junctions
                    -- CLOs
                    IF v_row ? 'cloCodes' THEN
                        FOR v_clo_code IN SELECT value FROM jsonb_array_elements_text(v_row->'cloCodes')
                        LOOP
                            SELECT id INTO v_clo_id FROM clos WHERE course_id = v_course_id AND code = v_clo_code;
                            IF v_clo_id IS NOT NULL THEN
                                INSERT INTO cist_row_clos (row_id, clo_id) VALUES (v_row_id, v_clo_id);
                            END IF;
                        END LOOP;
                    END IF;
                    
                    -- Item Types
                    IF v_row ? 'item_type_ids' THEN
                        FOR v_item_type_id IN SELECT (value::text)::UUID FROM jsonb_array_elements(v_row->'item_type_ids')
                        LOOP
                            INSERT INTO cist_row_item_types (row_id, item_type_id) VALUES (v_row_id, v_item_type_id);
                        END LOOP;
                    END IF;

                    -- Taxonomies
                    IF v_row ? 'taxonomies' THEN
                        FOR v_taxonomy_data IN SELECT * FROM jsonb_array_elements(v_row->'taxonomies')
                        LOOP
                            INSERT INTO cist_row_taxonomies (row_id, taxonomy_id, count, marks) 
                            VALUES (
                                v_row_id, 
                                (v_taxonomy_data->>'taxonomy_id')::UUID,
                                (v_taxonomy_data->>'count')::INTEGER,
                                (v_taxonomy_data->>'marks')::INTEGER
                            );
                        END LOOP;
                    END IF;
                END LOOP;
            END IF;
        END LOOP;
    END IF;

    RETURN v_course_id;
END;
$$;
