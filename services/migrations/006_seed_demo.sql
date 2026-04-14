-- Optional demo seed.
INSERT INTO linkaios.agents (id, display_name, status)
SELECT gen_random_uuid(), 'Demo agent', 'active'
WHERE NOT EXISTS (SELECT 1 FROM linkaios.agents WHERE display_name = 'Demo agent');

INSERT INTO linkaios.skills (name, version, status, body_markdown, metadata)
SELECT 'bootstrap',
       1,
       'approved',
       '# Bootstrap skill\nThis row exists so LiNKlogic can resolve a real skill.',
       '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM linkaios.skills WHERE name = 'bootstrap' AND version = 1);
