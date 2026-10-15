"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LibraryNav } from "@/components/library/library-nav";
import { referenceService } from "@/lib/services/reference.service";
import { CtaTemplateRow } from "@/types/database";
import { SEED_CTAS } from "@/data/seed-data";
import { MousePointerClick, Search, Copy, Check } from "lucide-react";

export default function CtaLibraryPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [ctas, setCtas] = useState<CtaTemplateRow[]>(SEED_CTAS as unknown as CtaTemplateRow[]);

  useEffect(() => {
    referenceService.getCtas().then((data) => {
      if (data && data.length > 0) {
        setCtas(data);
      }
    });
  }, []);

  const categories = ["ALL", "ENGAGEMENT", "AUTHORITY", "SALES"];
  const types = ["ALL", "CTA", "CTV"];

  const filtered = ctas.filter((c) => {
    const matchCat = selectedCategory === "ALL" || c.category === selectedCategory;
    const matchType = selectedType === "ALL" || c.cta_type === selectedType;
    const matchSearch =
      !search ||
      c.template_text.toLowerCase().includes(search.toLowerCase()) ||
      c.example_text.toLowerCase().includes(search.toLowerCase()) ||
      c.system_code.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchType && matchSearch;
  });

  const handleCopy = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <LibraryNav />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>Sheet 8: 🎯 Bank of CTA-CTV</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              Repositori 45 Template CTA & Call to Value (CTV)
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Pembeda tegas antara CTA aksi langsung (13) vs CTV ajakan berbasis nilai manfaat (32).
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs font-bold text-[var(--text-secondary)] shrink-0">
            {filtered.length} dari 45 Template
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] space-y-3 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kata kunci CTA/CTV atau kode CTA-001..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-bold text-[var(--text-muted)] mr-1">Kategori:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs font-bold rounded-xl shrink-0 transition-all ${
                    selectedCategory === cat
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface)] border border-[var(--border-subtle)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[var(--text-muted)] mr-1">Tipe:</span>
              {types.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedType(t)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedType === t
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                      : "bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.system_code}
              className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] hover:border-emerald-400 dark:hover:border-emerald-800 transition-all flex flex-col justify-between space-y-3 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        item.cta_type === "CTV"
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                          : "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300"
                      }`}
                    >
                      {item.cta_type}
                    </span>
                    <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[var(--text-muted)]">
                    {item.system_code}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-snug">
                  &ldquo;{item.template_text}&rdquo;
                </h3>

                <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] italic">
                  <span className="font-bold not-italic text-[var(--text-muted)] block text-[10px] mb-0.5">
                    CONTOH APLIKATIF:
                  </span>
                  {item.example_text}
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => handleCopy(item.example_text || item.template_text, item.system_code)}
                  className="flex items-center gap-1 px-3 py-1 font-bold text-xs rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                >
                  {copiedCode === item.system_code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kalimat</span>
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
