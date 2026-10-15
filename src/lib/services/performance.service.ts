import { performanceRepository } from "@/lib/repositories/performance.repository";
import { PerformanceMetric, EvaluatedMetric, ContentVerdict } from "@/types/database";
import { AppError } from "@/lib/supabase/errors";

export class PerformanceService {
  /**
   * Mengambil seluruh data metrik performa.
   */
  async getMetrics(): Promise<PerformanceMetric[]> {
    return await performanceRepository.getPerformanceMetrics();
  }

  /**
   * Mengambil metrik performa berdasarkan content_plan_id.
   */
  async getMetricByPlanId(planId: string): Promise<PerformanceMetric | null> {
    return await performanceRepository.getMetricByPlanId(planId);
  }

  /**
   * Menyimpan atau memperbarui metrik performa pasca-tayang.
   */
  async saveMetric(
    metricData: Omit<PerformanceMetric, "created_at" | "updated_at"> & { id?: string }
  ): Promise<PerformanceMetric> {
    // Validasi nilai non-negatif
    if (metricData.views < 0 || metricData.likes < 0 || metricData.comments < 0 || metricData.shares < 0 || metricData.saves < 0) {
      throw new AppError("Nilai metrik (views, likes, comments, shares, saves) tidak boleh negatif.", "VALIDATION_ERROR");
    }

    if (!metricData.post_date) {
      throw new AppError("Tanggal posting wajib diisi.", "VALIDATION_ERROR");
    }

    return await performanceRepository.upsertMetric({
      id: metricData.id || crypto.randomUUID(),
      ...metricData,
    });
  }

  /**
   * Menghapus metrik performa.
   */
  async deleteMetric(id: string): Promise<void> {
    await performanceRepository.deleteMetric(id);
  }

  /**
   * Formula Evaluasi Kinerja Konten BCP (Formula Sheet 10).
   * Menghitung Save Rate %, Engagement Rate %, dan memvonis status konten.
   */
  evaluatePerformance(
    metric: PerformanceMetric,
    averageViews: number
  ): EvaluatedMetric {
    const views = metric.views || 0;
    const saves = metric.saves || 0;
    const likes = metric.likes || 0;
    const comments = metric.comments || 0;
    const shares = metric.shares || 0;

    const saveRate = views > 0 ? (saves / views) * 100 : 0;
    const engagementRate = views > 0 ? ((likes + comments + shares + saves) / views) * 100 : 0;

    let verdict: ContentVerdict = "PENDING";

    if (views === 0) {
      verdict = "PENDING";
    } else if (views >= averageViews && saveRate >= 5.0) {
      verdict = "WINNING";
    } else if (saveRate >= 3.0) {
      verdict = "GOOD";
    } else if (engagementRate >= 3.0) {
      verdict = "OPTIMASI";
    } else {
      verdict = "STOP";
    }

    return {
      ...metric,
      save_rate: Math.round(saveRate * 100) / 100,
      engagement_rate: Math.round(engagementRate * 100) / 100,
      verdict,
    };
  }
}

export const performanceService = new PerformanceService();
