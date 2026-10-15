"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LibraryNav } from "@/components/library/library-nav";
import { referenceService } from "@/lib/services/reference.service";
import { IdeaTemplateRow } from "@/types/database";
import { SEED_IDEAS } from "@/data/seed-data";
import { FunnelBadge } from "@/components/ui/funnel-badge";
import { Lightbulb, Search, Copy, Check } from "lucide-react";

export default function IdeaLibraryPage() {
  const [search, setSearch] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("ALL");
  const [selectedFunnel, setSelectedFunnel] = useState("ALL");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<IdeaTemplateRow[]>(SEED_IDEAS as unknown as IdeaTemplateRow[]);

  useEffect(() => {
    referenceService.getIdeas().then((data) => {
      if (data && data.length > 0) {
        setIdeas(data);
      }
    });
  }, []);

  const niches = [
    "ALL",
    "Bisnis & UMKM",
    "Personal Brand",
    "Edukasi",
    "Lifestyle",
    "Finance",
    "Kesehatan",
    "Fashion",
    "Kuliner",
    "Content Creator",
    "Parenting",
  ];

  const filtered = ideas.filter((i) => {
    const matchNiche = selectedNiche === "ALL" || i.niche.toLowerCase().includes(selectedNiche.toLowerCase());
    const matchFunnel = selectedFunnel === "ALL" || i.funnel_layer.toLowerCase() === selectedFunnel.toLowerCase();
    const matchSearch =
      !search ||
      i.template_text.toLowerCase().includes(search.toLowerCase()) ||
      i.example_text.toLowerCase().includes(search.toLowerCase()) ||
      i.system_code.toLowerCase().includes(search.toLowerCase());
    return matchNiche && matchFunnel && matchSearch;
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Sheet 7: 💡 Bank Ide Konten</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              Repositori 104 Ide Konten Lintas 10 Niche
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Dikelompokkan ke dalam 3 layer funnel: Authority (52), Engagement (48), dan Sales (4).
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs font-bold text-[var(--text-secondary)] shrink-0">
            {filtered.length} dari 104 Ide
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
              placeholder="Cari kata kunci ide konten atau contoh judul..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Niche Pills */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[var(--text-muted)]">Pilih Niche Industri:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {niches.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSelectedNiche(n)}
                  className={`px-3 py-1 text-xs font-bold rounded-xl shrink-0 transition-all ${
                    selectedNiche === n
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface)] border border-[var(--border-subtle)]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Funnel Layer Filter */}
          <div className="space-y-1 pt-1 border-t border-[var(--border-subtle)]">
            <span className="text-[11px] font-bold text-[var(--text-muted)]">Filter Funnel:</span>
            <div className="flex items-center gap-1.5">
              {["ALL", "Authority", "Engagement", "Sales"].map((fn) => (
                <button
                  key={fn}
                  type="button"
                  onClick={() => setSelectedFunnel(fn)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedFunnel === fn
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                      : "bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {fn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((idea) => (
            <div
              key={idea.system_code}
              className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] hover:border-amber-400 dark:hover:border-amber-800 transition-all flex flex-col justify-between space-y-3 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[var(--text-primary)]">
                      {idea.niche}
                    </span>
                    <FunnelBadge
                      layer={
                        idea.funnel_layer.toLowerCase().includes("authority")
                          ? "Authority"
                          : idea.funnel_layer.toLowerCase().includes("sales")
                          ? "Sales"
                          : "Engagement"
                      }
                      size="sm"
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[var(--text-muted)]">
                    {idea.system_code}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-snug">
                  {idea.template_text}
                </h3>

                <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] italic">
                  <span className="font-bold not-italic text-[var(--text-muted)] block text-[10px] mb-0.5">
                    CONTOH APLIKATIF:
                  </span>
                  {idea.example_text}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                <span>Format: {idea.format_type || "Video"}</span>

                <button
                  type="button"
                  onClick={() => handleCopy(idea.example_text || idea.template_text, idea.system_code)}
                  className="flex items-center gap-1 px-2.5 py-1 font-bold text-xs rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100 transition-colors"
                >
                  {copiedCode === idea.system_code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Ide</span>
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
