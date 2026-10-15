import { nicheRepository } from "@/lib/repositories/niche.repository";
import { NicheProfile } from "@/types/database";
import { AppError } from "@/lib/supabase/errors";

export const DEFAULT_NICHE_PROFILE: Omit<NicheProfile, "id" | "created_at" | "updated_at"> = {
  user_id: null,
  ikigai_data: {
    love_topics: ["Content Strategy", "Digital Product Creation", "Personal Branding"],
    skill_topics: ["Copywriting", "Video Editing", "Framework Design"],
    market_needs: ["UMKM butuh omset dari medsos", "Kreator frustrasi boncos energi"],
    monetizable: ["Konsultasi 1-on-1", "Template Notion/Worksheet", "Masterclass"],
  },
  sweet_spot: "Sistem Produksi Konten Anti-Burnout Berorientasi Konversi untuk Solopreneur",
  niche_final: "Content Operating System untuk Founder & UMKM yang ingin cuan tanpa harus jadi full-time influencer",
  core_value: "Bukan Cuma Posting — Ubah views semu menjadi aset penjualan berkelanjutan.",
  bio_ig_a: "Stop boncos energi bikin video tiap hari tanpa hasil.\nBantu UMKM bangun funnel konten penghasil leads 24/7.\nCek template gratis di bawah 👇",
  bio_ig_b: "Dari 0 ke 100K+ leads murni dari konten organik.\nFramework naskah retensi tinggi + sistematisasi batch sprint.\nAmbil toolkit di bio 🚀",
  bio_ig_c: "Founder BCP Methodology | Content Architect.\nBongkar trik algoritma & metrik sehat (save rate > views).\nKonsultasi gratis via link 👇",
  bio_tiktok: "Framework Ngonten Terstruktur Tanpa Terjebak Algoritma. Cek Bio! 🎯",
  tagline: "Bukan Cuma Posting, Bangun Aset Bisnis.",
  is_active: true,
};

export class NicheService {
  /**
   * Mengambil profil niche aktif. Jika belum ada di Supabase, otomatis
   * menginisialisasi dengan data default metodologi BCP.
   */
  async getNicheProfile(): Promise<NicheProfile> {
    const existing = await nicheRepository.getActiveNicheProfile();
    if (existing) {
      return existing;
    }

    // Inisialisasi awal ke Supabase
    const initialId = crypto.randomUUID();
    return await nicheRepository.upsertNicheProfile({
      id: initialId,
      ...DEFAULT_NICHE_PROFILE,
    });
  }

  /**
   * Memvalidasi dan menyimpan perubahan profil niche.
   */
  async saveNicheProfile(profile: Partial<NicheProfile> & { id: string }): Promise<NicheProfile> {
    if (profile.niche_final !== undefined && !profile.niche_final.trim()) {
      throw new AppError("Niche Final tidak boleh kosong.", "VALIDATION_ERROR");
    }
    if (profile.core_value !== undefined && !profile.core_value.trim()) {
      throw new AppError("Core Value tidak boleh kosong.", "VALIDATION_ERROR");
    }

    return await nicheRepository.upsertNicheProfile(profile);
  }
}

export const nicheService = new NicheService();
