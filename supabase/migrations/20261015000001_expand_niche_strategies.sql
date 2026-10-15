-- ====================================================================
-- MIGRATION: 20261015000001_expand_niche_strategies.sql
-- Productivity Studio: Ikigai Content Strategist Schema Expansion
-- ====================================================================
-- 
-- PURPOSE:
-- Non-destructively evolve public.niche_profiles into the authoritative 
-- multi-strategy store for the Ikigai Content Strategist feature.
--
-- SECURITY ARCHITECTURE & ANONYMOUS MVP LIMITATIONS:
-- 1. This application currently operates in single-creator local MVP mode 
--    without Supabase Auth (user_id is NULL, client connects via anon key).
-- 2. Because authentication is not yet enabled, TRUE APPLICATION-WIDE TENANT 
--    ISOLATION CANNOT BE ENFORCED AT THIS STAGE. The existing table RLS policies
--    remain permissive (allowing anon operations on user_id IS NULL).
-- 3. The activation function (set_active_niche_strategy) enforces strict caller 
--    authorization:
--    - Anonymous callers (auth.uid() IS NULL) can ONLY activate unowned (user_id IS NULL) records.
--    - Authenticated callers can ONLY activate records matching their own auth.uid().
--    - Authenticated callers CANNOT activate NULL-owned records, and anonymous callers
--      CANNOT activate user-owned records.
-- 4. The activation function is hardened with SECURITY DEFINER and a fixed
--    immutable search_path (public, pg_temp) to prevent search-path injection.
-- 5. When Supabase Auth is enabled in a future approved phase, user_id will 
--    store auth.uid() and RLS policies will be tightened to authenticated users.
-- ====================================================================

-- 1. Additive Columns (All nullable or with safe defaults)
ALTER TABLE public.niche_profiles
    ADD COLUMN IF NOT EXISTS strategy_name TEXT NULL,
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed',
    ADD COLUMN IF NOT EXISTS creator_context JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS recommended_niches JSONB NULL,
    ADD COLUMN IF NOT EXISTS best_niche_recommendation JSONB NULL,
    ADD COLUMN IF NOT EXISTS value_statement TEXT NULL,
    ADD COLUMN IF NOT EXISTS core_message TEXT NULL,
    ADD COLUMN IF NOT EXISTS bio_tiktok_b TEXT NULL,
    ADD COLUMN IF NOT EXISTS market_analysis JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Relax legacy NOT NULL on niche_final and core_value to support drafts
ALTER TABLE public.niche_profiles ALTER COLUMN niche_final DROP NOT NULL;
ALTER TABLE public.niche_profiles ALTER COLUMN core_value DROP NOT NULL;

-- 3. Remove legacy check constraints scoped to public.niche_profiles
ALTER TABLE public.niche_profiles DROP CONSTRAINT IF EXISTS chk_niche_final_not_empty;
ALTER TABLE public.niche_profiles DROP CONSTRAINT IF EXISTS chk_core_value_not_empty;

-- 4. Precondition Reconciliations & Legacy Data Preservation
-- Ensure all pre-existing records satisfy new invariants before constraints are added.

-- 4a. If legacy rows lack required content for 'completed' status, safely transition
--     them to 'draft' and ensure is_active = false to preserve data without violating constraints.
UPDATE public.niche_profiles
SET status = 'draft',
    is_active = false,
    updated_at = timezone('utc'::text, now())
WHERE (status IS NULL OR status = 'completed')
  AND (
      niche_final IS NULL OR length(trim(niche_final)) = 0 OR
      core_value IS NULL OR length(trim(core_value)) = 0
  );

-- 4b. Ensure archived rows are not active
UPDATE public.niche_profiles
SET is_active = false,
    updated_at = timezone('utc'::text, now())
WHERE status = 'archived' AND is_active = true;

-- 4c. Resolve potential legacy multiple active rows per tenant.
--     Retains the latest updated row as active and deactivates older duplicates.
WITH ranked_active AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid)
               ORDER BY updated_at DESC, created_at DESC, id DESC
           ) AS rn
    FROM public.niche_profiles
    WHERE is_active = true
)
UPDATE public.niche_profiles
SET is_active = false,
    updated_at = timezone('utc'::text, now())
WHERE id IN (
    SELECT id FROM ranked_active WHERE rn > 1
);

-- 5. Hardened Lifecycle Check Constraints
-- Scoped strictly to public.niche_profiles with definition verification.

-- Invariant A: Valid status domain
DO $$
DECLARE
    v_def text;
BEGIN
    SELECT pg_get_constraintdef(oid)
    INTO v_def
    FROM pg_constraint
    WHERE conrelid = 'public.niche_profiles'::regclass
      AND conname = 'chk_niche_strategy_status';

    IF v_def IS NULL THEN
        ALTER TABLE public.niche_profiles
            ADD CONSTRAINT chk_niche_strategy_status
            CHECK (status IN ('draft', 'completed', 'archived'));
    ELSIF v_def !~* 'draft' OR v_def !~* 'completed' OR v_def !~* 'archived' THEN
        ALTER TABLE public.niche_profiles DROP CONSTRAINT chk_niche_strategy_status;
        ALTER TABLE public.niche_profiles
            ADD CONSTRAINT chk_niche_strategy_status
            CHECK (status IN ('draft', 'completed', 'archived'));
    END IF;
END $$;

-- Invariant B: Incomplete draft can NEVER be active
DO $$
DECLARE
    v_def text;
BEGIN
    SELECT pg_get_constraintdef(oid)
    INTO v_def
    FROM pg_constraint
    WHERE conrelid = 'public.niche_profiles'::regclass
      AND conname = 'chk_niche_draft_never_active';

    IF v_def IS NULL THEN
        ALTER TABLE public.niche_profiles
            ADD CONSTRAINT chk_niche_draft_never_active
            CHECK (NOT (status = 'draft' AND is_active = true));
    ELSIF v_def !~* 'status.*draft' OR v_def !~* 'is_active' THEN
        ALTER TABLE public.niche_profiles DROP CONSTRAINT chk_niche_draft_never_active;
        ALTER TABLE public.niche_profiles
            ADD CONSTRAINT chk_niche_draft_never_active
            CHECK (NOT (status = 'draft' AND is_active = true));
    END IF;
END $$;

-- Invariant C: Archived strategy can NEVER be active
DO $$
DECLARE
    v_def text;
BEGIN
    SELECT pg_get_constraintdef(oid)
    INTO v_def
    FROM pg_constraint
    WHERE conrelid = 'public.niche_profiles'::regclass
      AND conname = 'chk_niche_archived_never_active';

    IF v_def IS NULL THEN
        ALTER TABLE public.niche_profiles
            ADD CONSTRAINT chk_niche_archived_never_active
            CHECK (NOT (status = 'archived' AND is_active = true));
    ELSIF v_def !~* 'status.*archived' OR v_def !~* 'is_active' THEN
        ALTER TABLE public.niche_profiles DROP CONSTRAINT chk_niche_archived_never_active;
        ALTER TABLE public.niche_profiles
            ADD CONSTRAINT chk_niche_archived_never_active
            CHECK (NOT (status = 'archived' AND is_active = true));
    END IF;
END $$;

-- Invariant D: Completed and archived strategies MUST retain non-empty core content
DO $$
DECLARE
    v_def text;
BEGIN
    SELECT pg_get_constraintdef(oid)
    INTO v_def
    FROM pg_constraint
    WHERE conrelid = 'public.niche_profiles'::regclass
      AND conname = 'chk_niche_completed_content_required';

    IF v_def IS NULL THEN
        ALTER TABLE public.niche_profiles
            ADD CONSTRAINT chk_niche_completed_content_required
            CHECK (
                status = 'draft' OR (
                    niche_final IS NOT NULL AND length(trim(niche_final)) > 0 AND
                    core_value IS NOT NULL AND length(trim(core_value)) > 0
                )
            );
    ELSIF v_def !~* 'niche_final' OR v_def !~* 'core_value' OR v_def !~* 'status' THEN
        ALTER TABLE public.niche_profiles DROP CONSTRAINT chk_niche_completed_content_required;
        ALTER TABLE public.niche_profiles
            ADD CONSTRAINT chk_niche_completed_content_required
            CHECK (
                status = 'draft' OR (
                    niche_final IS NOT NULL AND length(trim(niche_final)) > 0 AND
                    core_value IS NOT NULL AND length(trim(core_value)) > 0
                )
            );
    END IF;
END $$;

-- 6. Single Active Strategy Invariant (Partial Unique Index)
-- Uses COALESCE to safely treat NULL user_id as a single local tenant,
-- guaranteeing that exactly ONE strategy can be active across the local database.
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_active_niche 
ON public.niche_profiles (COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid)) 
WHERE (is_active = true);

-- 7. Strategy Listing and Filtering Index
CREATE INDEX IF NOT EXISTS idx_niche_profiles_strategy_list 
ON public.niche_profiles(user_id, status, created_at DESC);

-- 8. Hardened Atomic Strategy Activation Stored Procedure
-- Serializes activations per tenant using transaction advisory locks,
-- enforces caller-to-record authorization, validates lifecycle invariants,
-- and uses a 2-step update sequence to prevent immediate partial unique index collisions.
CREATE OR REPLACE FUNCTION public.set_active_niche_strategy(
    target_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_target RECORD;
    v_auth_uid UUID;
    v_tenant_key TEXT;
    v_is_already_active BOOLEAN;
BEGIN
    -- Step 1: Existence and initial tenant metadata lookup
    SELECT id, user_id, status
    INTO v_target
    FROM public.niche_profiles
    WHERE id = target_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'STRATEGY_NOT_FOUND: Strategy % does not exist', target_id
            USING ERRCODE = 'P0002';
    END IF;

    -- Step 2: Strict Authorization Verification
    -- - Anonymous caller (auth.uid() IS NULL): Can ONLY activate local unowned records (user_id IS NULL)
    -- - Authenticated caller (auth.uid() IS NOT NULL): Can ONLY activate records owned by themselves
    v_auth_uid := auth.uid();
    IF v_auth_uid IS NULL THEN
        IF v_target.user_id IS NOT NULL THEN
            RAISE EXCEPTION 'UNAUTHORIZED: Anonymous callers cannot activate user-owned strategies'
                USING ERRCODE = '42501';
        END IF;
    ELSE
        IF v_target.user_id IS NULL OR v_target.user_id <> v_auth_uid THEN
            RAISE EXCEPTION 'UNAUTHORIZED: Authenticated callers can only activate strategies they own'
                USING ERRCODE = '42501';
        END IF;
    END IF;

    -- Step 3: Status Eligibility Invariants
    IF v_target.status = 'archived' THEN
        RAISE EXCEPTION 'CANNOT_ACTIVATE_ARCHIVED: Strategy % is archived and cannot be activated', target_id
            USING ERRCODE = '22000';
    END IF;

    IF v_target.status = 'draft' THEN
        RAISE EXCEPTION 'CANNOT_ACTIVATE_DRAFT: Strategy % is an incomplete draft and cannot be activated', target_id
            USING ERRCODE = '22000';
    END IF;

    -- Step 4: Concurrency Serialization via Tenant Transaction Advisory Lock
    -- Must be acquired BEFORE inspecting is_active or making short-circuit decisions.
    -- Completely serializes concurrent activation calls for the same tenant (including when 0 active rows exist)
    -- and prevents deadlocks between concurrent callers.
    v_tenant_key := 'niche_active_lock_' || COALESCE(v_target.user_id::text, '00000000-0000-0000-0000-000000000000');
    PERFORM pg_advisory_xact_lock(hashtext(v_tenant_key));

    -- Step 5: Inspect current target row state under advisory lock
    SELECT is_active
    INTO v_is_already_active
    FROM public.niche_profiles
    WHERE id = target_id
    FOR UPDATE;

    -- Short-circuit if target is already the active strategy
    IF v_is_already_active = true THEN
        RETURN;
    END IF;

    -- Step 6: Atomic Two-Step Switch (prevents immediate partial unique index collision)
    -- In PostgreSQL, an immediate partial unique index (idx_single_active_niche) validates
    -- each row during update. A single UPDATE statement modifying both rows can fail with a 
    -- unique violation if the new active row is processed before the old active row is deactivated.
    -- Because the transaction advisory lock serializes this block, separate sequential statements
    -- are completely safe, atomic, and prevent index collisions.

    -- Step 6a: Deactivate currently active strategy for this tenant (if any)
    UPDATE public.niche_profiles
    SET is_active = false,
        updated_at = timezone('utc'::text, now())
    WHERE user_id IS NOT DISTINCT FROM v_target.user_id
      AND is_active = true
      AND id <> target_id;

    -- Step 6b: Activate the target strategy
    UPDATE public.niche_profiles
    SET is_active = true,
        updated_at = timezone('utc'::text, now())
    WHERE id = target_id;
END;
$$;

-- 9. Function Access Permissions
REVOKE ALL ON FUNCTION public.set_active_niche_strategy(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_active_niche_strategy(UUID) TO anon, authenticated, service_role;
