-- ====================================================================
-- MIGRATION: 20261014000003_create_repository_tables.sql
-- Productivity Studio: Reference & Template Repository Tables
-- ====================================================================

-- 1. TABEL: hook_templates (105 Template Terkurasi)
CREATE TABLE IF NOT EXISTS public.hook_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_code TEXT NULL UNIQUE,
    category TEXT NOT NULL,
    template_text TEXT NOT NULL,
    example_text TEXT NOT NULL,
    suitable_niche TEXT NULL,
    platform TEXT NOT NULL DEFAULT 'Keduanya',
    is_system BOOLEAN NOT NULL DEFAULT true,
    is_custom BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_hook_category CHECK (
        category IN ('NEGATIVITY', 'CURIOSITY', 'LIST_NUMBER', 'CONTROVERSY', 'FOMO', 'AUTHORITY')
    ),
    CONSTRAINT chk_hook_origin CHECK (
        (is_system = true AND is_custom = false AND system_code IS NOT NULL) OR
        (is_system = false AND is_custom = true AND system_code IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_hook_templates_category 
ON public.hook_templates(category);

-- 2. TABEL: idea_templates (104 Template Lintas 10 Niche)
CREATE TABLE IF NOT EXISTS public.idea_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_code TEXT NULL UNIQUE,
    niche TEXT NOT NULL,
    funnel_layer TEXT NOT NULL,
    format_type TEXT NOT NULL,
    template_text TEXT NOT NULL,
    example_text TEXT NOT NULL,
    is_system BOOLEAN NOT NULL DEFAULT true,
    is_custom BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_idea_funnel CHECK (funnel_layer IN ('Authority', 'Engagement', 'Sales')),
    CONSTRAINT chk_idea_origin CHECK (
        (is_system = true AND is_custom = false AND system_code IS NOT NULL) OR
        (is_system = false AND is_custom = true AND system_code IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_idea_templates_niche_funnel 
ON public.idea_templates(niche, funnel_layer);

-- 3. TABEL: cta_templates (45 Template CTA vs CTV)
CREATE TABLE IF NOT EXISTS public.cta_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_code TEXT NULL UNIQUE,
    category TEXT NOT NULL,
    cta_type TEXT NOT NULL,
    template_text TEXT NOT NULL,
    example_text TEXT NOT NULL,
    is_system BOOLEAN NOT NULL DEFAULT true,
    is_custom BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_cta_category CHECK (category IN ('ENGAGEMENT', 'AUTHORITY', 'SALES')),
    CONSTRAINT chk_cta_type CHECK (cta_type IN ('CTA', 'CTV')),
    CONSTRAINT chk_cta_origin CHECK (
        (is_system = true AND is_custom = false AND system_code IS NOT NULL) OR
        (is_system = false AND is_custom = true AND system_code IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_cta_templates_cat_type 
ON public.cta_templates(category, cta_type);

-- 4. TABEL: glossary_terms (100 Istilah Media Sosial)
CREATE TABLE IF NOT EXISTS public.glossary_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_code TEXT NULL UNIQUE,
    category TEXT NOT NULL,
    term TEXT NOT NULL,
    definition TEXT NOT NULL,
    example_usage TEXT NULL,
    is_system BOOLEAN NOT NULL DEFAULT true,
    is_custom BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT uq_glossary_category_term UNIQUE (category, term),
    CONSTRAINT chk_glossary_origin CHECK (
        (is_system = true AND is_custom = false AND system_code IS NOT NULL) OR
        (is_system = false AND is_custom = true AND system_code IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_glossary_category 
ON public.glossary_terms(category);

-- 5. TABEL: tool_references (31 Tools Produksi Terkurasi)
CREATE TABLE IF NOT EXISTS public.tool_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_code TEXT NULL UNIQUE,
    phase TEXT NOT NULL,
    name TEXT NOT NULL,
    pricing_model TEXT NOT NULL,
    purpose TEXT NOT NULL,
    category_tag TEXT NOT NULL,
    url TEXT NULL,
    is_system BOOLEAN NOT NULL DEFAULT true,
    is_custom BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_tool_phase CHECK (phase IN ('Riset', 'Nulis', 'Produksi', 'Editing', 'Analisis')),
    CONSTRAINT chk_tool_pricing CHECK (pricing_model IN ('Gratis', 'Freemium', 'Berbayar')),
    CONSTRAINT chk_tool_origin CHECK (
        (is_system = true AND is_custom = false AND system_code IS NOT NULL) OR
        (is_system = false AND is_custom = true AND system_code IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_tool_phase 
ON public.tool_references(phase);

-- Pasang Trigger Proteksi Data Sistem Bawaan
CREATE TRIGGER trg_protect_system_hooks
BEFORE DELETE OR UPDATE ON public.hook_templates
FOR EACH ROW EXECUTE FUNCTION public.fn_protect_system_records();

CREATE TRIGGER trg_protect_system_ideas
BEFORE DELETE OR UPDATE ON public.idea_templates
FOR EACH ROW EXECUTE FUNCTION public.fn_protect_system_records();

CREATE TRIGGER trg_protect_system_ctas
BEFORE DELETE OR UPDATE ON public.cta_templates
FOR EACH ROW EXECUTE FUNCTION public.fn_protect_system_records();

CREATE TRIGGER trg_protect_system_tools
BEFORE DELETE OR UPDATE ON public.tool_references
FOR EACH ROW EXECUTE FUNCTION public.fn_protect_system_records();

CREATE TRIGGER trg_protect_system_glossary
BEFORE DELETE OR UPDATE ON public.glossary_terms
FOR EACH ROW EXECUTE FUNCTION public.fn_protect_system_records();
