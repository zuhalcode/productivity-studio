"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useBrief } from "@/hooks/use-brief";
import { ContentPlan, ContentBrief } from "@/types/database";
import { HtpcScriptCard } from "@/components/studio/htpc-script-card";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export default function HtpcBriefPage() {
  const params = useParams();
  const planId = params.id as string;

  const { plan, brief, isLoading, isSaving, error, saveBrief } = useBrief(planId);

  const handleSaveBrief = async (
    updatedBrief: ContentBrief,
    newStatus?: ContentPlan["status"]
  ) => {
    await saveBrief(updatedBrief, newStatus);
  };

  if (isLoading || !plan || !brief) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Link
            href="/planner"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Kalender 3-3-1</span>
          </Link>
          <div className="p-12 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <p className="text-xs text-[var(--text-muted)] font-semibold">
              Memuat naskah brief dari Supabase...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Back Link */}
        <Link
          href="/planner"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Kalender 3-3-1</span>
        </Link>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-xs text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Script Editor Card */}
        <HtpcScriptCard
          plan={plan}
          brief={brief}
          onSaveBrief={handleSaveBrief}
          isSaving={isSaving}
        />
      </div>
    </AppShell>
  );
}
