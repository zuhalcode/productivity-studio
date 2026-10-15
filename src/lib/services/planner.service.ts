import { contentPlanRepository } from "@/lib/repositories/content-plan.repository";
import { ContentPlan, FunnelLayer } from "@/types/database";
import { AppError } from "@/lib/supabase/errors";

const FUNNEL_CADENCE: FunnelLayer[] = [
  "Engagement",
  "Engagement",
  "Engagement",
  "Authority",
  "Authority",
  "Authority",
  "Sales",
];

export function buildDefaultPlansForMonths(startMonth = 1, endMonth = 3): Array<Omit<ContentPlan, "created_at" | "updated_at">> {
  const plans: Array<Omit<ContentPlan, "created_at" | "updated_at">> = [];

  for (let m = startMonth; m <= endMonth; m++) {
    for (let w = 1; w <= 4; w++) {
      for (let s = 1; s <= 7; s++) {
        const funnel = FUNNEL_CADENCE[s - 1];
        plans.push({
          id: crypto.randomUUID(),
          user_id: null,
          niche_id: null,
          persona_id: null,
          month_index: m,
          week_index: w,
          slot_index: s,
          scheduled_date: null,
          funnel_layer: funnel,
          topic: `Slot Konten #${s} (Minggu ${w})`,
          reference_url: null,
          format: s === 7 ? "Carousel" : s % 2 === 0 ? "Reels" : "Single Image",
          platform: "Instagram",
          status: "Ide",
        });
      }
    }
  }

  return plans;
}

export class PlannerService {
  /**
   * Mengambil slot rencana konten. Jika belum ada slot terdaftar di Supabase,
   * otomatis menginisialisasi 3 bulan pertama (84 slot) dengan ritme 3-3-1.
   */
  async getContentPlans(filter?: { month?: number; week?: number }): Promise<ContentPlan[]> {
    const plans = await contentPlanRepository.getContentPlans(filter);
    if (plans.length > 0) {
      return plans;
    }

    // Jika filter spesifik diminta tapi database sama sekali kosong, inisialisasi default
    const allPlans = await contentPlanRepository.getContentPlans();
    if (allPlans.length === 0) {
      const defaultSlots = buildDefaultPlansForMonths(1, 3);
      const inserted = await contentPlanRepository.bulkCreateContentPlans(defaultSlots);
      if (filter?.month || filter?.week) {
        return inserted.filter((p) => {
          const matchMonth = !filter.month || p.month_index === filter.month;
          const matchWeek = !filter.week || p.week_index === filter.week;
          return matchMonth && matchWeek;
        });
      }
      return inserted;
    }

    return plans;
  }

  /**
   * Mengambil detail satu slot rencana konten.
   */
  async getContentPlanById(id: string): Promise<ContentPlan | null> {
    return await contentPlanRepository.getContentPlanById(id);
  }

  /**
   * Memperbarui informasi slot rencana konten.
   */
  async updateContentPlan(id: string, updates: Partial<ContentPlan>): Promise<ContentPlan> {
    if (updates.topic !== undefined && !updates.topic.trim()) {
      throw new AppError("Topik konten tidak boleh kosong.", "VALIDATION_ERROR");
    }

    return await contentPlanRepository.updateContentPlan(id, updates);
  }

  /**
   * Menambahkan slot tambahan jika diperlukan.
   */
  async createContentPlan(
    planData: Omit<ContentPlan, "id" | "created_at" | "updated_at">
  ): Promise<ContentPlan> {
    if (!planData.topic.trim()) {
      throw new AppError("Topik konten wajib diisi.", "VALIDATION_ERROR");
    }

    return await contentPlanRepository.createContentPlan({
      id: crypto.randomUUID(),
      ...planData,
    });
  }
}

export const plannerService = new PlannerService();
