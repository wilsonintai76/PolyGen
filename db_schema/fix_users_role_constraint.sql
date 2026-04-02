
-- Drop the existing check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Re-add the constraint with the correct allowed values matching the frontend
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('Administrator', 'Creator', 'Reviewer', 'Endorser'));

-- Retry the insert for the admin user
INSERT INTO users (username, full_name, role, position, department_id, programme_id)
SELECT '1891', 'ADMIN 1891', 'Administrator', 'Head of IT', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = '1891');
