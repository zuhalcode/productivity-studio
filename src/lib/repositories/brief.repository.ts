import { supabase } from "@/lib/supabase/client";
import { ContentBrief } from "@/types/database";
import { normalizeSupabaseError } from "@/lib/supabase/errors";

export class BriefRepository {
  /**
   * Mengambil naskah brief berdasarkan plan_id konten.
   */
  async getBriefByPlanId(planId: string): Promise<ContentBrief | null> {
    const { data, error } = await supabase
      .from("content_briefs")
      .select("*")
      .eq("plan_id", planId)
      .maybeSingle();

    if (error) {
      throw normalizeSupabaseError(error, "Gagal memuat naskah brief");
    }

    return (data as ContentBrief) || null;
  }

  /**
   * Menyimpan atau memperbarui brief HTPC (upsert berdasarkan unique plan_id).
   */
  async upsertBrief(
    brief: Omit<ContentBrief, "created_at" | "updated_at"> & { id?: string; created_at?: string }
  ): Promise<ContentBrief> {
    const payload = {
      ...brief,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("content_briefs")
      .upsert(payload, { onConflict: "plan_id" })
      .select()
      .single();

    if (error) {
      throw normalizeSupabaseError(error, "Gagal menyimpan naskah brief");
    }

    return data as ContentBrief;
  }

  /**
   * Menghapus brief naskah.
   */
  async deleteBrief(id: string): Promise<void> {
    const { error } = await supabase
      .from("content_briefs")
      .delete()
      .eq("id", id);

    if (error) {
      throw normalizeSupabaseError(error, "Gagal menghapus naskah brief");
    }
  }
}

export const briefRepository = new BriefRepository();
