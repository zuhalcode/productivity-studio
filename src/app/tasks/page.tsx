"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useTasks } from "@/hooks/use-tasks";
import { RecursiveTree } from "@/components/todo/recursive-tree";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  CheckSquare,
  RefreshCw,
  Loader2,
  AlertCircle,
  Trash2,
  Sparkles,
} from "lucide-react";

export default function BatchTasksPage() {
  const {
    tasks,
    isLoading,
    isSaving,
    error,
    createTask,
    updateTask,
    toggleLeaf,
    toggleArchive,
    cascadeComplete,
    cascadeReopen,
    deleteTask,
    deleteAllTasks,
    loadDefaultTasks,
  } = useTasks();

  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);


  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Modul 4: Recursive Hierarchical Todo Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              Manajemen Pohon Tugas (Batch Production Sprint)
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Dekomposisi tugas bersarang tanpa batas kedalaman semu. Disimpan secara persisten di Supabase dengan kalkulasi progres cabang rata-rata on-the-fly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isSaving && (
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 animate-in fade-in flex items-center gap-1.5 mr-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan ke Supabase...</span>
              </span>
            )}

            {tasks.length > 0 ? (
              <button
                type="button"
                onClick={() => setIsConfirmClearOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors"
                title="Hapus seluruh tugas dari basis data Supabase"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Semua</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={loadDefaultTasks}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors"
                title="Muat contoh batch sprint default"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Muat Template Sprint</span>
              </button>
            )}

            <div className="px-3.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs font-bold text-[var(--text-secondary)]">
              {tasks.length} Total Tugas
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-xs text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && tasks.length === 0 ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Memuat pohon tugas dari Supabase...</span>
            </div>
          </div>
        ) : (
          /* Tree Component with Granular CRUD operations */
          <RecursiveTree
            tasks={tasks}
            onToggleLeaf={toggleLeaf}
            onToggleArchive={toggleArchive}
            onCascadeComplete={cascadeComplete}
            onCascadeReopen={cascadeReopen}
            onDeleteTask={deleteTask}
            onCreateTask={createTask}
            onUpdateTask={updateTask}
          />
        )}

        {/* Dialog Konfirmasi Kosongkan Semua Tugas */}
        <ConfirmDialog
          isOpen={isConfirmClearOpen}
          title="Kosongkan Seluruh Tugas"
          message="Apakah Anda yakin ingin menghapus seluruh pohon tugas dari basis data Supabase? Semua tugas dan sub-tugas akan dihapus secara permanen dan tidak akan dimuat ulang saat halaman di-refresh."
          confirmLabel="Ya, Kosongkan Semua"
          cancelLabel="Batal"
          isDestructive={true}
          onConfirm={async () => {
            setIsConfirmClearOpen(false);
            await deleteAllTasks();
          }}
          onCancel={() => setIsConfirmClearOpen(false)}
        />
      </div>
    </AppShell>
  );
}
