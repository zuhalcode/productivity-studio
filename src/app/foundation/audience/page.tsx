"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { usePersonas } from "@/hooks/use-personas";
import { AudiencePersona } from "@/types/database";
import {
  Users,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Heart,
  ShieldAlert,
  Sparkles,
  Loader2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AudiencePersonaPage() {
  const {
    personas,
    isLoading,
    isSaving,
    error,
    createPersona,
    updatePersona,
    deletePersona,
  } = usePersonas();

  const [selectedId, setSelectedId] = useState<string>("");
  const [activePersonaState, setActivePersonaState] = useState<AudiencePersona | null>(null);
  const [saveToast, setSaveToast] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (personas.length > 0) {
      if (!selectedId || !personas.some((p) => p.id === selectedId)) {
        setSelectedId(personas[0].id);
        setActivePersonaState(personas[0]);
      } else {
        const found = personas.find((p) => p.id === selectedId);
        if (found) setActivePersonaState(found);
      }
    }
  }, [personas, selectedId]);

  const handleSelectPersona = (id: string) => {
    setSelectedId(id);
    const found = personas.find((p) => p.id === id);
    if (found) setActivePersonaState(found);
  };

  const handleUpdateActive = (updated: Partial<AudiencePersona>) => {
    if (!activePersonaState) return;
    setActivePersonaState({ ...activePersonaState, ...updated });
  };

  const handleSave = async () => {
    if (!activePersonaState) return;
    try {
      await updatePersona(activePersonaState.id, activePersonaState);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch {
      // Error handled by hook
    }
  };

  const handleAddNewPersona = async () => {
    const newPersonaData: Omit<AudiencePersona, "id" | "created_at" | "updated_at"> = {
      user_id: null,
      persona_name: `Persona Baru #${personas.length + 1} — Target Avatar`,
      demographics: {
        age_range: "25-35",
        gender: "Semua",
        occupation: "Profesional / Pemilik Usaha",
        income: "Rp 10-20 Juta/bln",
        location: "Jabodetabek / Kota Besar",
      },
      pain_points: "Tuliskan masalah dan rasa frustrasi terbesarnya...",
      desires: "Tuliskan impian dan transformasi yang dia cari...",
      objections: "Tuliskan alasan dia ragu membeli produk/jasa Anda...",
      narrative: "Tuliskan satu hari dalam kehidupannya (A Day in the Life)...",
      is_active: true,
    };

    try {
      const created = await createPersona(newPersonaData);
      setSelectedId(created.id);
      setActivePersonaState(created);
    } catch {
      // Error handled by hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!activePersonaState) return;
    try {
      await deletePersona(activePersonaState.id);
      setDeleteConfirmOpen(false);
    } catch {
      setDeleteConfirmOpen(false);
    }
  };

  if (isLoading && personas.length === 0) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Memuat Persona Audiens dari Supabase...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!activePersonaState) return null;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              <Users className="w-3.5 h-3.5" />
              <span>Modul 1: Strategi & Positioning</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              Audience Persona (Customer Avatar)
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Definisi mendalam target avatar: demografis, pain points, desires, dan narasi kehidupan nyata.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {saveToast && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                ✓ Persona tersimpan di Supabase!
              </span>
            )}
            <button
              type="button"
              onClick={handleAddNewPersona}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:bg-[var(--surface)] text-[var(--text-primary)] transition-colors"
            >
              <Plus className="w-4 h-4 text-blue-500" />
              <span>Tambah Persona</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs transition-colors"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? "Menyimpan..." : "Simpan Persona"}</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-xs text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Persona Tabs & Profile Card */}
        <div className="space-y-4">
          {/* Persona Selection Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {personas.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPersona(p.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                  selectedId === p.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] border border-[var(--border-subtle)]"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{p.persona_name}</span>
              </button>
            ))}
          </div>

          {/* Active Persona Editor */}
          <div className="p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] space-y-6 shadow-xs">
            {/* Persona Title Header & Delete Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex-1 max-w-xl">
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Nama Persona & Deskripsi Singkat:
                </label>
                <input
                  type="text"
                  value={activePersonaState.persona_name}
                  onChange={(e) => handleUpdateActive({ persona_name: e.target.value })}
                  placeholder="Contoh: Dinda, 27 th — Pemilik Brand Fashion Lokal"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {personas.length > 1 && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors self-start sm:self-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Persona</span>
                </button>
              )}
            </div>

            {/* Demographics 5 Grid */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Data Demografis Utama</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-1">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)]">Rentang Usia</span>
                  <input
                    type="text"
                    value={activePersonaState.demographics.age_range}
                    onChange={(e) =>
                      handleUpdateActive({
                        demographics: { ...activePersonaState.demographics, age_range: e.target.value },
                      })
                    }
                    className="w-full text-xs font-bold bg-transparent border-none p-0 text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-1">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)]">Jenis Kelamin</span>
                  <input
                    type="text"
                    value={activePersonaState.demographics.gender}
                    onChange={(e) =>
                      handleUpdateActive({
                        demographics: { ...activePersonaState.demographics, gender: e.target.value },
                      })
                    }
                    className="w-full text-xs font-bold bg-transparent border-none p-0 text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-1">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)]">Pekerjaan / Peran</span>
                  <input
                    type="text"
                    value={activePersonaState.demographics.occupation}
                    onChange={(e) =>
                      handleUpdateActive({
                        demographics: { ...activePersonaState.demographics, occupation: e.target.value },
                      })
                    }
                    className="w-full text-xs font-bold bg-transparent border-none p-0 text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-1">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)]">Penghasilan Bulanan</span>
                  <input
                    type="text"
                    value={activePersonaState.demographics.income}
                    onChange={(e) =>
                      handleUpdateActive({
                        demographics: { ...activePersonaState.demographics, income: e.target.value },
                      })
                    }
                    className="w-full text-xs font-bold bg-transparent border-none p-0 text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)]">Domisili / Lokasi</span>
                  <input
                    type="text"
                    value={activePersonaState.demographics.location}
                    onChange={(e) =>
                      handleUpdateActive({
                        demographics: { ...activePersonaState.demographics, location: e.target.value },
                      })
                    }
                    className="w-full text-xs font-bold bg-transparent border-none p-0 text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Psikografis: Pain Points, Desires, Objections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Pain Points */}
              <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-[var(--surface-elevated)] space-y-2">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  <h4 className="text-xs font-bold">Pain Points (Frustrasi)</h4>
                </div>
                <textarea
                  rows={5}
                  value={activePersonaState.pain_points}
                  onChange={(e) => handleUpdateActive({ pain_points: e.target.value })}
                  placeholder="Masalah menyakitkan yang belum terselesaikan..."
                  className="w-full p-2.5 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              {/* Desires */}
              <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-[var(--surface-elevated)] space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Heart className="w-4 h-4" />
                  <h4 className="text-xs font-bold">Desires (Impian / Goals)</h4>
                </div>
                <textarea
                  rows={5}
                  value={activePersonaState.desires}
                  onChange={(e) => handleUpdateActive({ desires: e.target.value })}
                  placeholder="Kondisi ideal dan hasil transformasi yang dia dambakan..."
                  className="w-full p-2.5 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Objections */}
              <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-[var(--surface-elevated)] space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="w-4 h-4" />
                  <h4 className="text-xs font-bold">Objections (Keraguan)</h4>
                </div>
                <textarea
                  rows={5}
                  value={activePersonaState.objections}
                  onChange={(e) => handleUpdateActive({ objections: e.target.value })}
                  placeholder="Keraguan yang membuat dia menolak membeli produk Anda..."
                  className="w-full p-2.5 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            {/* Narrative / Day in the Life */}
            <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-2">
              <h4 className="text-xs font-bold text-[var(--text-primary)]">
                Narasi Kehidupan Nyata (A Day in the Life)
              </h4>
              <p className="text-[11px] text-[var(--text-muted)]">
                Cerita sehari-hari persona ini: kapan dia membuka medsos, momen apa yang membuatnya merasa stres, dan apa pemicu yang membuat dia membeli solusi.
              </p>
              <textarea
                rows={3}
                value={activePersonaState.narrative || ""}
                onChange={(e) => handleUpdateActive({ narrative: e.target.value })}
                placeholder="Dinda sibuk mengurus stok kain dan pengiriman, tidak punya waktu 3 jam sehari untuk riset tren..."
                className="w-full p-3 text-xs rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Hapus Persona Audiens?"
        message={`Apakah Anda yakin ingin menghapus persona "${activePersonaState.persona_name}" dari Supabase?`}
        confirmLabel="Hapus Persona"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </AppShell>
  );
}
