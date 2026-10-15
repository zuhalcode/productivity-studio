"use client";

import { useState, useEffect, useCallback } from "react";
import { plannerService } from "@/lib/services/planner.service";
import { ContentPlan } from "@/types/database";
import { normalizeSupabaseError } from "@/lib/supabase/errors";

export function usePlanner(month?: number, week?: number) {
  const [plans, setPlans] = useState<ContentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await plannerService.getContentPlans({ month, week });
      setPlans(data);
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal memuat rencana konten");
      setError(appErr.message);
    } finally {
      setIsLoading(false);
    }
  }, [month, week]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const updatePlan = async (id: string, updates: Partial<ContentPlan>): Promise<ContentPlan> => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await plannerService.updateContentPlan(id, updates);
      setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal memperbarui rencana konten");
      setError(appErr.message);
      throw appErr;
    } finally {
      setIsSaving(false);
    }
  };

  const createPlan = async (
    data: Omit<ContentPlan, "id" | "created_at" | "updated_at">
  ): Promise<ContentPlan> => {
    setIsSaving(true);
    setError(null);
    try {
      const created = await plannerService.createContentPlan(data);
      setPlans((prev) => [...prev, created]);
      return created;
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal menambahkan rencana konten");
      setError(appErr.message);
      throw appErr;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    plans,
    isLoading,
    isSaving,
    error,
    updatePlan,
    createPlan,
    refetch: fetchPlans,
  };
}
