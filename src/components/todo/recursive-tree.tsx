"use client";

import React, { useState } from "react";
import {
  TaskNode,
  TaskItem,
  buildTaskTree,
  cascadeCompleteTask,
  cascadeReopenTask,
} from "@/lib/todo-engine";
import { CircularProgress } from "@/components/ui/circular-progress";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  Archive,
  Maximize2,
  Minimize2,
  FolderTree,
} from "lucide-react";

interface RecursiveTreeProps {
  tasks: TaskItem[];
  onToggleLeaf?: (task: TaskNode) => void;
  onToggleArchive?: (task: TaskNode) => void;
  onCascadeComplete?: (task: TaskNode) => void;
  onCascadeReopen?: (task: TaskNode) => void;
  onDeleteTask?: (task: TaskNode) => void;
  onCreateTask?: (title: string, parentId: string | null) => void;
  onUpdateTask?: (id: string, updates: Partial<TaskItem>) => void;
  onTasksChange?: (updatedTasks: TaskItem[]) => void;
}

export function RecursiveTree({
  tasks,
  onToggleLeaf,
  onToggleArchive,
  onCascadeComplete,
  onCascadeReopen,
  onDeleteTask,
  onCreateTask,
  onUpdateTask,
  onTasksChange,
}: RecursiveTreeProps) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [focusedBranchId, setFocusedBranchId] = useState<string | null>(null);

  // Dialog State
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Modal Input untuk Tambah / Edit
  const [modalInput, setModalInput] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    parentId: string | null;
    taskId?: string;
    title: string;
  }>({
    isOpen: false,
    mode: "add",
    parentId: null,
    title: "",
  });

  const tree = buildTaskTree(tasks);

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleLeaf = (task: TaskNode) => {
    if (onToggleLeaf) {
      onToggleLeaf(task);
    } else if (onTasksChange) {
      const updated = tasks.map((t) =>
        t.id === task.id ? { ...t, is_completed: !t.is_completed } : t
      );
      onTasksChange(updated);
    }
  };

  const handleParentClick = (parent: TaskNode) => {
    if (parent.effective_completed) {
      // Reopen dialog (Resolusi F-02)
      setDialogState({
        isOpen: true,
        title: "Buka Kembali Tugas Induk?",
        message: `Tugas "${parent.title}" sudah 100% selesai. Apakah Anda ingin membuka kembali seluruh sub-tugas di bawahnya?`,
        isDestructive: false,
        onConfirm: () => {
          if (onCascadeReopen) {
            onCascadeReopen(parent);
          } else if (onTasksChange) {
            const updated = cascadeReopenTask(tasks, parent.id);
            onTasksChange(updated);
          }
          setDialogState((prev) => ({ ...prev, isOpen: false }));
        },
      });
    } else {
      // Cascade complete dialog
      setDialogState({
        isOpen: true,
        title: "Selesaikan Seluruh Sub-Tugas?",
        message: `Apakah Anda ingin menandai seluruh sub-tugas di bawah "${parent.title}" sebagai selesai (100%)?`,
        isDestructive: false,
        onConfirm: () => {
          if (onCascadeComplete) {
            onCascadeComplete(parent);
          } else if (onTasksChange) {
            const updated = cascadeCompleteTask(tasks, parent.id);
            onTasksChange(updated);
          }
          setDialogState((prev) => ({ ...prev, isOpen: false }));
        },
      });
    }
  };

  const handleDeleteTask = (task: TaskNode) => {
    setDialogState({
      isOpen: true,
      title: "Hapus Tugas?",
      message:
        task.children.length > 0
          ? `Tugas "${task.title}" memiliki ${task.children.length} sub-tugas. Menghapus tugas ini akan menghapus seluruh keturunannya!`
          : `Apakah Anda yakin ingin menghapus "${task.title}"?`,
      isDestructive: true,
      onConfirm: () => {
        if (onDeleteTask) {
          onDeleteTask(task);
        } else if (onTasksChange) {
          const idsToDelete = new Set<string>();
          function collect(node: TaskNode) {
            idsToDelete.add(node.id);
            node.children.forEach(collect);
          }
          collect(task);
          const updated = tasks.filter((t) => !idsToDelete.has(t.id));
          onTasksChange(updated);
        }
        setDialogState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleToggleArchive = (task: TaskNode) => {
    if (onToggleArchive) {
      onToggleArchive(task);
    } else if (onTasksChange) {
      const updated = tasks.map((t) =>
        t.id === task.id ? { ...t, is_archived: !t.is_archived } : t
      );
      onTasksChange(updated);
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalInput.title.trim()) return;

    if (modalInput.mode === "add") {
      if (onCreateTask) {
        onCreateTask(modalInput.title.trim(), modalInput.parentId);
      } else if (onTasksChange) {
        const newTask: TaskItem = {
          id: `task-${Date.now()}`,
          parent_id: modalInput.parentId,
          title: modalInput.title.trim(),
          sort_order: tasks.length + 1,
          is_completed: false,
          is_archived: false,
        };
        onTasksChange([...tasks, newTask]);
      }
    } else if (modalInput.mode === "edit" && modalInput.taskId) {
      if (onUpdateTask) {
        onUpdateTask(modalInput.taskId, { title: modalInput.title.trim() });
      } else if (onTasksChange) {
        const updated = tasks.map((t) =>
          t.id === modalInput.taskId ? { ...t, title: modalInput.title.trim() } : t
        );
        onTasksChange(updated);
      }
    }

    setModalInput({ isOpen: false, mode: "add", parentId: null, title: "" });
  };

  // Render simpul node secara rekursif
  const renderNode = (node: TaskNode) => {
    const isCollapsed = collapsedIds.has(node.id);
    const hasChildren = node.children.length > 0;
    const isArchived = node.is_archived;

    return (
      <div key={node.id} className="relative group">
        {/* Row Container */}
        <div
          className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-all ${
            isArchived
              ? "opacity-50 bg-[var(--surface-elevated)] border-dashed border-[var(--border-subtle)]"
              : node.effective_completed
              ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
              : "bg-[var(--surface)] hover:bg-[var(--surface-elevated)] border-[var(--border-subtle)]"
          }`}
          style={{
            // Indentasi adaptif: Di mobile dibatasi 10px per level
            marginLeft: `${Math.min(node.depth, 4) * 14}px`,
          }}
        >
          {/* Sisi Kiri: Collapse Icon + Checkbox/Progress Ring + Title */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Chevron Kolapsibel */}
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleCollapse(node.id)}
                aria-label={isCollapsed ? "Buka sub-tugas" : "Tutup sub-tugas"}
                className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors shrink-0"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-6 shrink-0" />
            )}

            {/* Checkbox (Daun) vs CircularProgress (Induk) */}
            {node.is_leaf ? (
              <button
                type="button"
                onClick={() => handleToggleLeaf(node)}
                disabled={isArchived}
                aria-label={`Tandai selesai: ${node.title}`}
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] ${
                  node.is_completed
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "border-[var(--border-strong)] hover:border-[var(--brand)] bg-[var(--surface)]"
                }`}
              >
                {node.is_completed && <span className="text-xs font-bold">✓</span>}
              </button>
            ) : (
              <CircularProgress
                progress={node.progress}
                onClick={() => handleParentClick(node)}
                title={`Induk: ${node.progress}% (Rata-rata cabang). Klik untuk opsi.`}
              />
            )}

            {/* Title & Derived Info */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-sm font-medium truncate ${
                    node.effective_completed
                      ? "line-through text-[var(--text-muted)]"
                      : "text-[var(--text-primary)]"
                  }`}
                >
                  {node.title}
                </span>

                {/* Badge Tingkat Kedalaman jika > 3 di mobile */}
                {node.depth >= 3 && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                    Lvl {node.depth + 1}
                  </span>
                )}

                {/* Badge Status Terarsip */}
                {isArchived && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    Diarsipkan
                  </span>
                )}
              </div>

              {/* Sub-label untuk Induk: Menampilkan fakta rata-rata cabang */}
              {!node.is_leaf && (
                <span className="text-[11px] text-[var(--text-muted)]">
                  🔒 {node.progress}% (dari {node.children.filter((c) => !c.is_archived).length} sub-tugas aktif)
                </span>
              )}
            </div>
          </div>

            {/* Sisi Kanan: Aksi Cepat */}
          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            {/* Tombol Tambah Sub-tugas */}
            <button
              type="button"
              onClick={() =>
                setModalInput({
                  isOpen: true,
                  mode: "add",
                  parentId: node.id,
                  title: "",
                })
              }
              aria-label="Tambah Sub-tugas"
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              title="Tambah Sub-tugas"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Tombol Fokus Subtree (jika punya anak) */}
            {hasChildren && (
              <button
                type="button"
                onClick={() =>
                  setFocusedBranchId(focusedBranchId === node.id ? null : node.id)
                }
                aria-label="Fokus Cabang Ini"
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                title="Fokus Cabang Ini"
              >
                {focusedBranchId === node.id ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Tombol Edit */}
            <button
              type="button"
              onClick={() =>
                setModalInput({
                  isOpen: true,
                  mode: "edit",
                  parentId: node.parent_id,
                  taskId: node.id,
                  title: node.title,
                })
              }
              aria-label="Edit Judul"
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
              title="Edit Judul"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {/* Tombol Arsip */}
            <button
              type="button"
              onClick={() => handleToggleArchive(node)}
              aria-label={isArchived ? "Batalkan Arsip" : "Arsipkan Tugas"}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
              title={isArchived ? "Keluarkan dari Arsip" : "Arsipkan (Keluarkan dari kalkulasi)"}
            >
              <Archive className="w-3.5 h-3.5" />
            </button>

            {/* Tombol Hapus */}
            <button
              type="button"
              onClick={() => handleDeleteTask(node)}
              aria-label="Hapus Tugas"
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Hapus Tugas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Anak-anak Bersarang (Render jika tidak di-collapse) */}
        {hasChildren && !isCollapsed && (
          <div className="relative mt-1 space-y-1 pl-2">
            {/* Garis Pandu Vertikal Desktop */}
            <div
              className="hidden md:block absolute left-5 top-0 bottom-3 w-px bg-[var(--border-subtle)]"
              style={{
                left: `${Math.min(node.depth, 4) * 14 + 18}px`,
              }}
            />
            {node.children.map(renderNode)}
          </div>
        )}
      </div>
    );
  };

  // Filter pohon jika ada fokus cabang
  const displayNodes = focusedBranchId
    ? tree.filter((n) => n.id === focusedBranchId)
    : tree;

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              {focusedBranchId ? "Mode Fokus Cabang" : "Pohon Tugas Produksi (Batch Sprint)"}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {focusedBranchId
                ? "Menampilkan sub-pohon terisolasi. Klik tombol perkecil untuk melihat seluruh tugas."
                : "Hierarki tanpa batas kedalaman dengan kalkulasi rata-rata cabang otomatis."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {focusedBranchId && (
            <button
              type="button"
              onClick={() => setFocusedBranchId(null)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:bg-[var(--surface)] text-[var(--text-secondary)] transition-colors"
            >
              Tampilkan Semua
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              setModalInput({
                isOpen: true,
                mode: "add",
                parentId: focusedBranchId,
                title: "",
              })
            }
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tugas Induk</span>
          </button>
        </div>
      </div>

      {/* Tree Content */}
      <div className="p-3 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] space-y-2 shadow-xs min-h-[300px]">
        {displayNodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <FolderTree className="w-12 h-12 text-[var(--text-muted)] stroke-1" />
            <h3 className="text-sm font-semibold text-[var(--text-secondary)]">
              Belum ada tugas di pohon ini
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm">
              Mulai batch sprint produksi konten Anda dengan menambahkan tugas induk pertama di atas.
            </p>
          </div>
        ) : (
          displayNodes.map(renderNode)
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        isDestructive={dialogState.isDestructive}
        onConfirm={dialogState.onConfirm}
        onCancel={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Add / Edit Task Modal */}
      {modalInput.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <form
            onSubmit={handleSaveModal}
            className="w-full max-w-md p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
          >
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {modalInput.mode === "add" ? "Tambah Tugas Baru" : "Edit Judul Tugas"}
            </h3>

            <div>
              <label
                htmlFor="task-title-input"
                className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
              >
                Judul Tugas
              </label>
              <input
                id="task-title-input"
                type="text"
                required
                autoFocus
                value={modalInput.title}
                onChange={(e) =>
                  setModalInput((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Contoh: Riset 7 Hook Negatif"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  setModalInput({ isOpen: false, mode: "add", parentId: null, title: "" })
                }
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
