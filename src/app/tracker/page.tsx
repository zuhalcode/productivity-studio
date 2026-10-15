"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { usePerformance } from "@/hooks/use-performance";
import { usePlanner } from "@/hooks/use-planner";
import { PerformanceMetric, ContentPlan } from "@/types/database";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { FunnelBadge } from "@/components/ui/funnel-badge";
import {
  BarChart3,
  Edit2,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function PerformanceTrackerPage() {
  const { plans, isLoading: isPlannerLoading } = usePlanner();
  const {
    metricsMap,
    avgViews,
    winningCount,
    avgSaveRate,
    isLoading: isPerformanceLoading,
    isSaving,
    error,
    saveMetric,
    evaluateMetric,
  } = usePerformance();

  const [editingMetric, setEditingMetric] = useState<PerformanceMetric | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMetric) return;

    try {
      await saveMetric(editingMetric);
      setEditingMetric(null);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2000);
    } catch {
      // Error handled by hook
    }
  };

  const isLoading = isPlannerLoading || isPerformanceLoading;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Modul 5: Performance Tracker & Verdict Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              Evaluasi Konten & Formula Verdict
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Kalkulasi otomatis rasio simpan (Save Rate %) pasca-tayang 14 hari. Tentukan konten pemenang yang layak direplikasi di Supabase.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {saveToast && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ✓ Metrik tersimpan di Supabase!
              </span>
            )}
            <div className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs font-bold text-[var(--text-secondary)]">
              Rata-rata: {Math.round(avgViews).toLocaleString()} Views
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-xs text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 3 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs space-y-1">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Konten Berstatus WINNING
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {winningCount}
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Wajib Direplikasi
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Views &gt; Rata-rata &amp; Save Rate &gt; 5%
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs space-y-1">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Rata-Rata Rasio Simpan (Save Rate)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                {avgSaveRate}%
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                Metrik Kesehatan
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Standar BCP: Minimal 3% untuk lolos kurasi
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs space-y-1">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Total Konten Terjadwal
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[var(--text-primary)]">
                {plans.length}
              </span>
              <span className="text-xs font-bold text-[var(--text-muted)]">
                Slot Kalender
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              {Object.keys(metricsMap).length} Konten telah diinput analitik
            </p>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && plans.length === 0 && (
          <div className="flex items-center justify-center p-12">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span>Memuat data evaluasi dari Supabase...</span>
            </div>
          </div>
        )}

        {/* List Content to Track */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Daftar Evaluasi Kinerja Konten
            </h2>
            <span className="text-xs text-[var(--text-muted)] font-semibold">
              Urutan berdasarkan slot tayang
            </span>
          </div>

          <div className="space-y-3">
            {plans.map((plan: ContentPlan) => {
              const metric = metricsMap[plan.id];
              const evaluated = metric ? evaluateMetric(metric, avgViews) : null;

              return (
                <div
                  key={plan.id}
                  className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all hover:border-[var(--border-strong)]"
                >
                  {/* Left: Content Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-[var(--text-muted)]">
                        Bulan {plan.month_index} &bull; M{plan.week_index} &bull; #{plan.slot_index}
                      </span>
                      <FunnelBadge layer={plan.funnel_layer} />
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        {plan.format}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
                      {plan.topic}
                    </h3>

                    {metric?.learning_notes && (
                      <p className="text-xs text-[var(--text-muted)] italic truncate">
                        &ldquo;{metric.learning_notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Middle: Calculated Metrics */}
                  <div className="flex items-center gap-4 sm:gap-6 flex-wrap shrink-0">
                    {evaluated ? (
                      <>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold text-[var(--text-muted)] block">
                            Tayangan
                          </span>
                          <span className="text-xs font-bold text-[var(--text-primary)]">
                            {evaluated.views.toLocaleString()}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold text-[var(--text-muted)] block">
                            Save Rate %
                          </span>
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {evaluated.save_rate}%
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold text-[var(--text-muted)] block">
                            Vonis BCP
                          </span>
                          <VerdictBadge verdict={evaluated.verdict} />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Belum dievaluasi pasca tayang</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingMetric(
                          metric || {
                            id: crypto.randomUUID(),
                            user_id: null,
                            content_plan_id: plan.id,
                            post_date:
                              plan.scheduled_date ||
                              new Date().toISOString().split("T")[0],
                            content_link: null,
                            views: 0,
                            likes: 0,
                            comments: 0,
                            shares: 0,
                            saves: 0,
                            evaluation_date: null,
                            learning_notes: null,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                          }
                        )
                      }
                      className="px-3.5 py-2 text-xs font-bold rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:bg-[var(--surface)] text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{metric ? "Edit Metrik" : "Input Metrik"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Input / Edit Metrics Modal */}
        {editingMetric && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          >
            <form
              onSubmit={handleSaveForm}
              className="w-full max-w-lg p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            >
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Input Data Analitik Pasca-Tayang
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Tanggal Posting
                  </label>
                  <input
                    type="date"
                    required
                    value={editingMetric.post_date}
                    onChange={(e) =>
                      setEditingMetric({ ...editingMetric, post_date: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Views / Tayangan
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editingMetric.views}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        views: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                    Likes
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingMetric.likes}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        likes: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                    Comments
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingMetric.comments}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        comments: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                    Shares
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingMetric.shares}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        shares: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                    Saves (Kunci BCP)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingMetric.saves}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        saves: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-blue-500 bg-[var(--surface-elevated)] text-[var(--text-primary)] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Link / URL Konten Tayang (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/p/..."
                  value={editingMetric.content_link || ""}
                  onChange={(e) =>
                    setEditingMetric({ ...editingMetric, content_link: e.target.value || null })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Catatan Pembelajaran (Kenapa Perform / Underperform?)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Hook negatif di 3 detik pertama terbukti menghasilkan save rate 6.8%..."
                  value={editingMetric.learning_notes || ""}
                  onChange={(e) =>
                    setEditingMetric({ ...editingMetric, learning_notes: e.target.value || null })
                  }
                  className="w-full p-2.5 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMetric(null)}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white shadow-xs"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? "Menyimpan..." : "Simpan & Hitung Vonis"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}
