"use client";

import { useState, useEffect, useCallback } from "react";
import { briefService } from "@/lib/services/brief.service";
import { plannerService } from "@/lib/services/planner.service";
import { ContentBrief, ContentPlan } from "@/types/database";
import { normalizeSupabaseError } from "@/lib/supabase/errors";

export function useBrief(planId: string) {
  const [plan, setPlan] = useState<ContentPlan | null>(null);
  const [brief, setBrief] = useState<ContentBrief | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBriefAndPlan = useCallback(async () => {
    if (!planId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedPlan, fetchedBrief] = await Promise.all([
        plannerService.getContentPlanById(planId),
        briefService.getBriefByPlanId(planId),
      ]);
      setPlan(fetchedPlan);
      setBrief(fetchedBrief);
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal memuat naskah brief");
      setError(appErr.message);
    } finally {
      setIsLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchBriefAndPlan();
  }, [fetchBriefAndPlan]);

  const saveBrief = async (
    briefData: ContentBrief,
    newPlanStatus?: ContentPlan["status"]
  ): Promise<{ brief: ContentBrief; plan?: ContentPlan }> => {
    setIsSaving(true);
    setError(null);
    try {
      const result = await briefService.saveBrief(briefData, newPlanStatus);
      setBrief(result.brief);
      if (result.plan) {
        setPlan(result.plan);
      }
      return result;
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal menyimpan naskah brief");
      setError(appErr.message);
      throw appErr;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    plan,
    brief,
    isLoading,
    isSaving,
    error,
    saveBrief,
    refetch: fetchBriefAndPlan,
  };
}
