-- seed_fixtures.sql

-- Insert Baseline Crawler Targets
INSERT INTO public.sources (name, base_url, crawl_allowed)
VALUES 
    ('HackerNews Jobs', 'https://news.ycombinator.com/jobs', TRUE),
    ('Google Careers', 'https://careers.google.com', TRUE);

-- Insert Mock Internship Records (V12.1 Schema Compliance)

-- 1. Example: googlefrontend engineer internmountain view
-- SHA256: 0e86a1df0bba7216a9eb0d87fa0cf187a5f6e80b435ff2010897d8ce6603b7fc
INSERT INTO public.internships (
    canonical_id_hash, 
    source_id, 
    url, 
    title, 
    company, 
    location, 
    current_state,
    metadata_history
)
VALUES (
    '0e86a1df0bba7216a9eb0d87fa0cf187a5f6e80b435ff2010897d8ce6603b7fc',
    2,
    'https://careers.google.com/jobs/results/10001',
    'Frontend Engineer Intern',
    'Google',
    'Mountain View',
    'PUBLISHED',
    '{"schema_version": 1, "upserted_via": "seed", "ai_enriched": false}'::jsonb
);

-- 2. Example: techcorpsystems engineering internremote
-- SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (mocked signature)
INSERT INTO public.internships (
    canonical_id_hash, 
    source_id, 
    url, 
    title, 
    company, 
    location, 
    current_state,
    metadata_history
)
VALUES (
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    1,
    'https://techcorp.example.com/careers/systems-intern',
    'Systems Engineering Intern',
    'TechCorp',
    'Remote',
    'DISCOVERED',
    '{"schema_version": 1, "upserted_via": "seed", "initial_stipend_detected": true}'::jsonb
);

-- 3. Example: strivedata science internkerala
-- SHA256: 8a99478f8e3290b2406fba8df94e2eaad7779f046b0d9ef19cb2d88bb09825b2 (mocked signature)
INSERT INTO public.internships (
    canonical_id_hash, 
    source_id, 
    url, 
    title, 
    company, 
    location, 
    current_state,
    metadata_history
)
VALUES (
    '8a99478f8e3290b2406fba8df94e2eaad7779f046b0d9ef19cb2d88bb09825b2',
    1,
    'https://strive.io/careers/data-intern',
    'Data Science Intern',
    'Strive',
    'Kerala',
    'VERIFIED',
    '{"schema_version": 1, "health_checks_passed": 3}'::jsonb
);
