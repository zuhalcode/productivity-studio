import { personaRepository } from "@/lib/repositories/persona.repository";
import { AudiencePersona } from "@/types/database";
import { AppError } from "@/lib/supabase/errors";

export const DEFAULT_AUDIENCE_PERSONA: Omit<AudiencePersona, "id" | "created_at" | "updated_at"> = {
  user_id: null,
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
};

export class PersonaService {
  /**
   * Mengambil semua persona audiens aktif. Jika belum ada, otomatis inisialisasi default.
   */
  async getPersonas(): Promise<AudiencePersona[]> {
    const list = await personaRepository.getPersonas();
    if (list.length > 0) {
      return list;
    }

    // Inisialisasi awal ke Supabase
    const initialId = crypto.randomUUID();
    const created = await personaRepository.createPersona({
      id: initialId,
      ...DEFAULT_AUDIENCE_PERSONA,
    });
    return [created];
  }

  /**
   * Membuat persona audiens baru.
   */
  async createPersona(
    personaData: Omit<AudiencePersona, "id" | "created_at" | "updated_at">
  ): Promise<AudiencePersona> {
    if (!personaData.persona_name.trim()) {
      throw new AppError("Nama Persona audiens wajib diisi.", "VALIDATION_ERROR");
    }
    if (!personaData.pain_points.trim()) {
      throw new AppError("Pain points audiens wajib diisi.", "VALIDATION_ERROR");
    }
    if (!personaData.desires.trim()) {
      throw new AppError("Desires audiens wajib diisi.", "VALIDATION_ERROR");
    }
    if (!personaData.objections.trim()) {
      throw new AppError("Objections audiens wajib diisi.", "VALIDATION_ERROR");
    }

    return await personaRepository.createPersona({
      id: crypto.randomUUID(),
      ...personaData,
    });
  }

  /**
   * Memperbarui persona audiens yang ada.
   */
  async updatePersona(id: string, updates: Partial<AudiencePersona>): Promise<AudiencePersona> {
    if (updates.persona_name !== undefined && !updates.persona_name.trim()) {
      throw new AppError("Nama Persona audiens tidak boleh kosong.", "VALIDATION_ERROR");
    }

    return await personaRepository.updatePersona(id, updates);
  }

  /**
   * Menghapus persona audiens, dengan validasi minimal 1 persona harus tersisa.
   */
  async deletePersona(id: string, currentTotal: number): Promise<void> {
    if (currentTotal <= 1) {
      throw new AppError("Minimal harus ada 1 profil persona audiens di dalam sistem.", "BUSINESS_RULE_VIOLATION");
    }

    await personaRepository.deletePersona(id);
  }
}

export const personaService = new PersonaService();
