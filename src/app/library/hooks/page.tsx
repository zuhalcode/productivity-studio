"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LibraryNav } from "@/components/library/library-nav";
import { referenceService } from "@/lib/services/reference.service";
import { HookTemplateRow } from "@/types/database";
import { SEED_HOOKS } from "@/data/seed-data";
import { Flame, Search, Copy, Check } from "lucide-react";

export default function HookLibraryPage() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [hooks, setHooks] = useState<HookTemplateRow[]>(SEED_HOOKS as unknown as HookTemplateRow[]);

  useEffect(() => {
    referenceService.getHooks().then((data) => {
      if (data && data.length > 0) {
        setHooks(data);
      }
    });
  }, []);

  const categories = ["ALL", "NEGATIVITY", "CURIOSITY", "LIST_NUMBER", "CONTROVERSY", "FOMO", "AUTHORITY"];

  const filtered = hooks.filter((h) => {
    const matchCat = selectedCat === "ALL" || h.category === selectedCat;
    const matchSearch =
      !search ||
      h.template_text.toLowerCase().includes(search.toLowerCase()) ||
      h.example_text.toLowerCase().includes(search.toLowerCase()) ||
      h.system_code.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCopy = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <LibraryNav />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-900">
              <Flame className="w-3.5 h-3.5" />
              <span>Sheet 6: 🔥 Hook Bank</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              Repositori 105 Template Hook Terbukti
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              6 Kategori Pemicu Psikologis: Negativity, Curiosity, List/Number, Controversy, FOMO, dan Authority.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs font-bold text-[var(--text-secondary)] shrink-0">
            {filtered.length} dari 105 Hook
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] space-y-3 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan kata kunci template, contoh naskah, atau kode HOOK-001..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl shrink-0 transition-all ${
                  selectedCat === cat
                    ? "bg-orange-600 text-white shadow-xs"
                    : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface)] border border-[var(--border-subtle)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Hook Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((hook) => (
            <div
              key={hook.system_code}
              className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] hover:border-orange-400 dark:hover:border-orange-800 transition-all flex flex-col justify-between space-y-3 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300">
                    {hook.category}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[var(--text-muted)]">
                    {hook.system_code}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-snug">
                  &ldquo;{hook.template_text}&rdquo;
                </h3>

                <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] italic">
                  <span className="font-bold not-italic text-[var(--text-muted)] block text-[10px] mb-0.5">
                    CONTOH APLIKATIF:
                  </span>
                  {hook.example_text}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                <span>Cocok: {hook.suitable_niche || "Semua Niche"}</span>

                <button
                  type="button"
                  onClick={() => handleCopy(hook.example_text, hook.system_code)}
                  className="flex items-center gap-1 px-2.5 py-1 font-bold text-xs rounded-lg bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 hover:bg-orange-100 transition-colors"
                >
                  {copiedCode === hook.system_code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Contoh</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
