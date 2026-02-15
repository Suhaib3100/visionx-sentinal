-- VisionX Eval Database Initialization Script
-- Creates initial database schema and extensions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create initial schema
CREATE SCHEMA IF NOT EXISTS visionx;

-- Set default search path
ALTER DATABASE visionx_eval SET search_path TO visionx, public;

-- Create enum types
DO $$ BEGIN
    CREATE TYPE visionx.snapshot_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE visionx.evaluation_status AS ENUM ('pending', 'analyzing', 'ai_evaluation', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE visionx.user_role AS ENUM ('admin', 'judge', 'participant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE visionx.project_status AS ENUM ('active', 'submitted', 'disqualified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA visionx TO visionx;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA visionx TO visionx;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA visionx TO visionx;

-- Success message
SELECT 'VisionX Eval database initialized successfully!' AS message;
