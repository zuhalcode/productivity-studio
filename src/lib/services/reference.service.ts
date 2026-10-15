import { referenceRepository } from "@/lib/repositories/reference.repository";
import {
  HookTemplateRow,
  IdeaTemplateRow,
  CtaTemplateRow,
  ToolReferenceRow,
  GlossaryTermRow,
} from "@/types/database";
import {
  SEED_HOOKS,
  SEED_IDEAS,
  SEED_CTAS,
  SEED_TOOLS,
  SEED_GLOSSARY,
} from "@/data/seed-data";
import { AppError } from "@/lib/supabase/errors";

export class ReferenceService {
  /**
   * Mengambil template Hook. Mengutamakan data Supabase; jika tabel belum
   * terisi (belum di-seed) atau terjadi kendala jaringan, otomatis fallback
   * ke 105 seed hook otoritatif dari XLSX.
   */
  async getHooks(category?: string): Promise<HookTemplateRow[]> {
    try {
      const dbHooks = await referenceRepository.getHooks(category);
      if (dbHooks.length > 0) {
        return dbHooks;
      }
    } catch {
      // Fallback ke seed data lokal jika Supabase belum terhubung
    }

    return SEED_HOOKS.filter((h) => {
      if (category && category !== "ALL") {
        return h.category === category;
      }
      return true;
    }).map((h) => ({
      id: h.id,
      system_code: h.system_code,
      category: h.category,
      template_text: h.template_text,
      example_text: h.example_text,
      suitable_niche: h.suitable_niche,
      platform: h.platform,
      is_system: h.is_system,
      is_custom: h.is_custom,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  /**
   * Mengambil template Ide Konten.
   */
  async getIdeas(niche?: string, funnel?: string): Promise<IdeaTemplateRow[]> {
    try {
      const dbIdeas = await referenceRepository.getIdeas(niche, funnel);
      if (dbIdeas.length > 0) {
        return dbIdeas;
      }
    } catch {
      // Fallback ke seed data
    }

    return SEED_IDEAS.filter((i) => {
      const matchNiche = !niche || niche === "ALL" || i.niche === niche;
      const matchFunnel = !funnel || funnel === "ALL" || i.funnel_layer === funnel;
      return matchNiche && matchFunnel;
    }).map((i) => ({
      id: i.id,
      system_code: i.system_code,
      niche: i.niche,
      funnel_layer: i.funnel_layer,
      format_type: i.format_type,
      template_text: i.template_text,
      example_text: i.example_text,
      is_system: i.is_system,
      is_custom: i.is_custom,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  /**
   * Mengambil template CTA & CTV.
   */
  async getCtas(category?: string, ctaType?: string): Promise<CtaTemplateRow[]> {
    try {
      const dbCtas = await referenceRepository.getCtas(category, ctaType);
      if (dbCtas.length > 0) {
        return dbCtas;
      }
    } catch {
      // Fallback ke seed data
    }

    return SEED_CTAS.filter((c) => {
      const matchCat = !category || category === "ALL" || c.category === category;
      const matchType = !ctaType || ctaType === "ALL" || c.cta_type === ctaType;
      return matchCat && matchType;
    }).map((c) => ({
      id: c.id,
      system_code: c.system_code,
      category: c.category,
      cta_type: c.cta_type,
      template_text: c.template_text,
      example_text: c.example_text,
      is_system: c.is_system,
      is_custom: c.is_custom,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  /**
   * Mengambil direktori 31 tools produksi.
   */
  async getTools(phase?: string): Promise<ToolReferenceRow[]> {
    try {
      const dbTools = await referenceRepository.getTools(phase);
      if (dbTools.length > 0) {
        return dbTools;
      }
    } catch {
      // Fallback ke seed data
    }

    return SEED_TOOLS.filter((t) => {
      if (phase && phase !== "ALL") {
        return t.phase.toLowerCase() === phase.toLowerCase();
      }
      return true;
    }).map((t) => ({
      id: t.id,
      system_code: t.system_code,
      phase: t.phase,
      name: t.name,
      pricing_model: t.pricing_model,
      purpose: t.purpose,
      category_tag: t.category_tag,
      url: null,
      is_system: t.is_system,
      is_custom: t.is_custom,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  /**
   * Mengambil 100 istilah glosarium konten & algoritma.
   */
  async getGlossary(category?: string): Promise<GlossaryTermRow[]> {
    try {
      const dbGlossary = await referenceRepository.getGlossary(category);
      if (dbGlossary.length > 0) {
        return dbGlossary;
      }
    } catch {
      // Fallback ke seed data
    }

    return SEED_GLOSSARY.filter((g) => {
      if (category && category !== "ALL") {
        return g.category === category;
      }
      return true;
    }).map((g) => ({
      id: g.id,
      system_code: g.system_code,
      category: g.category,
      term: g.term,
      definition: g.definition,
      example_usage: g.example_usage,
      is_system: g.is_system,
      is_custom: g.is_custom,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  /**
   * Menambahkan template hook kustom.
   */
  async createCustomHook(
    templateText: string,
    exampleText: string,
    category: string,
    platform = "Keduanya"
  ): Promise<HookTemplateRow> {
    if (!templateText.trim()) {
      throw new AppError("Teks template hook tidak boleh kosong.", "VALIDATION_ERROR");
    }

    return await referenceRepository.createCustomHook({
      category,
      template_text: templateText.trim(),
      example_text: exampleText.trim() || templateText.trim(),
      suitable_niche: null,
      platform,
    });
  }
}

export const referenceService = new ReferenceService();
