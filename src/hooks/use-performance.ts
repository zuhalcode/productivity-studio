"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { performanceService } from "@/lib/services/performance.service";
import { PerformanceMetric, EvaluatedMetric } from "@/types/database";
import { normalizeSupabaseError } from "@/lib/supabase/errors";

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await performanceService.getMetrics();
      setMetrics(data);
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal memuat metrik performa");
      setError(appErr.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Dictionary berindeks content_plan_id untuk akses cepat di UI
  const metricsMap = useMemo(() => {
    const map: Record<string, PerformanceMetric> = {};
    for (const m of metrics) {
      map[m.content_plan_id] = m;
    }
    return map;
  }, [metrics]);

  // Hitung rata-rata views sistem untuk patokan evaluasi
  const avgViews = useMemo(() => {
    if (metrics.length === 0) return 10000;
    const totalViews = metrics.reduce((acc, m) => acc + (m.views || 0), 0);
    return Math.round(totalViews / metrics.length);
  }, [metrics]);

  // Evaluasi seluruh metrik dengan formula BCP
  const evaluatedList = useMemo<EvaluatedMetric[]>(() => {
    return metrics.map((m) => performanceService.evaluatePerformance(m, avgViews));
  }, [metrics, avgViews]);

  const winningCount = useMemo(() => {
    return evaluatedList.filter((m) => m.verdict === "WINNING").length;
  }, [evaluatedList]);

  const avgSaveRate = useMemo(() => {
    if (evaluatedList.length === 0) return 0;
    const totalSaveRate = evaluatedList.reduce((acc, m) => acc + m.save_rate, 0);
    return Math.round((totalSaveRate / evaluatedList.length) * 100) / 100;
  }, [evaluatedList]);

  const saveMetric = async (
    metricData: Omit<PerformanceMetric, "created_at" | "updated_at"> & { id?: string }
  ): Promise<PerformanceMetric> => {
    setIsSaving(true);
    setError(null);
    try {
      const saved = await performanceService.saveMetric(metricData);
      setMetrics((prev) => {
        const index = prev.findIndex((m) => m.content_plan_id === saved.content_plan_id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = saved;
          return next;
        }
        return [...prev, saved];
      });
      return saved;
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal menyimpan metrik performa");
      setError(appErr.message);
      throw appErr;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteMetric = async (id: string): Promise<void> => {
    setIsSaving(true);
    setError(null);
    try {
      await performanceService.deleteMetric(id);
      setMetrics((prev) => prev.filter((m) => m.id !== id));
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal menghapus metrik performa");
      setError(appErr.message);
      throw appErr;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    metrics,
    metricsMap,
    evaluatedList,
    avgViews,
    winningCount,
    avgSaveRate,
    isLoading,
    isSaving,
    error,
    saveMetric,
    deleteMetric,
    refetch: fetchMetrics,
  };
}
