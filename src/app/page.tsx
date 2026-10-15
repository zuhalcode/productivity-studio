"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useNiche } from "@/hooks/use-niche";
import { usePlanner } from "@/hooks/use-planner";
import { useTasks } from "@/hooks/use-tasks";
import { usePerformance } from "@/hooks/use-performance";
import { FunnelBadge } from "@/components/ui/funnel-badge";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  CalendarDays,
  CheckSquare,
  BarChart3,
  ArrowRight,
  Sparkles,
  BookOpen,
  Target,
  Loader2,
} from "lucide-react";

export default function DashboardOverviewPage() {
  const { profile, isLoading: isNicheLoading } = useNiche();
  const { plans, isLoading: isPlannerLoading } = usePlanner();
  const { tasks, taskTree, isLoading: isTaskLoading } = useTasks();
  const { winningCount, isLoading: isPerfLoading } = usePerformance();

  useEffect(() => {
    // Bersihkan seluruh sisa data legacy localStorage karena database Supabase sudah aktif penuh
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("productivity_studio_data_v1");
        localStorage.removeItem("productivity_studio_migrated_at");
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("productivity_studio_data_")) {
            localStorage.removeItem(key);
          }
        });
      } catch {
        // Abaikan jika ada batasan security browser
      }
    }
  }, []);

  const isLoading = isNicheLoading || isPlannerLoading || isTaskLoading || isPerfLoading;

  if (isLoading && !profile && plans.length === 0 && tasks.length === 0) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center gap-2.5 text-xs text-[var(--text-muted)] font-semibold">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Menghubungkan ke Supabase PostgreSQL...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  // Hitung metrik agregat
  const sprintTask = taskTree[0];
  const sprintProgress = sprintTask ? sprintTask.progress : 0;

  const totalPlans = plans.length;
  const readyToShootPlans = plans.filter((p) => p.status === "Done");
  const inProgressPlans = plans.filter((p) => p.status === "On Process");

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome Hero Card */}
        <div className="p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bukan Cuma Posting Methodology &bull; Supabase Connected</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              Selamat Datang di Productivity Studio
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Sistem operasi bisnis kreator: Mengunci positioning Ikigai, disiplin sprint mingguan 3-3-1, dan mengevaluasi konten pemenang berbasis rasio simpan.
            </p>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-muted)]">Batch Sprint</span>
              <CheckSquare className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                {sprintProgress}%
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Pohon Tugas
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] truncate">
              {sprintTask?.title || "Sprint Mingguan"}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-muted)]">Kalender Konten</span>
              <CalendarDays className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                {totalPlans}
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Slot Terjadwal
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              {readyToShootPlans.length} Siap Syuting &bull; {inProgressPlans.length} Proses
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-muted)]">Konten Winning</span>
              <BarChart3 className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                {winningCount}
              </span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Formula Replikasi
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Save Rate &gt; 5% pasca tayang
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-muted)]">Repositori Aset</span>
              <BookOpen className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                385
              </span>
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                Template Terkurasi
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] truncate">
              105 Hook, 104 Ide, 45 CTA, 31 Tools
            </p>
          </div>
        </div>

        {/* 2-Column Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: 3-3-1 Content Plans */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Jadwal Produksi Konten Bulan 1
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Disiplin piramida funnel: 3 Engagement, 3 Authority, 1 Sales.
                </p>
              </div>
              <Link
                href="/planner"
                className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>Lihat Semua 336 Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {plans.slice(0, 5).map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] flex items-center justify-between gap-4 hover:border-[var(--border-strong)] transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold text-[var(--text-muted)] shrink-0">
                      #{plan.slot_index}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                        {plan.topic}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--text-muted)]">
                        <span>{plan.format}</span>
                        <span>&bull;</span>
                        <span>{plan.platform}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <FunnelBadge layer={plan.funnel_layer} />
                    <Link
                      href={`/planner/brief/${plan.id}`}
                      className="px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] transition-colors"
                    >
                      Naskah HTPC
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kolom Kanan: Positioning & Todo Snapshot */}
          <div className="space-y-4">
            {/* Positioning Niche Snapshot */}
            <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span>Positioning &amp; Sweet Spot</span>
                </div>
                <Link
                  href="/foundation/niche"
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Edit
                </Link>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed">
                <span className="font-bold text-[var(--text-primary)] block mb-1">
                  Sweet Spot Niche:
                </span>
                {profile?.sweet_spot || "Sistem Produksi Konten Anti-Burnout Berorientasi Konversi untuk Solopreneur"}
              </div>

              <div className="text-xs text-[var(--text-muted)] italic">
                &ldquo;{profile?.core_value || "Bukan Cuma Posting — Ubah views semu menjadi aset penjualan berkelanjutan."}&rdquo;
              </div>
            </div>

            {/* Todo Sprint Snapshot */}
            <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>Sprint Todo Engine</span>
                </div>
                <Link
                  href="/tasks"
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Buka Pohon Todo
                </Link>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                <CircularProgress progress={sprintProgress} size={36} strokeWidth={3} />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {sprintTask?.title || "Batch Sprint"}
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {sprintProgress}% Selesai (Rata-rata cabang langsung)
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                {sprintTask?.children?.slice(0, 4).map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors"
                  >
                    <span
                      className={`truncate ${
                        sub.effective_completed ? "line-through text-[var(--text-muted)]" : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {sub.title}
                    </span>
                    <span className="font-semibold text-[11px] text-[var(--text-muted)] shrink-0 ml-2">
                      {sub.progress}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
