import { supabase } from "@/lib/supabase/client";
import { ContentPlan } from "@/types/database";
import { normalizeSupabaseError } from "@/lib/supabase/errors";

export class ContentPlanRepository {
  /**
   * Mengambil seluruh slot rencana konten, dengan opsi filter bulan & minggu.
   */
  async getContentPlans(filter?: { month?: number; week?: number }): Promise<ContentPlan[]> {
    let query = supabase
      .from("content_plans")
      .select("*")
      .order("month_index", { ascending: true })
      .order("week_index", { ascending: true })
      .order("slot_index", { ascending: true });

    if (filter?.month) {
      query = query.eq("month_index", filter.month);
    }
    if (filter?.week) {
      query = query.eq("week_index", filter.week);
    }

    const { data, error } = await query;

    if (error) {
      throw normalizeSupabaseError(error, "Gagal memuat rencana konten");
    }

    return (data as ContentPlan[]) || [];
  }

  /**
   * Mengambil slot rencana konten spesifik berdasarkan ID.
   */
  async getContentPlanById(id: string): Promise<ContentPlan | null> {
    const { data, error } = await supabase
      .from("content_plans")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw normalizeSupabaseError(error, "Gagal memuat detail rencana konten");
    }

    return (data as ContentPlan) || null;
  }

  /**
   * Membuat satu slot rencana konten baru.
   */
  async createContentPlan(
    plan: Omit<ContentPlan, "id" | "created_at" | "updated_at"> & { id?: string }
  ): Promise<ContentPlan> {
    const payload = {
      ...plan,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("content_plans")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw normalizeSupabaseError(error, "Gagal membuat rencana konten");
    }

    return data as ContentPlan;
  }

  /**
   * Bulk insert slot kalender (misal inisialisasi default 336 slot BCP).
   */
  async bulkCreateContentPlans(
    plans: Array<Omit<ContentPlan, "id" | "created_at" | "updated_at"> & { id?: string }>
  ): Promise<ContentPlan[]> {
    const timestamp = new Date().toISOString();
    const payload = plans.map((p) => ({
      ...p,
      created_at: timestamp,
      updated_at: timestamp,
    }));

    const { data, error } = await supabase
      .from("content_plans")
      .insert(payload)
      .select();

    if (error) {
      throw normalizeSupabaseError(error, "Gagal menginisialisasi slot rencana konten");
    }

    return (data as ContentPlan[]) || [];
  }

  /**
   * Memperbarui detail slot rencana konten.
   */
  async updateContentPlan(id: string, updates: Partial<ContentPlan>): Promise<ContentPlan> {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("content_plans")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw normalizeSupabaseError(error, "Gagal memperbarui rencana konten");
    }

    return data as ContentPlan;
  }

  /**
   * Menghapus slot rencana konten.
   */
  async deleteContentPlan(id: string): Promise<void> {
    const { error } = await supabase
      .from("content_plans")
      .delete()
      .eq("id", id);

    if (error) {
      throw normalizeSupabaseError(error, "Gagal menghapus rencana konten");
    }
  }
}

export const contentPlanRepository = new ContentPlanRepository();
