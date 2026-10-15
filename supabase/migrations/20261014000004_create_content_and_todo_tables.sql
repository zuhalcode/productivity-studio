-- ====================================================================
-- MIGRATION: 20261014000004_create_content_and_todo_tables.sql
-- Productivity Studio: Content Plans, HTPC Briefs, Recursive Tasks, Performance
-- ====================================================================

-- 1. TABEL: content_plans (Kalender Perencanaan 3-3-1)
CREATE TABLE IF NOT EXISTS public.content_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL,
    niche_id UUID NULL REFERENCES public.niche_profiles(id) ON DELETE SET NULL,
    persona_id UUID NULL REFERENCES public.audience_personas(id) ON DELETE SET NULL,
    
    month_index SMALLINT NOT NULL,
    week_index SMALLINT NOT NULL,
    slot_index SMALLINT NOT NULL,
    scheduled_date DATE NULL,
    
    funnel_layer TEXT NOT NULL,
    topic TEXT NOT NULL,
    reference_url TEXT NULL,
    format TEXT NOT NULL,
    platform TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Ide',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_month_range CHECK (month_index BETWEEN 1 AND 12),
    CONSTRAINT chk_week_range CHECK (week_index BETWEEN 1 AND 4),
    CONSTRAINT chk_slot_range CHECK (slot_index BETWEEN 1 AND 7),
    CONSTRAINT chk_funnel_layer CHECK (funnel_layer IN ('Engagement', 'Authority', 'Sales')),
    CONSTRAINT chk_format CHECK (format IN ('Single Image', 'Carousel', 'Reels')),
    CONSTRAINT chk_status CHECK (status IN ('Ide', 'On Process', 'Done', 'Posted')),
    CONSTRAINT chk_topic_not_empty CHECK (length(trim(topic)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_content_plans_schedule 
ON public.content_plans(month_index, week_index, slot_index);

CREATE INDEX IF NOT EXISTS idx_content_plans_status 
ON public.content_plans(status);

-- 2. TABEL: content_briefs (Studio Naskah HTPC)
CREATE TABLE IF NOT EXISTS public.content_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL UNIQUE REFERENCES public.content_plans(id) ON DELETE CASCADE,
    
    hook_ref_id UUID NULL REFERENCES public.hook_templates(id) ON DELETE SET NULL,
    cta_ref_id UUID NULL REFERENCES public.cta_templates(id) ON DELETE SET NULL,
    
    target_duration TEXT NULL,
    
    hook_text TEXT NOT NULL,
    tension_text TEXT NOT NULL,
    payoff_text TEXT NOT NULL,
    ctv_text TEXT NOT NULL,
    
    caption TEXT NULL,
    hashtags TEXT[] NULL DEFAULT '{}'::text[],
    production_notes TEXT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_brief_hook_not_empty CHECK (length(trim(hook_text)) > 0),
    CONSTRAINT chk_brief_tension_not_empty CHECK (length(trim(tension_text)) > 0),
    CONSTRAINT chk_brief_payoff_not_empty CHECK (length(trim(payoff_text)) > 0),
    CONSTRAINT chk_brief_ctv_not_empty CHECK (length(trim(ctv_text)) > 0),
    CONSTRAINT chk_hashtags_max_five CHECK (cardinality(hashtags) <= 5)
);

-- 3. TABEL: tasks (Mesin Todo Hierarkis Rekursif)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL,
    parent_id UUID NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    content_plan_id UUID NULL REFERENCES public.content_plans(id) ON DELETE SET NULL,
    
    title TEXT NOT NULL,
    description TEXT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    due_date DATE NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_tasks_no_self_parent CHECK (parent_id IS NULL OR parent_id != id),
    CONSTRAINT chk_tasks_title_not_empty CHECK (length(trim(title)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON public.tasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_plan_id ON public.tasks(content_plan_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sort_order ON public.tasks(parent_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_tasks_active ON public.tasks(is_archived, is_completed);

-- Fungsi trigger pencegahan siklus rekursif pada tasks
CREATE OR REPLACE FUNCTION public.fn_prevent_task_cycles()
RETURNS TRIGGER AS $$
DECLARE
    curr_parent UUID;
    depth_count INTEGER := 0;
    max_depth CONSTANT INTEGER := 20;
BEGIN
    IF NEW.parent_id IS NULL OR (TG_OP = 'UPDATE' AND NEW.parent_id = OLD.parent_id) THEN
        RETURN NEW;
    END IF;

    IF NEW.parent_id = NEW.id THEN
        RAISE EXCEPTION 'CANNOT_SET_SELF_AS_PARENT: Task % cannot be its own parent.', NEW.id;
    END IF;

    curr_parent := NEW.parent_id;
    WHILE curr_parent IS NOT NULL LOOP
        depth_count := depth_count + 1;
        
        IF depth_count > max_depth THEN
            RAISE EXCEPTION 'MAX_DEPTH_EXCEEDED: Maximum task nesting depth of % exceeded.', max_depth;
        END IF;

        IF curr_parent = NEW.id THEN
            RAISE EXCEPTION 'CIRCULAR_REFERENCE_DETECTED: Target parent % is a descendant of task %.', 
                NEW.parent_id, NEW.id;
        END IF;

        SELECT parent_id INTO curr_parent FROM public.tasks WHERE id = curr_parent;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tasks_prevent_cycles ON public.tasks;
CREATE TRIGGER trg_tasks_prevent_cycles
BEFORE INSERT OR UPDATE OF parent_id ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.fn_prevent_task_cycles();

-- 4. TABEL: performance_metrics (Winning Content Identifier)
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL,
    content_plan_id UUID NOT NULL UNIQUE REFERENCES public.content_plans(id) ON DELETE CASCADE,
    
    post_date DATE NOT NULL,
    content_link TEXT NULL,
    
    views BIGINT NOT NULL DEFAULT 0,
    likes BIGINT NOT NULL DEFAULT 0,
    comments BIGINT NOT NULL DEFAULT 0,
    shares BIGINT NOT NULL DEFAULT 0,
    saves BIGINT NOT NULL DEFAULT 0,
    
    evaluation_date DATE NULL,
    learning_notes TEXT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT chk_metrics_views_nonneg CHECK (views >= 0),
    CONSTRAINT chk_metrics_likes_nonneg CHECK (likes >= 0),
    CONSTRAINT chk_metrics_comments_nonneg CHECK (comments >= 0),
    CONSTRAINT chk_metrics_shares_nonneg CHECK (shares >= 0),
    CONSTRAINT chk_metrics_saves_nonneg CHECK (saves >= 0)
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_post_date 
ON public.performance_metrics(post_date);
