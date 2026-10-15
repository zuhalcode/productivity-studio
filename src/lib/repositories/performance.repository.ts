import { supabase } from "@/lib/supabase/client";
import { PerformanceMetric } from "@/types/database";
import { normalizeSupabaseError } from "@/lib/supabase/errors";

export class PerformanceRepository {
  /**
   * Mengambil semua metrik performa yang tersimpan.
   */
  async getPerformanceMetrics(): Promise<PerformanceMetric[]> {
    const { data, error } = await supabase
      .from("performance_metrics")
      .select("*")
      .order("post_date", { ascending: false });

    if (error) {
      throw normalizeSupabaseError(error, "Gagal memuat data performa konten");
    }

    return (data as PerformanceMetric[]) || [];
  }

  /**
   * Mengambil metrik spesifik berdasarkan content_plan_id.
   */
  async getMetricByPlanId(planId: string): Promise<PerformanceMetric | null> {
    const { data, error } = await supabase
      .from("performance_metrics")
      .select("*")
      .eq("content_plan_id", planId)
      .maybeSingle();

    if (error) {
      throw normalizeSupabaseError(error, "Gagal memuat metrik konten spesifik");
    }

    return (data as PerformanceMetric) || null;
  }

  /**
   * Menyimpan atau memperbarui metrik performa (upsert berdasarkan unique content_plan_id).
   */
  async upsertMetric(
    metric: Omit<PerformanceMetric, "created_at" | "updated_at"> & { id?: string; created_at?: string }
  ): Promise<PerformanceMetric> {
    const payload = {
      ...metric,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("performance_metrics")
      .upsert(payload, { onConflict: "content_plan_id" })
      .select()
      .single();

    if (error) {
      throw normalizeSupabaseError(error, "Gagal menyimpan metrik performa");
    }

    return data as PerformanceMetric;
  }

  /**
   * Menghapus catatan metrik performa.
   */
  async deleteMetric(id: string): Promise<void> {
    const { error } = await supabase
      .from("performance_metrics")
      .delete()
      .eq("id", id);

    if (error) {
      throw normalizeSupabaseError(error, "Gagal menghapus metrik performa");
    }
  }
}

export const performanceRepository = new PerformanceRepository();
