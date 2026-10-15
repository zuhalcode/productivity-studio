/**
 * Productivity Studio: Unified State & Data Store
 * 
 * Mengelola tipe data operasional pengguna dan reference data
 * dengan Supabase PostgreSQL sebagai basis data utama.
 */

import type {
  HookTemplate,
  IdeaTemplate,
  CtaTemplate,
  GlossaryTerm,
  ToolReference,
} from "@/data/seed-data";
import type { TaskItem } from "@/lib/todo-engine";
import { performanceService } from "@/lib/services/performance.service";
import type {
  PerformanceMetric,
  EvaluatedMetric,
  ContentVerdict,
} from "@/types/database";

export interface NicheProfile {
  id: string;
  ikigai_data: {
    love_topics: string[];
    skill_topics: string[];
    market_needs: string[];
    monetizable: string[];
  };
  sweet_spot: string;
  niche_final: string;
  core_value: string;
  bio_ig_a: string;
  bio_ig_b: string;
  bio_ig_c: string;
  bio_tiktok: string;
  tagline: string;
  is_active: boolean;
  updated_at: string;
}

export interface AudiencePersona {
  id: string;
  persona_name: string;
  demographics: {
    age_range: string;
    gender: string;
    occupation: string;
    income: string;
    location: string;
  };
  pain_points: string;
  desires: string;
  objections: string;
  narrative: string;
  is_active: boolean;
  updated_at: string;
}

export interface ContentPlan {
  id: string;
  month_index: number; // 1-12
  week_index: number;  // 1-4
  slot_index: number;  // 1-7
  scheduled_date?: string;
  funnel_layer: "Engagement" | "Authority" | "Sales";
  topic: string;
  reference_url?: string;
  format: "Single Image" | "Carousel" | "Reels";
  platform: "Instagram" | "TikTok" | "YouTube";
  status: "Ide" | "On Process" | "Done" | "Posted";
  updated_at: string;
}

export interface ContentBrief {
  id: string;
  plan_id: string;
  hook_ref_id?: string | null;
  cta_ref_id?: string | null;
  target_duration?: string;
  hook_text: string;
  tension_text: string;
  payoff_text: string;
  ctv_text: string;
  caption?: string;
  hashtags: string[];
  production_notes?: string;
  updated_at: string;
}

export type {
  PerformanceMetric,
  EvaluatedMetric,
  ContentVerdict,
};

export interface AppStoreData {
  nicheProfile: NicheProfile;
  personas: AudiencePersona[];
  contentPlans: ContentPlan[];
  briefs: Record<string, ContentBrief>; // key: plan_id
  tasks: TaskItem[];
  performanceMetrics: Record<string, PerformanceMetric>; // key: content_plan_id
  customHooks: HookTemplate[];
  customIdeas: IdeaTemplate[];
  customCtas: CtaTemplate[];
  customTools: ToolReference[];
  customGlossary: GlossaryTerm[];
}


// Inisialisasi Kalender 3-3-1 Standar BCP (Bulan 1 s/d 12, tiap minggu: 3 Engagement, 3 Authority, 1 Sales)
export function generateDefaultPlans(): ContentPlan[] {
  const plans: ContentPlan[] = [];
  const funnelCadence: Array<"Engagement" | "Authority" | "Sales"> = [
    "Engagement",
    "Engagement",
    "Engagement",
    "Authority",
    "Authority",
    "Authority",
    "Sales",
  ];

  // Buat default slot untuk bulan berjalan (contoh: Bulan 1 s/d Bulan 3)
  for (let m = 1; m <= 3; m++) {
    for (let w = 1; w <= 4; w++) {
      for (let s = 1; s <= 7; s++) {
        const funnel = funnelCadence[s - 1];
        plans.push({
          id: `plan-m${m}-w${w}-s${s}`,
          month_index: m,
          week_index: w,
          slot_index: s,
          funnel_layer: funnel,
          topic: `Slot Konten #${s} (Minggu ${w})`,
          format: s === 7 ? "Carousel" : s % 2 === 0 ? "Reels" : "Single Image",
          platform: "Instagram",
          status: "Ide",
          updated_at: new Date().toISOString(),
        });
      }
    }
  }
  return plans;
}

export function getDefaultStoreData(): AppStoreData {
  return {
    nicheProfile: {
      id: "np-default",
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
      updated_at: new Date().toISOString(),
    },
    personas: [
      {
        id: "ap-default-1",
        persona_name: "Dinda, 27 th — Pemilik Brand Fashion Lokal",
        demographics: {
          age_range: "25-34",
          gender: "Wanita",
          occupation: "Owner Bisnis Online",
          income: "Rp 15-30 Juta/bln",
          location: "Bandung / Jabodetabek",
        },
        pain_points: "Sudah bayar admin medsos dan endorser tapi closingan sepi. Capek mikirin konten tiap malam.",
        desires: "Punya sistem posting terjadwal yang otomatis mendatangkan chat WhatsApp pembeli setiap hari.",
        objections: "Takut kelihatan terlalu jualan (hard-selling) sehingga followers unfollow.",
        narrative: "Dinda sibuk mengurus stok kain dan pengiriman, tidak punya waktu 3 jam sehari untuk riset tren TikTok.",
        is_active: true,
        updated_at: new Date().toISOString(),
      },
    ],
    contentPlans: generateDefaultPlans(),
    briefs: {
      "plan-m1-w1-s1": {
        id: "brief-m1-w1-s1",
        plan_id: "plan-m1-w1-s1",
        hook_ref_id: "HOOK-001",
        cta_ref_id: "CTA-001",
        target_duration: "45-60 detik",
        hook_text: "Jangan mulai jualan di Instagram kalau lo belum siap dengan konsekuensi ini...",
        tension_text: "Kebanyakan orang mikir bikin akun bisnis langsung dapet orderan, padahal tanpa trust, diskon 90% pun gak bakal dilirik.",
        payoff_text: "Ini 3 pilar konten yang wajib lo bangun duluan: Edukasi problem audiens, bukti hasil nyata pelanggan, baru selipkan penawaran lembut.",
        ctv_text: "Simpan video ini buat panduan sprint konten lo minggu ini. Komentar 'SISTEM' buat dapet PDF blueprint lengkapnya.",
        caption: "Bukan algoritma yang jahat, tapi alur konten lo yang belum ada tujuannya. Cek pembahasannya di video!",
        hashtags: ["bisnisonline", "strategikonten", "umkmindonesia", "bukancumaposting"],
        production_notes: "Gunakan talking head dengan pencahayaan warm key light, b-roll saat membahas 3 pilar.",
        updated_at: new Date().toISOString(),
      },
    },
    tasks: [
      { id: "task-sprint-1", parent_id: null, title: "Batch Sprint Minggu 1", sort_order: 1, is_completed: false, is_archived: false },
      { id: "task-riset", parent_id: "task-sprint-1", title: "Senin: Riset & Validasi 7 Topik", sort_order: 1, is_completed: true, is_archived: false },
      { id: "task-script", parent_id: "task-sprint-1", title: "Selasa: Tulis 7 Naskah HTPC", sort_order: 2, is_completed: false, is_archived: false },
      { id: "task-script-1", parent_id: "task-script", title: "Script Video #1 (Engagement)", sort_order: 1, is_completed: true, is_archived: false },
      { id: "task-script-2", parent_id: "task-script", title: "Script Video #2 (Engagement)", sort_order: 2, is_completed: false, is_archived: false },
      { id: "task-shoot", parent_id: "task-sprint-1", title: "Sabtu: Batch Syuting 7 Video", sort_order: 3, is_completed: false, is_archived: false },
      { id: "task-edit", parent_id: "task-sprint-1", title: "Minggu: Editing & Penjadwalan", sort_order: 4, is_completed: false, is_archived: false },
    ],
    performanceMetrics: {
      "plan-m1-w1-s1": {
        id: "pm-1",
        user_id: null,
        content_plan_id: "plan-m1-w1-s1",
        post_date: "2026-10-01",
        content_link: "https://instagram.com/p/sample1",
        views: 24500,
        likes: 1820,
        comments: 142,
        shares: 310,
        saves: 1680,
        evaluation_date: "2026-10-15",
        learning_notes: "Hook negatif terbukti sangat efektif menaikkan watch time 3 detik pertama.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
    customHooks: [],
    customIdeas: [],
    customCtas: [],
    customTools: [],
    customGlossary: [],
  };
}

// Evaluasi Matematis Performance Tracker BCP (Formula Sheet 10)
export function evaluatePerformance(
  metric: PerformanceMetric,
  averageViews: number
): EvaluatedMetric {
  return performanceService.evaluatePerformance(metric, averageViews);
}

// In-memory fallback (Database PostgreSQL Supabase adalah sumber data utama)
let inMemoryStore: AppStoreData | null = null;

export function loadStoreData(): AppStoreData {
  if (!inMemoryStore) {
    inMemoryStore = getDefaultStoreData();
  }
  return inMemoryStore;
}

export function saveStoreData(data: AppStoreData): void {
  inMemoryStore = data;
}

