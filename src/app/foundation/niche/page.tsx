"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useNiche } from "@/hooks/use-niche";
import { NicheProfile } from "@/types/database";
import { Target, Sparkles, Copy, Check, Save, Heart, Award, Users, DollarSign, Loader2, AlertCircle } from "lucide-react";

export default function NicheFoundationPage() {
  const { profile, isLoading, isSaving, error, saveProfile } = useNiche();
  const [formData, setFormData] = useState<NicheProfile | null>(null);
  const [copiedBio, setCopiedBio] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  if (isLoading || !formData) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Memuat data Niche Profile dari Supabase...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBio(key);
    setTimeout(() => setCopiedBio(null), 2500);
  };

  const handleSave = async () => {
    try {
      await saveProfile(formData);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch {
      // Error is caught and surfaced by useNiche()
    }
  };

  const updateIkigai = (
    field: "love_topics" | "skill_topics" | "market_needs" | "monetizable",
    valueStr: string
  ) => {
    const arr = valueStr.split("\n").filter(Boolean);
    setFormData({
      ...formData,
      ikigai_data: {
        ...formData.ikigai_data,
        [field]: arr,
      },
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              <Target className="w-3.5 h-3.5" />
              <span>Modul 1: Strategi & Positioning</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              Niche Sweet Spot & Bio Generator
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Formulasi 4 Kuadran Ikigai BCP (Suka, Kuasai, Butuh, Cuan) untuk mengunci keunikan pasar.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {saveToast && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                ✓ Profil tersimpan di Supabase!
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs transition-colors"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? "Menyimpan..." : "Simpan Profil"}</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-xs text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Kuadran Ikigai Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kuadran 1: Yang Disukai */}
          <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-[var(--surface)] space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  1. Yang Lo Sukai (Passion)
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Topik yang rela lo bahas berjam-jam tanpa dibayar.
                </p>
              </div>
            </div>
            <textarea
              rows={4}
              value={formData.ikigai_data.love_topics.join("\n")}
              onChange={(e) => updateIkigai("love_topics", e.target.value)}
              placeholder="Contoh:&#10;Content Strategy&#10;Digital Product&#10;Personal Branding"
              className="w-full p-3 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
          </div>

          {/* Kuadran 2: Yang Dikuasai */}
          <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-[var(--surface)] space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  2. Yang Lo Kuasai (Skill)
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Skill teknis, pengalaman nyata, atau sertifikasi yang lo punya.
                </p>
              </div>
            </div>
            <textarea
              rows={4}
              value={formData.ikigai_data.skill_topics.join("\n")}
              onChange={(e) => updateIkigai("skill_topics", e.target.value)}
              placeholder="Contoh:&#10;Copywriting&#10;Video Editing&#10;Framework Design"
              className="w-full p-3 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Kuadran 3: Kebutuhan Pasar */}
          <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-[var(--surface)] space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  3. Yang Pasar Butuhkan (Demand)
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Masalah nyata audiens yang sering mereka keluhkan di medsos.
                </p>
              </div>
            </div>
            <textarea
              rows={4}
              value={formData.ikigai_data.market_needs.join("\n")}
              onChange={(e) => updateIkigai("market_needs", e.target.value)}
              placeholder="Contoh:&#10;UMKM butuh omset dari medsos&#10;Kreator frustrasi boncos energi"
              className="w-full p-3 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          {/* Kuadran 4: Peluang Monetisasi */}
          <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-[var(--surface)] space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  4. Yang Bisa Dimonetisasi (Offer)
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Produk atau jasa yang siap dibeli oleh pasar sasaran.
                </p>
              </div>
            </div>
            <textarea
              rows={4}
              value={formData.ikigai_data.monetizable.join("\n")}
              onChange={(e) => updateIkigai("monetizable", e.target.value)}
              placeholder="Contoh:&#10;Konsultasi 1-on-1&#10;Template Notion/Worksheet&#10;Masterclass"
              className="w-full p-3 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </div>

        {/* Niche Sweet Spot & Core Value */}
        <div className="p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Perumusan Niche Sweet Spot & Core Value
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Sweet Spot Niche (Irisan 4 Kuadran):
              </label>
              <input
                type="text"
                value={formData.sweet_spot || ""}
                onChange={(e) => setFormData({ ...formData, sweet_spot: e.target.value })}
                placeholder="Contoh: Sistem Produksi Konten Anti-Burnout Berorientasi Konversi untuk Solopreneur"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Niche Final (Positioning Utama Akun):
              </label>
              <input
                type="text"
                value={formData.niche_final}
                onChange={(e) => setFormData({ ...formData, niche_final: e.target.value })}
                placeholder="Contoh: Content Operating System untuk Founder & UMKM yang ingin cuan tanpa harus jadi full-time influencer"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Core Value (Filosofi & Transformasi):
              </label>
              <textarea
                rows={2}
                value={formData.core_value}
                onChange={(e) => setFormData({ ...formData, core_value: e.target.value })}
                placeholder="Contoh: Bukan Cuma Posting — Ubah views semu menjadi aset penjualan berkelanjutan."
                className="w-full p-3 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>
        </div>

        {/* Generator Formula Bio Medsos */}
        <div className="p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] space-y-4 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Generator 3 Formula Bio Instagram Teruji
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Pilih formula yang paling merefleksikan otoritas akun Anda untuk dipasang di profil.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Opsi A: Problem - Solution */}
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  Formula A: Problem &rarr; Solution &rarr; CTA
                </span>
                <textarea
                  rows={4}
                  value={formData.bio_ig_a || ""}
                  onChange={(e) => setFormData({ ...formData, bio_ig_a: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-primary)] resize-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleCopy(formData.bio_ig_a || "", "bio_a")}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)] transition-colors"
              >
                {copiedBio === "bio_a" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBio === "bio_a" ? "Tersalin!" : "Salin Bio"}</span>
              </button>
            </div>

            {/* Opsi B: Proof - Framework */}
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Formula B: Bukti &rarr; Framework &rarr; Lead Magnet
                </span>
                <textarea
                  rows={4}
                  value={formData.bio_ig_b || ""}
                  onChange={(e) => setFormData({ ...formData, bio_ig_b: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-primary)] resize-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleCopy(formData.bio_ig_b || "", "bio_b")}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)] transition-colors"
              >
                {copiedBio === "bio_b" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBio === "bio_b" ? "Tersalin!" : "Salin Bio"}</span>
              </button>
            </div>

            {/* Opsi C: Authority - Metric */}
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  Formula C: Kredibilitas &rarr; Metrik &rarr; Penawaran
                </span>
                <textarea
                  rows={4}
                  value={formData.bio_ig_c || ""}
                  onChange={(e) => setFormData({ ...formData, bio_ig_c: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-primary)] resize-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleCopy(formData.bio_ig_c || "", "bio_c")}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)] transition-colors"
              >
                {copiedBio === "bio_c" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBio === "bio_c" ? "Tersalin!" : "Salin Bio"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
