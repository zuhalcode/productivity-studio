-- ====================================================================
-- MIGRATION: 20261014000001_create_extensions_and_helpers.sql
-- Productivity Studio: Extensions & Helper Functions
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper Trigger Function: fn_protect_system_records()
-- Melindungi record bawaan sistem (is_system = true) agar tidak bisa diubah atau dihapus langsung
CREATE OR REPLACE FUNCTION public.fn_protect_system_records()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_system = true THEN
        RAISE EXCEPTION 'SYSTEM_RECORD_PROTECTED: System seed records cannot be modified or deleted directly. Create a custom copy instead.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
