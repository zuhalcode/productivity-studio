import { supabase } from "@/lib/supabase/client";
import {
  HookTemplateRow,
  IdeaTemplateRow,
  CtaTemplateRow,
  ToolReferenceRow,
  GlossaryTermRow,
} from "@/types/database";
import { normalizeSupabaseError } from "@/lib/supabase/errors";

export class ReferenceRepository {
  /**
   * Mengambil template Hook dari Supabase.
   */
  async getHooks(category?: string): Promise<HookTemplateRow[]> {
    let query = supabase
      .from("hook_templates")
      .select("*")
      .order("system_code", { ascending: true, nullsFirst: false });

    if (category && category !== "ALL") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) {
      throw normalizeSupabaseError(error, "Gagal memuat repositori hook");
    }

    return (data as HookTemplateRow[]) || [];
  }

  /**
   * Menambahkan template Hook kustom pengguna.
   */
  async createCustomHook(
    hook: Omit<HookTemplateRow, "id" | "created_at" | "updated_at" | "is_system" | "is_custom" | "system_code">
  ): Promise<HookTemplateRow> {
    const payload = {
      ...hook,
      system_code: null,
      is_system: false,
      is_custom: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("hook_templates")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw normalizeSupabaseError(error, "Gagal menambahkan hook kustom");
    }

    return data as HookTemplateRow;
  }

  /**
   * Mengambil template Ide dari Supabase.
   */
  async getIdeas(niche?: string, funnel?: string): Promise<IdeaTemplateRow[]> {
    let query = supabase
      .from("idea_templates")
      .select("*")
      .order("system_code", { ascending: true, nullsFirst: false });

    if (niche && niche !== "ALL") {
      query = query.eq("niche", niche);
    }
    if (funnel && funnel !== "ALL") {
      query = query.eq("funnel_layer", funnel);
    }

    const { data, error } = await query;
    if (error) {
      throw normalizeSupabaseError(error, "Gagal memuat repositori ide");
    }

    return (data as IdeaTemplateRow[]) || [];
  }

  /**
   * Mengambil template CTA/CTV dari Supabase.
   */
  async getCtas(category?: string, ctaType?: string): Promise<CtaTemplateRow[]> {
    let query = supabase
      .from("cta_templates")
      .select("*")
      .order("system_code", { ascending: true, nullsFirst: false });

    if (category && category !== "ALL") {
      query = query.eq("category", category);
    }
    if (ctaType && ctaType !== "ALL") {
      query = query.eq("cta_type", ctaType);
    }

    const { data, error } = await query;
    if (error) {
      throw normalizeSupabaseError(error, "Gagal memuat repositori CTA");
    }

    return (data as CtaTemplateRow[]) || [];
  }

  /**
   * Mengambil referensi perangkat (tools) dari Supabase.
   */
  async getTools(phase?: string): Promise<ToolReferenceRow[]> {
    let query = supabase
      .from("tool_references")
      .select("*")
      .order("system_code", { ascending: true, nullsFirst: false });

    if (phase && phase !== "ALL") {
      query = query.eq("phase", phase);
    }

    const { data, error } = await query;
    if (error) {
      throw normalizeSupabaseError(error, "Gagal memuat direktori tools");
    }

    return (data as ToolReferenceRow[]) || [];
  }

  /**
   * Mengambil daftar istilah glosarium dari Supabase.
   */
  async getGlossary(category?: string): Promise<GlossaryTermRow[]> {
    let query = supabase
      .from("glossary_terms")
      .select("*")
      .order("category", { ascending: true })
      .order("term", { ascending: true });

    if (category && category !== "ALL") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) {
      throw normalizeSupabaseError(error, "Gagal memuat glosarium");
    }

    return (data as GlossaryTermRow[]) || [];
  }
}

export const referenceRepository = new ReferenceRepository();
