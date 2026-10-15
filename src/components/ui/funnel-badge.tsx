import React from "react";

export type FunnelLayer = "Engagement" | "Authority" | "Sales";

interface FunnelBadgeProps {
  layer: FunnelLayer;
  className?: string;
  size?: "sm" | "md";
}

export function FunnelBadge({ layer, className = "", size = "md" }: FunnelBadgeProps) {
  const configs: Record<
    FunnelLayer,
    { label: string; bg: string; text: string; border: string; desc: string }
  > = {
    Engagement: {
      label: "Engagement",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200 dark:border-emerald-800",
      desc: "Top of Funnel (Viral & Relatable)",
    },
    Authority: {
      label: "Authority",
      bg: "bg-blue-50 dark:bg-blue-950/50",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800",
      desc: "Middle of Funnel (Edukasi & Solusi)",
    },
    Sales: {
      label: "Sales",
      bg: "bg-amber-50 dark:bg-amber-950/50",
      text: "text-amber-800 dark:text-amber-300",
      border: "border-amber-200 dark:border-amber-800",
      desc: "Bottom of Funnel (Grand Slam Offer)",
    },
  };

  const c = configs[layer] || configs.Engagement;
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      title={c.desc}
      className={`inline-flex items-center font-semibold rounded-md border ${c.bg} ${c.text} ${c.border} ${sizeClasses} ${className}`}
    >
      {c.label}
    </span>
  );
}
