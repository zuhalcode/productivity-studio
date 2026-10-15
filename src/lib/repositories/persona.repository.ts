import { supabase } from "@/lib/supabase/client";
import { AudiencePersona } from "@/types/database";
import { normalizeSupabaseError } from "@/lib/supabase/errors";

export class PersonaRepository {
  /**
   * Mengambil semua profil persona audiens yang aktif.
   */
  async getPersonas(): Promise<AudiencePersona[]> {
    const { data, error } = await supabase
      .from("audience_personas")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      throw normalizeSupabaseError(error, "Gagal memuat persona audiens");
    }

    return (data as AudiencePersona[]) || [];
  }

  /**
   * Membuat persona audiens baru.
   */
  async createPersona(
    persona: Omit<AudiencePersona, "id" | "created_at" | "updated_at"> & { id?: string }
  ): Promise<AudiencePersona> {
    const payload = {
      ...persona,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("audience_personas")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw normalizeSupabaseError(error, "Gagal menambahkan persona audiens");
    }

    return data as AudiencePersona;
  }

  /**
   * Memperbarui persona audiens.
   */
  async updatePersona(id: string, updates: Partial<AudiencePersona>): Promise<AudiencePersona> {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("audience_personas")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw normalizeSupabaseError(error, "Gagal memperbarui persona audiens");
    }

    return data as AudiencePersona;
  }

  /**
   * Menghapus persona audiens secara permanen.
   */
  async deletePersona(id: string): Promise<void> {
    const { error } = await supabase
      .from("audience_personas")
      .delete()
      .eq("id", id);

    if (error) {
      throw normalizeSupabaseError(error, "Gagal menghapus persona audiens");
    }
  }
}

export const personaRepository = new PersonaRepository();
