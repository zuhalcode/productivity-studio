"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LibraryNav } from "@/components/library/library-nav";
import { referenceService } from "@/lib/services/reference.service";
import { ToolReferenceRow } from "@/types/database";
import { SEED_TOOLS } from "@/data/seed-data";
import { Wrench, Search, Tag } from "lucide-react";

export default function ToolsLibraryPage() {
  const [search, setSearch] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("ALL");
  const [selectedPricing, setSelectedPricing] = useState("ALL");
  const [tools, setTools] = useState<ToolReferenceRow[]>(SEED_TOOLS as unknown as ToolReferenceRow[]);

  useEffect(() => {
    referenceService.getTools().then((data) => {
      if (data && data.length > 0) {
        setTools(data);
      }
    });
  }, []);

  const phases = ["ALL", "Riset", "Nulis", "Produksi", "Editing", "Analisis"];
  const pricings = ["ALL", "Gratis", "Freemium", "Berbayar"];

  const filtered = tools.filter((t) => {
    const matchPhase = selectedPhase === "ALL" || t.phase.toLowerCase() === selectedPhase.toLowerCase();
    const matchPricing = selectedPricing === "ALL" || t.pricing_model.toLowerCase() === selectedPricing.toLowerCase();
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.purpose.toLowerCase().includes(search.toLowerCase()) ||
      t.category_tag.toLowerCase().includes(search.toLowerCase());
    return matchPhase && matchPricing && matchSearch;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <LibraryNav />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              <Wrench className="w-3.5 h-3.5" />
              <span>Sheet 9: 🛠️ Tools Ngonten</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              Direktori 31 Tools Produksi Konten Terkurasi
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Dikelompokkan ke dalam 5 fase kerja: Riset (8), Nulis (7), Produksi (3), Editing (8), dan Analisis (5).
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs font-bold text-[var(--text-secondary)] shrink-0">
            {filtered.length} dari 31 Tools
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
              placeholder="Cari nama tool, fungsi, atau kategori..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Phase Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-bold text-[var(--text-muted)] mr-1">Fase Kerja:</span>
              {phases.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPhase(p)}
                  className={`px-3 py-1 text-xs font-bold rounded-xl shrink-0 transition-all ${
                    selectedPhase === p
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface)] border border-[var(--border-subtle)]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Pricing Filters */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[var(--text-muted)] mr-1">Lisensi:</span>
              {pricings.map((pr) => (
                <button
                  key={pr}
                  type="button"
                  onClick={() => setSelectedPricing(pr)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedPricing === pr
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                      : "bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {pr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tools Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tool) => (
            <div
              key={tool.system_code}
              className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] hover:border-blue-400 dark:hover:border-blue-800 transition-all flex flex-col justify-between space-y-3 shadow-xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                      Fase: {tool.phase}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        tool.pricing_model === "Gratis"
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                          : tool.pricing_model === "Freemium"
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                          : "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300"
                      }`}
                    >
                      {tool.pricing_model}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[var(--text-muted)]">
                    {tool.system_code}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {tool.name}
                </h3>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {tool.purpose}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-[11px]">
                <div className="flex items-center gap-1 text-[var(--text-muted)]">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{tool.category_tag}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
