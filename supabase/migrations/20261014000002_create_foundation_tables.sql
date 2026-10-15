-- ====================================================================
-- MIGRATION: 20261014000002_create_foundation_tables.sql
-- Productivity Studio: Foundation Tables (Ikigai Niche & ICP Avatar)
-- ====================================================================

-- 1. TABEL: niche_profiles (Fondasi Ikigai & Value)
CREATE TABLE IF NOT EXISTS public.niche_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL,
    
    ikigai_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    sweet_spot TEXT NULL,
    niche_final TEXT NOT NULL,
    core_value TEXT NOT NULL,
    
    bio_ig_a TEXT NULL,
    bio_ig_b TEXT NULL,
    bio_ig_c TEXT NULL,
    bio_tiktok TEXT NULL,
    tagline TEXT NULL,
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_niche_final_not_empty CHECK (length(trim(niche_final)) > 0),
    CONSTRAINT chk_core_value_not_empty CHECK (length(trim(core_value)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_niche_profiles_user_active 
ON public.niche_profiles(user_id, is_active);

-- 2. TABEL: audience_personas (Customer Avatar / ICP)
CREATE TABLE IF NOT EXISTS public.audience_personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL,
    
    persona_name TEXT NOT NULL,
    demographics JSONB NOT NULL DEFAULT '{}'::jsonb,
    pain_points TEXT NOT NULL,
    desires TEXT NOT NULL,
    objections TEXT NOT NULL,
    narrative TEXT NULL,
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_persona_name_not_empty CHECK (length(trim(persona_name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_audience_personas_user_active 
ON public.audience_personas(user_id, is_active);
