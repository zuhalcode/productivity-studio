-- ====================================================================
-- MIGRATION: 20261015000002_add_task_scheduling_and_notes.sql
-- Productivity Studio: Task Scheduling (start_date, due_date) & Notes
-- ====================================================================

-- 1. Tambah kolom start_date dan notes pada tabel tasks
ALTER TABLE public.tasks
    ADD COLUMN IF NOT EXISTS start_date DATE NULL,
    ADD COLUMN IF NOT EXISTS notes TEXT NULL;

-- 2. Tambah batasan konsistensi urutan tanggal: start_date <= due_date
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_tasks_date_order'
    ) THEN
        ALTER TABLE public.tasks
            ADD CONSTRAINT chk_tasks_date_order
            CHECK (start_date IS NULL OR due_date IS NULL OR start_date <= due_date);
    END IF;
END $$;

-- 3. Tambah indeks untuk akselerasi query filtering tanggal
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON public.tasks(start_date);
