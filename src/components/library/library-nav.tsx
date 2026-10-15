"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Lightbulb, MousePointerClick, Wrench, BookA } from "lucide-react";

const TABS = [
  { label: "Hook Bank (105)", href: "/library/hooks", icon: Flame, color: "text-orange-500" },
  { label: "Idea Bank (104)", href: "/library/ideas", icon: Lightbulb, color: "text-amber-500" },
  { label: "CTA-CTV (45)", href: "/library/cta", icon: MousePointerClick, color: "text-emerald-500" },
  { label: "Tools Ngonten (31)", href: "/library/tools", icon: Wrench, color: "text-blue-500" },
  { label: "Kamus Istilah (100)", href: "/library/glossary", icon: BookA, color: "text-purple-500" },
];

export function LibraryNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--border-subtle)]">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl shrink-0 transition-all ${
              active
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] border border-[var(--border-subtle)]"
            }`}
          >
            <Icon className={`w-4 h-4 ${active ? "text-white" : tab.color}`} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
