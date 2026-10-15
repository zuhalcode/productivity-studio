import React from "react";
import { ContentVerdict } from "@/lib/store";

interface VerdictBadgeProps {
  verdict: ContentVerdict;
  className?: string;
}

export function VerdictBadge({ verdict, className = "" }: VerdictBadgeProps) {
  const configs: Record<
    ContentVerdict,
    { label: string; icon: string; bg: string; text: string; border: string; desc: string }
  > = {
    WINNING: {
      label: "WINNING",
      icon: "🏆",
      bg: "bg-amber-100 dark:bg-amber-950/60",
      text: "text-amber-900 dark:text-amber-200",
      border: "border-amber-300 dark:border-amber-700",
      desc: "Views > Rata-rata dan Save Rate > 5%. Aset Evergreen terbukti!",
    },
    GOOD: {
      label: "GOOD",
      icon: "✅",
      bg: "bg-emerald-100 dark:bg-emerald-950/60",
      text: "text-emerald-900 dark:text-emerald-200",
      border: "border-emerald-300 dark:border-emerald-700",
      desc: "Views > Rata-rata. Performa di atas rata-rata.",
    },
    OPTIMASI: {
      label: "OPTIMASI",
      icon: "🔄",
      bg: "bg-blue-100 dark:bg-blue-950/60",
      text: "text-blue-900 dark:text-blue-200",
      border: "border-blue-300 dark:border-blue-700",
      desc: "Performa moderat. Perbaiki Hook 3 detik atau CTV.",
    },
    STOP: {
      label: "STOP",
      icon: "🛑",
      bg: "bg-rose-100 dark:bg-rose-950/60",
      text: "text-rose-900 dark:text-rose-200",
      border: "border-rose-300 dark:border-rose-700",
      desc: "Views < 50% rata-rata. Jangan ulangi format ini.",
    },
    PENDING: {
      label: "EVALUASI H+14",
      icon: "⏳",
      bg: "bg-zinc-100 dark:bg-zinc-800",
      text: "text-zinc-700 dark:text-zinc-300",
      border: "border-zinc-300 dark:border-zinc-700",
      desc: "Menunggu masa tayang 14 hari selesai.",
    },
  };

  const c = configs[verdict] || configs.PENDING;

  return (
    <span
      title={c.desc}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border ${c.bg} ${c.text} ${c.border} ${className}`}
    >
      <span>{c.icon}</span>
      <span>{c.label}</span>
    </span>
  );
}
