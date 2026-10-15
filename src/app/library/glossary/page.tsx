"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LibraryNav } from "@/components/library/library-nav";
import { referenceService } from "@/lib/services/reference.service";
import { GlossaryTermRow } from "@/types/database";
import { SEED_GLOSSARY } from "@/data/seed-data";
import { BookA, Search } from "lucide-react";

export default function GlossaryLibraryPage() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [glossary, setGlossary] = useState<GlossaryTermRow[]>(SEED_GLOSSARY as unknown as GlossaryTermRow[]);

  useEffect(() => {
    referenceService.getGlossary().then((data) => {
      if (data && data.length > 0) {
        setGlossary(data);
      }
    });
  }, []);

  const categories = [
    "ALL",
    "Metrik & Analitik",
    "Strategi Konten",
    "Platform & Algoritma",
    "Produksi Konten",
    "Monetisasi & Bisnis",
  ];

  const filtered = glossary.filter((g) => {
    const matchCat =
      selectedCat === "ALL" || g.category.toLowerCase().includes(selectedCat.toLowerCase());
    const matchSearch =
      !search ||
      g.term.toLowerCase().includes(search.toLowerCase()) ||
      g.definition.toLowerCase().includes(search.toLowerCase()) ||
      g.example_usage.toLowerCase().includes(search.toLowerCase()) ||
      g.system_code.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <LibraryNav />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
              <BookA className="w-3.5 h-3.5" />
              <span>Sheet 11: 📖 Kamus Istilah</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              Glosarium 100 Istilah Media Sosial & Metrik Sehat
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Kamus istilah teknis industri media sosial yang diterjemahkan ke dalam bahasa awam yang mudah dipahami.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs font-bold text-[var(--text-secondary)] shrink-0">
            {filtered.length} dari 100 Istilah
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
              placeholder="Cari istilah, definisi, atau contoh penggunaan (misal: CTR, Hook, Retention)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface)] border border-[var(--border-subtle)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Terms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.system_code}
              className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] hover:border-purple-400 dark:hover:border-purple-800 transition-all flex flex-col justify-between space-y-3 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
                    {item.category}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[var(--text-muted)]">
                    {item.system_code}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {item.term}
                </h3>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {item.definition}
                </p>
              </div>

              {item.example_usage && (
                <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] italic">
                  <span className="font-bold not-italic text-[var(--text-secondary)] block text-[10px] mb-0.5">
                    CONTOH PENGGUNAAN:
                  </span>
                  &ldquo;{item.example_usage}&rdquo;
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
