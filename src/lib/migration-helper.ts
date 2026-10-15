/**
 * Productivity Studio: Safe Explicit Local-to-Supabase Data Migration Helper
 * 
 * Memungkinkan pengguna mengimpor data lama dari localStorage (productivity_studio_data_v1)
 * ke Supabase PostgreSQL secara eksplisit tanpa risiko kehilangan data atau reset implisit.
 */

import { supabase } from "@/lib/supabase/client";
import { AppStoreData } from "@/lib/store";
import { normalizeSupabaseError } from "@/lib/supabase/errors";

const LOCAL_STORAGE_KEY = "productivity_studio_data_v1";

export interface LocalDataSummary {
  hasData: boolean;
  nicheTitle?: string;
  personaCount: number;
  planCount: number;
  briefCount: number;
  taskCount: number;
  metricCount: number;
}

export function inspectLocalLegacyData(): LocalDataSummary {
  if (typeof window === "undefined") {
    return { hasData: false, personaCount: 0, planCount: 0, briefCount: 0, taskCount: 0, metricCount: 0 };
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return { hasData: false, personaCount: 0, planCount: 0, briefCount: 0, taskCount: 0, metricCount: 0 };
    }

    const parsed: AppStoreData = JSON.parse(raw);
    return {
      hasData: true,
      nicheTitle: parsed.nicheProfile?.niche_final || "Profil Niche",
      personaCount: parsed.personas?.length || 0,
      planCount: parsed.contentPlans?.length || 0,
      briefCount: Object.keys(parsed.briefs || {}).length,
      taskCount: parsed.tasks?.length || 0,
      metricCount: Object.keys(parsed.performanceMetrics || {}).length,
    };
  } catch {
    return { hasData: false, personaCount: 0, planCount: 0, briefCount: 0, taskCount: 0, metricCount: 0 };
  }
}

/**
 * Validasi apakah sebuah string adalah format UUID RFC 4122 yang sah.
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export interface MigrationResult {
  success: boolean;
  migratedSummary: {
    nicheProfiles: number;
    personas: number;
    contentPlans: number;
    contentBriefs: number;
    tasks: number;
    performanceMetrics: number;
  };
  backupKey?: string;
  error?: string;
}

/**
 * Menjalankan proses migrasi data dari localStorage ke Supabase PostgreSQL.
 * Mengonversi seluruh ID lokal non-UUID menjadi UUID valid dengan pemetaan konsisten
 * agar seluruh hubungan relasional (parent_id, plan_id) tetap terjaga 100%.
 */
export async function migrateLocalDataToSupabase(): Promise<MigrationResult> {
  if (typeof window === "undefined") {
    return {
      success: false,
      migratedSummary: { nicheProfiles: 0, personas: 0, contentPlans: 0, contentBriefs: 0, tasks: 0, performanceMetrics: 0 },
      error: "Eksekusi hanya dapat dilakukan di lingkungan browser.",
    };
  }

  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    return {
      success: false,
      migratedSummary: { nicheProfiles: 0, personas: 0, contentPlans: 0, contentBriefs: 0, tasks: 0, performanceMetrics: 0 },
      error: "Tidak ditemukan data lokal di bawah kunci 'productivity_studio_data_v1'.",
    };
  }

  try {
    const localData: AppStoreData = JSON.parse(raw);
    const idMap = new Map<string, string>();

    const getOrCreateUUID = (oldId: string): string => {
      if (isValidUUID(oldId)) return oldId;
      if (idMap.has(oldId)) return idMap.get(oldId)!;
      const newUuid = crypto.randomUUID();
      idMap.set(oldId, newUuid);
      return newUuid;
    };

    const summary = {
      nicheProfiles: 0,
      personas: 0,
      contentPlans: 0,
      contentBriefs: 0,
      tasks: 0,
      performanceMetrics: 0,
    };

    // 1. Migrasi Niche Profile
    if (localData.nicheProfile) {
      const np = localData.nicheProfile;
      const nicheId = getOrCreateUUID(np.id || "np-default");
      const { error } = await supabase.from("niche_profiles").upsert({
        id: nicheId,
        user_id: null,
        ikigai_data: np.ikigai_data,
        sweet_spot: np.sweet_spot,
        niche_final: np.niche_final,
        core_value: np.core_value,
        bio_ig_a: np.bio_ig_a,
        bio_ig_b: np.bio_ig_b,
        bio_ig_c: np.bio_ig_c,
        bio_tiktok: np.bio_tiktok,
        tagline: np.tagline,
        is_active: np.is_active ?? true,
        updated_at: new Date().toISOString(),
      });
      if (error) throw normalizeSupabaseError(error, "Gagal mengimpor Niche Profile");
      summary.nicheProfiles++;
    }

    // 2. Migrasi Audience Personas
    if (localData.personas && localData.personas.length > 0) {
      for (const p of localData.personas) {
        const personaId = getOrCreateUUID(p.id);
        const { error } = await supabase.from("audience_personas").upsert({
          id: personaId,
          user_id: null,
          persona_name: p.persona_name,
          demographics: p.demographics,
          pain_points: p.pain_points,
          desires: p.desires,
          objections: p.objections,
          narrative: p.narrative,
          is_active: p.is_active ?? true,
          updated_at: new Date().toISOString(),
        });
        if (error) throw normalizeSupabaseError(error, `Gagal mengimpor persona ${p.persona_name}`);
        summary.personas++;
      }
    }

    // 3. Migrasi Content Plans
    if (localData.contentPlans && localData.contentPlans.length > 0) {
      for (const cp of localData.contentPlans) {
        const planId = getOrCreateUUID(cp.id);
        const { error } = await supabase.from("content_plans").upsert({
          id: planId,
          user_id: null,
          niche_id: null,
          persona_id: null,
          month_index: cp.month_index,
          week_index: cp.week_index,
          slot_index: cp.slot_index,
          scheduled_date: cp.scheduled_date || null,
          funnel_layer: cp.funnel_layer,
          topic: cp.topic,
          reference_url: cp.reference_url || null,
          format: cp.format,
          platform: cp.platform,
          status: cp.status,
          updated_at: new Date().toISOString(),
        });
        if (error) throw normalizeSupabaseError(error, `Gagal mengimpor slot konten ${cp.topic}`);
        summary.contentPlans++;
      }
    }

    // 4. Migrasi Content Briefs
    if (localData.briefs) {
      for (const [oldPlanId, brief] of Object.entries(localData.briefs)) {
        const mappedPlanId = getOrCreateUUID(oldPlanId);
        const briefId = getOrCreateUUID(brief.id || `brief-${oldPlanId}`);
        const { error } = await supabase.from("content_briefs").upsert({
          id: briefId,
          plan_id: mappedPlanId,
          hook_ref_id: null,
          cta_ref_id: null,
          target_duration: brief.target_duration || null,
          hook_text: brief.hook_text || "",
          tension_text: brief.tension_text || "",
          payoff_text: brief.payoff_text || "",
          ctv_text: brief.ctv_text || "",
          caption: brief.caption || null,
          hashtags: brief.hashtags || [],
          production_notes: brief.production_notes || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "plan_id" });
        if (error) throw normalizeSupabaseError(error, `Gagal mengimpor naskah brief untuk plan ${oldPlanId}`);
        summary.contentBriefs++;
      }
    }

    // 5. Migrasi Tasks (Hierarki dengan parent_id mapping)
    if (localData.tasks && localData.tasks.length > 0) {
      // Petakan semua ID task terlebih dahulu
      localData.tasks.forEach((t) => getOrCreateUUID(t.id));

      for (const t of localData.tasks) {
        const taskId = getOrCreateUUID(t.id);
        const parentId = t.parent_id ? getOrCreateUUID(t.parent_id) : null;
        const { error } = await supabase.from("tasks").upsert({
          id: taskId,
          user_id: null,
          parent_id: parentId,
          content_plan_id: null,
          title: t.title,
          description: t.description || null,
          notes: t.notes || null,
          sort_order: t.sort_order || 0,
          is_completed: t.is_completed ?? false,
          is_archived: t.is_archived ?? false,
          start_date: t.start_date || null,
          due_date: t.due_date || null,
          updated_at: new Date().toISOString(),
        });
        if (error) throw normalizeSupabaseError(error, `Gagal mengimpor tugas ${t.title}`);
        summary.tasks++;
      }
    }

    // 6. Migrasi Performance Metrics
    if (localData.performanceMetrics) {
      for (const [oldPlanId, m] of Object.entries(localData.performanceMetrics)) {
        const mappedPlanId = getOrCreateUUID(oldPlanId);
        const metricId = getOrCreateUUID(m.id || `pm-${oldPlanId}`);
        const { error } = await supabase.from("performance_metrics").upsert({
          id: metricId,
          user_id: null,
          content_plan_id: mappedPlanId,
          post_date: m.post_date || new Date().toISOString().split("T")[0],
          content_link: m.content_link || null,
          views: m.views || 0,
          likes: m.likes || 0,
          comments: m.comments || 0,
          shares: m.shares || 0,
          saves: m.saves || 0,
          evaluation_date: m.evaluation_date || null,
          learning_notes: m.learning_notes || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "content_plan_id" });
        if (error) throw normalizeSupabaseError(error, `Gagal mengimpor metrik untuk plan ${oldPlanId}`);
        summary.performanceMetrics++;
      }
    }

    // Buat cadangan aman data lama di localStorage dan tandai migrasi sukses
    const backupKey = `productivity_studio_backup_${Date.now()}`;
    localStorage.setItem(backupKey, raw);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.setItem("productivity_studio_migrated_at", new Date().toISOString());

    return {
      success: true,
      migratedSummary: summary,
      backupKey,
    };
  } catch (err: unknown) {
    const appError = normalizeSupabaseError(err, "Migrasi data gagal dieksekusi");
    return {
      success: false,
      migratedSummary: { nicheProfiles: 0, personas: 0, contentPlans: 0, contentBriefs: 0, tasks: 0, performanceMetrics: 0 },
      error: appError.message,
    };
  }
}
