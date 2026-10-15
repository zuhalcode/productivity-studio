"use client";

import React, { useState } from "react";
import { ContentBrief, ContentPlan } from "@/types/database";
import { DrawerSelector } from "@/components/studio/drawer-selector";
import { FunnelBadge } from "@/components/ui/funnel-badge";
import {
  Flame,
  MousePointerClick,
  Save,
  CheckCircle2,
  Clock,
  Hash,
  AlertCircle,
  FileEdit,
  Loader2,
} from "lucide-react";

interface HtpcScriptCardProps {
  plan: ContentPlan;
  brief: ContentBrief;
  onSaveBrief: (updatedBrief: ContentBrief, newStatus?: ContentPlan["status"]) => void;
  isSaving?: boolean;
}

export function HtpcScriptCard({ plan, brief, onSaveBrief, isSaving = false }: HtpcScriptCardProps) {
  const [formData, setFormData] = useState<ContentBrief>({ ...brief });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"hooks" | "cta">("hooks");
  const [savedToast, setSavedToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Hitung perkiraan durasi (asumsi pembicara rata-rata berbicara 2.5 kata per detik)
  const fullText = `${formData.hook_text} ${formData.tension_text} ${formData.payoff_text} ${formData.ctv_text}`.trim();
  const wordCount = fullText ? fullText.split(/\s+/).length : 0;
  const estimatedSeconds = Math.round(wordCount / 2.5);

  const handleSave = (markDone = false) => {
    setErrorMessage(null);

    // Validasi 4 blok terisi jika ingin mark Done
    if (markDone) {
      if (!formData.hook_text.trim()) {
        setErrorMessage("Blok 1 (Hook 3 Detik) wajib terisi sebelum menandai Done!");
        return;
      }
      if (!formData.tension_text.trim()) {
        setErrorMessage("Blok 2 (Tension / Masalah) wajib terisi sebelum menandai Done!");
        return;
      }
      if (!formData.payoff_text.trim()) {
        setErrorMessage("Blok 3 (Payoff / Daging Solusi) wajib terisi sebelum menandai Done!");
        return;
      }
      if (!formData.ctv_text.trim()) {
        setErrorMessage("Blok 4 (Call to Value) wajib terisi sebelum menandai Done!");
        return;
      }
    }

    onSaveBrief(
      { ...formData, updated_at: new Date().toISOString() },
      markDone ? "Done" : "On Process"
    );

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Script Header Bar */}
      <div className="p-4 sm:p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <FunnelBadge layer={plan.funnel_layer} />
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
              Bulan {plan.month_index} · Minggu {plan.week_index} · Slot #{plan.slot_index}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[var(--text-primary)]">
              {plan.format} · {plan.platform}
            </span>
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{plan.topic}</h2>
        </div>

        {/* Word count & Save Actions */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs text-[var(--text-muted)]">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>
              {wordCount} kata (~{estimatedSeconds}s)
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:bg-[var(--surface)] disabled:opacity-50 text-[var(--text-primary)] transition-colors"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> : <Save className="w-4 h-4 text-[var(--text-secondary)]" />}
            <span>{isSaving ? "Menyimpan..." : "Simpan Draf"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-xs transition-colors"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Tandai Selesai (Done)</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Toast Notifikasi Sukses */}
      {savedToast && (
        <div className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Naskah HTPC berhasil disimpan!</span>
        </div>
      )}

      {/* 4 Blok Naskah HTPC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* BLOK 1: HOOK (3 DETIK PERTAMA) */}
        <div className="p-4 sm:p-5 rounded-2xl border border-orange-200 dark:border-orange-900/50 bg-[var(--surface)] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Blok 1: Hook (3 Detik Pertama)
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Hentikan jempol audiens sebelum mereka scroll lewat.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setDrawerTab("hooks");
                setDrawerOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 hover:bg-orange-100 transition-colors"
            >
              <span>Buka Hook Bank</span>
            </button>
          </div>

          <textarea
            rows={3}
            value={formData.hook_text}
            onChange={(e) => setFormData({ ...formData, hook_text: e.target.value })}
            placeholder="Ketik kalimat pembuka yang mengejutkan, memicu rasa penasaran, atau menantang mitos..."
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-orange-500 leading-relaxed"
          />
        </div>

        {/* BLOK 2: TENSION (MASALAH & FRUSTRASI) */}
        <div className="p-4 sm:p-5 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-[var(--surface)] space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Blok 2: Tension (Gali Masalah Nyata)
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Bongkar rasa frustrasi dan hambatan terdalam audiens avatar Anda.
              </p>
            </div>
          </div>

          <textarea
            rows={3}
            value={formData.tension_text}
            onChange={(e) => setFormData({ ...formData, tension_text: e.target.value })}
            placeholder="Jelaskan kenapa cara lama yang mereka lakukan selalu gagal, dan apa dampak buruknya jika dibiarkan..."
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
          />
        </div>

        {/* BLOK 3: PAYOFF (DAGING SOLUSI / STEP-BY-STEP) */}
        <div className="p-4 sm:p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-[var(--surface)] space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FileEdit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Blok 3: Payoff (Daging Solusi)
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Beri daging langkah praktis 1-2-3 yang bisa langsung dipraktekkan.
              </p>
            </div>
          </div>

          <textarea
            rows={4}
            value={formData.payoff_text}
            onChange={(e) => setFormData({ ...formData, payoff_text: e.target.value })}
            placeholder="Uraikan solusi konkret: Langkah 1, Langkah 2, Langkah 3. Singkat, padat, bernilai tinggi..."
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
        </div>

        {/* BLOK 4: CALL TO VALUE (CTV) */}
        <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-[var(--surface)] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <MousePointerClick className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Blok 4: Call to Value (CTV)
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Tutup dengan ajakan bernilai (Bukan hard-selling kasar).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setDrawerTab("cta");
                setDrawerOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
            >
              <span>Buka CTV Bank</span>
            </button>
          </div>

          <textarea
            rows={4}
            value={formData.ctv_text}
            onChange={(e) => setFormData({ ...formData, ctv_text: e.target.value })}
            placeholder="Ajak audiens simpan video ini atau berikan kata kunci lead magnet (misal: 'Simpan buat panduan syuting lo')..."
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
          />
        </div>
      </div>

      {/* Production Notes & Caption */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Caption & Hashtags */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
            <Hash className="w-4 h-4" />
            <span>Caption & Hashtags (Maksimal 5)</span>
          </div>

          <textarea
            rows={3}
            value={formData.caption || ""}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            placeholder="Tulis caption pelengkap naskah..."
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div>
            <label className="block text-[11px] text-[var(--text-muted)] mb-1">
              Tagar (Pisahkan dengan koma atau spasi)
            </label>
            <input
              type="text"
              value={formData.hashtags.join(", ")}
              onChange={(e) => {
                const tags = e.target.value
                  .split(/[,\s]+/)
                  .map((t) => t.replace("#", "").trim())
                  .filter(Boolean)
                  .slice(0, 5);
                setFormData({ ...formData, hashtags: tags });
              }}
              placeholder="bisnis, konten, edukasi"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Catatan Produksi (Lighting, B-roll, Angle) */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
            <FileEdit className="w-4 h-4" />
            <span>Catatan Teknis Produksi (Lighting / B-roll / Audio)</span>
          </div>

          <textarea
            rows={5}
            value={formData.production_notes || ""}
            onChange={(e) => setFormData({ ...formData, production_notes: e.target.value })}
            placeholder="Contoh: Buka dengan angle low-shot, ganti musik di detik ke-15, tampilkan screencast dashboard..."
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Slide-over Drawer Selector */}
      <DrawerSelector
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeTab={drawerTab}
        onSelectHook={(text, id) => {
          setFormData({ ...formData, hook_text: text, hook_ref_id: id });
        }}
        onSelectCta={(text, id) => {
          setFormData({ ...formData, ctv_text: text, cta_ref_id: id });
        }}
      />
    </div>
  );
}
