-- 1. PostgreSQL Tier 1 Schema DDL

CREATE TYPE internship_state AS ENUM ('DISCOVERED', 'VERIFIED', 'PUBLISHED', 'STALE', 'ARCHIVED');

CREATE TABLE sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    base_url VARCHAR(255) NOT NULL,
    crawl_allowed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sources_crawl_allowed ON sources(crawl_allowed);

CREATE TABLE internships (
    id SERIAL PRIMARY KEY,
    schema_version INT DEFAULT 1,
    canonical_id_hash CHAR(64) NOT NULL,
    source_id INT REFERENCES sources(id),
    url TEXT NOT NULL,
    company VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    current_state internship_state DEFAULT 'DISCOVERED',
    metadata_history JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (canonical_id_hash),
    UNIQUE (source_id, url)
);

CREATE INDEX idx_internships_published_feed ON internships(last_seen_at DESC) WHERE current_state = 'PUBLISHED';

CREATE INDEX idx_internships_fts ON internships USING GIN (to_tsvector('english', title || ' ' || company || ' ' || COALESCE(location, '')));

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sources_modtime
BEFORE UPDATE ON sources
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_internships_modtime
BEFORE UPDATE ON internships
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE PROCEDURE purge_expired_data_lifecycle()
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM internships 
    WHERE current_state = 'ARCHIVED' 
    AND updated_at < CURRENT_TIMESTAMP - INTERVAL '24 months';
END;
$$;
