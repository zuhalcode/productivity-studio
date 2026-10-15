import { supabase } from "@/lib/supabase/client";
import { NicheProfile } from "@/types/database";
import { normalizeSupabaseError } from "@/lib/supabase/errors";

export class NicheRepository {
  /**
   * Mengambil profil niche aktif tunggal pengguna.
   */
  async getActiveNicheProfile(): Promise<NicheProfile | null> {
    const { data, error } = await supabase
      .from("niche_profiles")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw normalizeSupabaseError(error, "Gagal memuat profil niche");
    }

    return (data as NicheProfile) || null;
  }

  /**
   * Menyimpan atau memperbarui profil niche.
   */
  async upsertNicheProfile(profile: Partial<NicheProfile> & { id?: string }): Promise<NicheProfile> {
    const payload = {
      ...profile,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("niche_profiles")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      throw normalizeSupabaseError(error, "Gagal menyimpan profil niche");
    }

    return data as NicheProfile;
  }
}

export const nicheRepository = new NicheRepository();
