import { briefRepository } from "@/lib/repositories/brief.repository";
import { contentPlanRepository } from "@/lib/repositories/content-plan.repository";
import { ContentBrief, ContentPlan } from "@/types/database";
import { AppError } from "@/lib/supabase/errors";

export class BriefService {
  /**
   * Mengambil naskah brief HTPC berdasarkan plan_id. Jika belum ada di Supabase,
   * mengembalikan objek template kosong yang siap diisi.
   */
  async getBriefByPlanId(planId: string): Promise<ContentBrief> {
    const existing = await briefRepository.getBriefByPlanId(planId);
    if (existing) {
      return existing;
    }

    return {
      id: crypto.randomUUID(),
      plan_id: planId,
      hook_ref_id: null,
      cta_ref_id: null,
      target_duration: "45-60 detik",
      hook_text: "",
      tension_text: "",
      payoff_text: "",
      ctv_text: "",
      caption: "",
      hashtags: ["bukancumaposting", "bisnisonline"],
      production_notes: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Menyimpan naskah brief HTPC dan mengoordinasikan pembaruan status plan.
   */
  async saveBrief(
    briefData: ContentBrief,
    newPlanStatus?: ContentPlan["status"]
  ): Promise<{ brief: ContentBrief; plan?: ContentPlan }> {
    // 1. Validasi Batasan Jumlah Hashtag (Maksimal 5)
    if (briefData.hashtags && briefData.hashtags.length > 5) {
      throw new AppError("Maksimal 5 hashtag yang diperbolehkan.", "VALIDATION_ERROR");
    }

    // 2. Validasi Kelengkapan Blok HTPC jika status ditandai "Done" (Siap Syuting)
    if (newPlanStatus === "Done") {
      if (!briefData.hook_text?.trim()) {
        throw new AppError("Blok 1 (Hook 3 Detik) wajib terisi sebelum menandai Done!", "VALIDATION_ERROR");
      }
      if (!briefData.tension_text?.trim()) {
        throw new AppError("Blok 2 (Tension / Masalah) wajib terisi sebelum menandai Done!", "VALIDATION_ERROR");
      }
      if (!briefData.payoff_text?.trim()) {
        throw new AppError("Blok 3 (Payoff / Daging Solusi) wajib terisi sebelum menandai Done!", "VALIDATION_ERROR");
      }
      if (!briefData.ctv_text?.trim()) {
        throw new AppError("Blok 4 (Call to Value) wajib terisi sebelum menandai Done!", "VALIDATION_ERROR");
      }
    }

    // 3. Upsert Brief ke Supabase
    const savedBrief = await briefRepository.upsertBrief({
      id: briefData.id || crypto.randomUUID(),
      plan_id: briefData.plan_id,
      hook_ref_id: briefData.hook_ref_id || null,
      cta_ref_id: briefData.cta_ref_id || null,
      target_duration: briefData.target_duration || null,
      hook_text: briefData.hook_text || "",
      tension_text: briefData.tension_text || "",
      payoff_text: briefData.payoff_text || "",
      ctv_text: briefData.ctv_text || "",
      caption: briefData.caption || null,
      hashtags: briefData.hashtags || [],
      production_notes: briefData.production_notes || null,
    });

    // 4. Koordinasi Update Status Rencana Konten jika diminta
    let updatedPlan: ContentPlan | undefined;
    if (newPlanStatus) {
      updatedPlan = await contentPlanRepository.updateContentPlan(briefData.plan_id, {
        status: newPlanStatus,
      });
    }

    return { brief: savedBrief, plan: updatedPlan };
  }
}

export const briefService = new BriefService();
