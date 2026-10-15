"use client";

import React, { useState, useEffect } from "react";
import { referenceService } from "@/lib/services/reference.service";
import { HookTemplateRow, CtaTemplateRow } from "@/types/database";
import { X, Search, Flame, MousePointerClick, ArrowRight } from "lucide-react";

interface DrawerSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHook: (templateText: string, hookId: string) => void;
  onSelectCta: (templateText: string, ctaId: string) => void;
  activeTab?: "hooks" | "cta";
}

export function DrawerSelector({
  isOpen,
  onClose,
  onSelectHook,
  onSelectCta,
  activeTab: initialTab = "hooks",
}: DrawerSelectorProps) {
  const [tab, setTab] = useState<"hooks" | "cta">(initialTab);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [hooks, setHooks] = useState<HookTemplateRow[]>([]);
  const [ctas, setCtas] = useState<CtaTemplateRow[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    referenceService.getHooks().then(setHooks);
    referenceService.getCtas().then(setCtas);
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter Hooks
  const hookCategories = ["ALL", "NEGATIVITY", "CURIOSITY", "LIST_NUMBER", "CONTROVERSY", "FOMO", "AUTHORITY"];
  const filteredHooks = hooks.filter((h) => {
    const matchCat = selectedCategory === "ALL" || h.category === selectedCategory;
    const matchSearch =
      !search ||
      h.template_text.toLowerCase().includes(search.toLowerCase()) ||
      h.example_text.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filter CTAs
  const ctaCategories = ["ALL", "ENGAGEMENT", "AUTHORITY", "SALES"];
  const filteredCtas = ctas.filter((c) => {
    const matchCat = selectedCategory === "ALL" || c.category === selectedCategory;
    const matchSearch =
      !search ||
      c.template_text.toLowerCase().includes(search.toLowerCase()) ||
      c.example_text.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg h-full bg-[var(--surface)] border-l border-[var(--border-subtle)] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Repositori Referensi Naskah
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Pilih template terkurasi untuk disisipkan langsung ke naskah Anda.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Drawer"
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex gap-2">
          <button
            type="button"
            onClick={() => {
              setTab("hooks");
              setSelectedCategory("ALL");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === "hooks"
                ? "bg-[var(--surface)] text-blue-600 dark:text-blue-400 shadow-xs border border-[var(--border-subtle)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Hook Bank ({hooks.length || 105})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("cta");
              setSelectedCategory("ALL");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === "cta"
                ? "bg-[var(--surface)] text-blue-600 dark:text-blue-400 shadow-xs border border-[var(--border-subtle)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <MousePointerClick className="w-4 h-4 text-emerald-500" />
            <span>CTA-CTV ({ctas.length || 45})</span>
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="p-3 border-b border-[var(--border-subtle)] space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kata kunci template atau contoh..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(tab === "hooks" ? hookCategories : ctaCategories).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg shrink-0 transition-colors ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tab === "hooks" ? (
            filteredHooks.length === 0 ? (
              <div className="text-center py-12 text-xs text-[var(--text-muted)]">
                Tidak ada hook yang cocok dengan pencarian
              </div>
            ) : (
              filteredHooks.map((h) => (
                <div
                  key={h.id}
                  className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] hover:border-blue-500 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                      {h.system_code || "CUSTOM"}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-muted)] font-semibold">
                      {h.category}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[var(--text-primary)] leading-relaxed">
                    &ldquo;{h.template_text}&rdquo;
                  </p>

                  <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] text-[11px] text-[var(--text-secondary)] italic">
                    Contoh: {h.example_text}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectHook(h.template_text, h.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors mt-2"
                  >
                    <span>Gunakan Hook Ini</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )
          ) : filteredCtas.length === 0 ? (
            <div className="text-center py-12 text-xs text-[var(--text-muted)]">
              Tidak ada CTA yang cocok dengan pencarian
            </div>
          ) : (
            filteredCtas.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] hover:border-emerald-500 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {c.system_code || "CUSTOM"} &bull; {c.cta_type}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-muted)] font-semibold">
                    {c.category}
                  </span>
                </div>

                <p className="text-xs font-semibold text-[var(--text-primary)] leading-relaxed">
                  &ldquo;{c.template_text}&rdquo;
                </p>

                <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] text-[11px] text-[var(--text-secondary)] italic">
                  Contoh: {c.example_text}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectCta(c.template_text, c.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors mt-2"
                >
                  <span>Gunakan {c.cta_type} Ini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
