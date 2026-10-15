-- ====================================================================
-- MIGRATION: 20261014000005_enable_rls_and_policies.sql
-- Productivity Studio: Enable Row Level Security (RLS) & Policies
-- ====================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.niche_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hook_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

-- 2. Local MVP Policies for User Operational Tables (Open for local single-user)
CREATE POLICY "Allow local full access to niche_profiles"
ON public.niche_profiles FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow local full access to audience_personas"
ON public.audience_personas FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow local full access to content_plans"
ON public.content_plans FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow local full access to content_briefs"
ON public.content_briefs FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow local full access to tasks"
ON public.tasks FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow local full access to performance_metrics"
ON public.performance_metrics FOR ALL USING (true) WITH CHECK (true);

-- 3. System Reference Tables Policies (Read-all, Insert/Update/Delete only for custom records)
-- Hook Templates
CREATE POLICY "Allow public read on hook_templates"
ON public.hook_templates FOR SELECT USING (true);

CREATE POLICY "Allow insert custom hook_templates only"
ON public.hook_templates FOR INSERT
WITH CHECK (is_custom = true AND is_system = false AND system_code IS NULL);

CREATE POLICY "Allow update custom hook_templates only"
ON public.hook_templates FOR UPDATE
USING (is_custom = true AND is_system = false)
WITH CHECK (is_custom = true AND is_system = false);

CREATE POLICY "Allow delete custom hook_templates only"
ON public.hook_templates FOR DELETE
USING (is_custom = true AND is_system = false);

-- Idea Templates
CREATE POLICY "Allow public read on idea_templates"
ON public.idea_templates FOR SELECT USING (true);

CREATE POLICY "Allow insert custom idea_templates only"
ON public.idea_templates FOR INSERT
WITH CHECK (is_custom = true AND is_system = false AND system_code IS NULL);

CREATE POLICY "Allow update custom idea_templates only"
ON public.idea_templates FOR UPDATE
USING (is_custom = true AND is_system = false)
WITH CHECK (is_custom = true AND is_system = false);

CREATE POLICY "Allow delete custom idea_templates only"
ON public.idea_templates FOR DELETE
USING (is_custom = true AND is_system = false);

-- CTA Templates
CREATE POLICY "Allow public read on cta_templates"
ON public.cta_templates FOR SELECT USING (true);

CREATE POLICY "Allow insert custom cta_templates only"
ON public.cta_templates FOR INSERT
WITH CHECK (is_custom = true AND is_system = false AND system_code IS NULL);

CREATE POLICY "Allow update custom cta_templates only"
ON public.cta_templates FOR UPDATE
USING (is_custom = true AND is_system = false)
WITH CHECK (is_custom = true AND is_system = false);

CREATE POLICY "Allow delete custom cta_templates only"
ON public.cta_templates FOR DELETE
USING (is_custom = true AND is_system = false);

-- Tool References
CREATE POLICY "Allow public read on tool_references"
ON public.tool_references FOR SELECT USING (true);

CREATE POLICY "Allow insert custom tool_references only"
ON public.tool_references FOR INSERT
WITH CHECK (is_custom = true AND is_system = false AND system_code IS NULL);

CREATE POLICY "Allow update custom tool_references only"
ON public.tool_references FOR UPDATE
USING (is_custom = true AND is_system = false)
WITH CHECK (is_custom = true AND is_system = false);

CREATE POLICY "Allow delete custom tool_references only"
ON public.tool_references FOR DELETE
USING (is_custom = true AND is_system = false);

-- Glossary Terms
CREATE POLICY "Allow public read on glossary_terms"
ON public.glossary_terms FOR SELECT USING (true);

CREATE POLICY "Allow insert custom glossary_terms only"
ON public.glossary_terms FOR INSERT
WITH CHECK (is_custom = true AND is_system = false AND system_code IS NULL);

CREATE POLICY "Allow update custom glossary_terms only"
ON public.glossary_terms FOR UPDATE
USING (is_custom = true AND is_system = false)
WITH CHECK (is_custom = true AND is_system = false);

CREATE POLICY "Allow delete custom glossary_terms only"
ON public.glossary_terms FOR DELETE
USING (is_custom = true AND is_system = false);
