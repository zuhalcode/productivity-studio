"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { usePlanner } from "@/hooks/use-planner";
import { ContentPlan } from "@/types/database";
import { FunnelBadge } from "@/components/ui/funnel-badge";
import {
  CalendarDays,
  ArrowRight,
  Edit2,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function EditorialPlannerPage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [editingPlan, setEditingPlan] = useState<ContentPlan | null>(null);

  const { plans, isLoading, isSaving, error, updatePlan } = usePlanner();

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      await updatePlan(editingPlan.id, editingPlan);
      setEditingPlan(null);
    } catch {
      // Error handled by hook
    }
  };

  // Filter plans based on month & week
  const filteredPlans = plans
    .filter((p) => p.month_index === selectedMonth && p.week_index === selectedWeek)
    .sort((a, b) => a.slot_index - b.slot_index);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Modul 2: Editorial Planner 3-3-1</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              Kalender Editorial Konten (336 Slot)
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Penegakan rasio mingguan BCP: 3 Konten Engagement (TOFU), 3 Otoritas (MOFU), dan 1 Penjualan (BOFU).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs font-bold text-[var(--text-secondary)]">
              {plans.filter((p) => p.status === "Done").length} / {plans.length} Naskah Siap
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

        {/* Month & Week Filters */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] space-y-4 shadow-xs">
          {/* Month Tabs (1 s/d 12) */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[var(--text-secondary)]">Pilih Bulan:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMonth(m)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl shrink-0 transition-all ${
                    selectedMonth === m
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface)] border border-[var(--border-subtle)]"
                  }`}
                >
                  Bulan {m}
                </button>
              ))}
            </div>
          </div>

          {/* Week Tabs (1 s/d 4) */}
          <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
            <span className="text-xs font-bold text-[var(--text-secondary)]">Pilih Minggu:</span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setSelectedWeek(w)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    selectedWeek === w
                      ? "bg-[var(--surface-elevated)] text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-500 shadow-xs"
                      : "bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  }`}
                >
                  Minggu {w} (Sprint 7 Hari)
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3-3-1 Cadence Summary Banner */}
        <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold text-blue-900 dark:text-blue-200">
              Disiplin Rasio Mingguan BCP:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold">
                3 Engagement
              </span>
              <span className="text-[var(--text-muted)]">+</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 font-bold">
                3 Authority
              </span>
              <span className="text-[var(--text-muted)]">+</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 font-bold">
                1 Sales
              </span>
            </div>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-medium">
            Mencegah fatigue audiens & mempertahankan trust akun.
          </span>
        </div>

        {/* Loading Spinner */}
        {isLoading && plans.length === 0 && (
          <div className="flex items-center justify-center p-12">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Memuat kalender konten dari Supabase...</span>
            </div>
          </div>
        )}

        {/* 7 Content Slots Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Jadwal Konten Bulan {selectedMonth} &bull; Minggu {selectedWeek}
            </h2>
            <span className="text-xs text-[var(--text-muted)] font-semibold">
              {filteredPlans.length} Slot Terjadwal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPlans.map((plan) => {
              const isEngagement = plan.funnel_layer === "Engagement";
              const isAuthority = plan.funnel_layer === "Authority";

              return (
                <div
                  key={plan.id}
                  className={`p-4 sm:p-5 rounded-2xl border bg-[var(--surface)] shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                    isEngagement
                      ? "border-emerald-200 dark:border-emerald-950/80 hover:border-emerald-400"
                      : isAuthority
                      ? "border-blue-200 dark:border-blue-950/80 hover:border-blue-400"
                      : "border-amber-200 dark:border-amber-950/80 hover:border-amber-400"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Card Top Meta */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-[var(--text-muted)]">
                        Slot #{plan.slot_index}
                      </span>
                      <FunnelBadge layer={plan.funnel_layer} />
                    </div>

                    {/* Topic Title */}
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] line-clamp-2 leading-snug">
                        {plan.topic}
                      </h3>
                      {plan.scheduled_date && (
                        <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
                          Tayang: {plan.scheduled_date}
                        </span>
                      )}
                    </div>

                    {/* Format & Platform Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        {plan.format}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        {plan.platform}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          plan.status === "Done"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                            : plan.status === "On Process"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300"
                            : plan.status === "Posted"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {plan.status}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)]">
                    <button
                      type="button"
                      onClick={() => setEditingPlan(plan)}
                      className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
                      title="Edit Slot Rencana"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      href={`/planner/brief/${plan.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <span>Tulis HTPC</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Quick Edit Slot Plan */}
        {editingPlan && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          >
            <form
              onSubmit={handleSaveModal}
              className="w-full max-w-md p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Edit Rencana Konten (Slot #{editingPlan.slot_index})
                </h3>
                <FunnelBadge layer={editingPlan.funnel_layer} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Topik / Judul Sementara
                </label>
                <input
                  type="text"
                  required
                  value={editingPlan.topic}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, topic: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Tanggal Tayang (Opsional)
                </label>
                <input
                  type="date"
                  value={editingPlan.scheduled_date || ""}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      scheduled_date: e.target.value || null,
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Format Konten
                  </label>
                  <select
                    value={editingPlan.format}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        format: e.target.value as ContentPlan["format"],
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                  >
                    <option value="Reels">Reels</option>
                    <option value="Carousel">Carousel</option>
                    <option value="Single Image">Single Image</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Status
                  </label>
                  <select
                    value={editingPlan.status}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        status: e.target.value as ContentPlan["status"],
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                  >
                    <option value="Ide">Ide</option>
                    <option value="On Process">On Process</option>
                    <option value="Done">Done</option>
                    <option value="Posted">Posted</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}
