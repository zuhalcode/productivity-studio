"use client";

import React from "react";
import { useTheme, ThemePreference } from "@/components/theme-provider";
import { Sun, Moon, Laptop } from "lucide-react";

export function ThemeController({ compact = false }: { compact?: boolean }) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const options: Array<{ value: ThemePreference; label: string; icon: React.ReactNode }> = [
    { value: "light", label: "Light", icon: <Sun className="w-4 h-4" /> },
    { value: "dark", label: "Dark", icon: <Moon className="w-4 h-4" /> },
    { value: "system", label: "System", icon: <Laptop className="w-4 h-4" /> },
  ];

  if (compact) {
    return (
      <button
        onClick={() => {
          if (theme === "light") setTheme("dark");
          else if (theme === "dark") setTheme("system");
          else setTheme("light");
        }}
        aria-label={`Ganti Tema (Aktif: ${theme})`}
        className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="w-4 h-4 text-blue-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Pilihan Tema"
      className="flex items-center gap-1 p-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]"
    >
      {options.map((opt) => {
        const isSelected = theme === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isSelected}
            onClick={() => setTheme(opt.value)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand)] ${
              isSelected
                ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border-subtle)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
