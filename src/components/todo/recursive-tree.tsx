"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  TaskNode,
  TaskItem,
  buildTaskTree,
  cascadeCompleteTask,
  cascadeReopenTask,
  getDueDateStatus,
  formatTaskDate,
  getTodayLocalDateString,
  validateTaskDates,
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
  Calendar,
  Clock,
  AlertCircle,
  Search,
  X,
  MoreHorizontal,
} from "lucide-react";

interface RecursiveTreeProps {
  tasks: TaskItem[];
  onToggleLeaf?: (task: TaskNode) => void;
  onToggleArchive?: (task: TaskNode) => void;
  onCascadeComplete?: (task: TaskNode) => void;
  onCascadeReopen?: (task: TaskNode) => void;
  onDeleteTask?: (task: TaskNode) => void;
  onCreateTask?: (
    title: string,
    parentId: string | null,
    options?: { startDate?: string | null; dueDate?: string | null; notes?: string | null }
  ) => void;
  onUpdateTask?: (id: string, updates: Partial<TaskItem>) => void;
  onTasksChange?: (updatedTasks: TaskItem[]) => void;
}

type FilterStatus = "all" | "overdue" | "due-today" | "upcoming" | "no-deadline";

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

  // Mobile overflow menu state: ID task yang menu aksinya sedang aktif
  const [activeMobileMenuTaskId, setActiveMobileMenuTaskId] = useState<string | null>(null);

  // Filter & Search State
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

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
    startDate: string;
    dueDate: string;
    notes: string;
    initialValues?: {
      title: string;
      startDate: string;
      dueDate: string;
      notes: string;
    };
  }>({
    isOpen: false,
    mode: "add",
    parentId: null,
    title: "",
    startDate: "",
    dueDate: "",
    notes: "",
  });

  const tree = useMemo(() => buildTaskTree(tasks), [tasks]);

  // Keyboard navigation & accessibility: Escape handler untuk modal dan mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeMobileMenuTaskId) {
          setActiveMobileMenuTaskId(null);
        } else if (modalInput.isOpen) {
          handleCloseModal();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMobileMenuTaskId, modalInput.isOpen, modalInput.initialValues, modalInput.title, modalInput.startDate, modalInput.dueDate, modalInput.notes]);

  // Hitung jumlah tugas per status tenggat waktu
  const counts = useMemo(() => {
    let overdue = 0;
    let dueToday = 0;
    let upcoming = 0;
    let noDeadline = 0;

    for (const t of tasks) {
      if (t.is_archived) continue;
      const status = getDueDateStatus(t.due_date, t.is_completed);
      if (status === "overdue") overdue++;
      else if (status === "due-today") dueToday++;
      else if (status === "upcoming") upcoming++;
      if (!t.due_date || !t.due_date.trim()) noDeadline++;
    }

    return { all: tasks.length, overdue, dueToday, upcoming, noDeadline };
  }, [tasks]);

  // ID set tugas yang cocok dengan filter / pencarian beserta silsilah leluhurnya
  const { visibleNodeIds, isFilteringActive } = useMemo(() => {
    const isFiltering = filterStatus !== "all" || searchQuery.trim().length > 0;
    if (!isFiltering) {
      return { visibleNodeIds: new Set<string>(), isFilteringActive: false };
    }

    const query = searchQuery.trim().toLowerCase();
    const taskMap = new Map<string, TaskItem>();
    for (const t of tasks) {
      taskMap.set(t.id, t);
    }

    const matchedIds = new Set<string>();

    for (const t of tasks) {
      // Filter Status
      let matchesStatus = true;
      if (filterStatus !== "all") {
        const st = getDueDateStatus(t.due_date, t.is_completed);
        if (filterStatus === "overdue") matchesStatus = st === "overdue";
        else if (filterStatus === "due-today") matchesStatus = st === "due-today";
        else if (filterStatus === "upcoming") matchesStatus = st === "upcoming";
        else if (filterStatus === "no-deadline") matchesStatus = !t.due_date || !t.due_date.trim();
      }

      // Filter Pencarian (Judul / Catatan)
      let matchesSearch = true;
      if (query) {
        const titleMatch = t.title.toLowerCase().includes(query);
        const notesMatch = Boolean(t.notes && t.notes.toLowerCase().includes(query));
        matchesSearch = titleMatch || notesMatch;
      }

      if (matchesStatus && matchesSearch) {
        matchedIds.add(t.id);
        // Sertakan seluruh rantai leluhur ke atas agar struktur pohon tetap utuh
        let currParent = t.parent_id;
        while (currParent) {
          matchedIds.add(currParent);
          const p = taskMap.get(currParent);
          currParent = p ? p.parent_id : null;
        }
      }
    }

    return { visibleNodeIds: matchedIds, isFilteringActive: true };
  }, [tasks, filterStatus, searchQuery]);

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

  // Buka Modal Tambah Tugas
  const openAddModal = (parentId: string | null = null) => {
    setModalInput({
      isOpen: true,
      mode: "add",
      parentId,
      taskId: undefined,
      title: "",
      startDate: "",
      dueDate: "",
      notes: "",
      initialValues: {
        title: "",
        startDate: "",
        dueDate: "",
        notes: "",
      },
    });
  };

  // Buka Modal Edit Tugas
  const openEditModal = (task: TaskNode) => {
    const initial = {
      title: task.title,
      startDate: task.start_date || "",
      dueDate: task.due_date || "",
      notes: task.notes || "",
    };
    setModalInput({
      isOpen: true,
      mode: "edit",
      parentId: task.parent_id,
      taskId: task.id,
      ...initial,
      initialValues: initial,
    });
  };

  // Cek apakah ada perubahan belum disimpan
  const isModalDirty = Boolean(
    modalInput.initialValues &&
      (modalInput.title !== modalInput.initialValues.title ||
        modalInput.startDate !== modalInput.initialValues.startDate ||
        modalInput.dueDate !== modalInput.initialValues.dueDate ||
        modalInput.notes !== modalInput.initialValues.notes)
  );

  const handleCloseModal = () => {
    if (isModalDirty) {
      if (!window.confirm("Perubahan belum disimpan. Yakin ingin menutup form?")) {
        return;
      }
    }
    setModalInput((prev) => ({ ...prev, isOpen: false }));
  };

  // Simpan Modal Tambah / Edit
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = modalInput.title.trim();
    if (!cleanTitle) return;

    const startDate = modalInput.startDate.trim() || null;
    const dueDate = modalInput.dueDate.trim() || null;
    const notes = modalInput.notes.trim() || null;

    // Validasi urutan tanggal
    const dateValidation = validateTaskDates(startDate, dueDate);
    if (!dateValidation.isValid) {
      alert(dateValidation.errorMessage);
      return;
    }

    if (modalInput.mode === "add") {
      if (onCreateTask) {
        onCreateTask(cleanTitle, modalInput.parentId, {
          startDate,
          dueDate,
          notes,
        });
      } else if (onTasksChange) {
        const newTask: TaskItem = {
          id: `task-${Date.now()}`,
          parent_id: modalInput.parentId,
          title: cleanTitle,
          notes,
          sort_order: tasks.length + 1,
          is_completed: false,
          is_archived: false,
          start_date: startDate,
          due_date: dueDate,
        };
        onTasksChange([...tasks, newTask]);
      }
    } else if (modalInput.mode === "edit" && modalInput.taskId) {
      if (onUpdateTask) {
        onUpdateTask(modalInput.taskId, {
          title: cleanTitle,
          start_date: startDate,
          due_date: dueDate,
          notes,
        });
      } else if (onTasksChange) {
        const updated = tasks.map((t) =>
          t.id === modalInput.taskId
            ? {
                ...t,
                title: cleanTitle,
                start_date: startDate,
                due_date: dueDate,
                notes,
              }
            : t
        );
        onTasksChange(updated);
      }
    }

    setModalInput({
      isOpen: false,
      mode: "add",
      parentId: null,
      title: "",
      startDate: "",
      dueDate: "",
      notes: "",
    });
  };

  // Helper Preset Tanggal Cepat
  const applyDatePreset = (preset: "today" | "tomorrow" | "next-week" | "clear") => {
    if (preset === "clear") {
      setModalInput((prev) => ({ ...prev, startDate: "", dueDate: "" }));
      return;
    }

    const todayStr = getTodayLocalDateString();
    if (preset === "today") {
      setModalInput((prev) => ({ ...prev, dueDate: todayStr }));
    } else if (preset === "tomorrow") {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const tomorrowStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      setModalInput((prev) => ({ ...prev, dueDate: tomorrowStr }));
    } else if (preset === "next-week") {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      const nextWeekStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      setModalInput((prev) => ({ ...prev, dueDate: nextWeekStr }));
    }
  };

  // Temukan tanggal jatuh tempo tugas induk untuk peringatan hierarki lembut
  const parentTask = useMemo(() => {
    if (!modalInput.parentId) return null;
    return tasks.find((t) => t.id === modalInput.parentId) || null;
  }, [modalInput.parentId, tasks]);

  const hasParentDeadlineWarning = Boolean(
    parentTask &&
      parentTask.due_date &&
      modalInput.dueDate &&
      modalInput.dueDate.trim() > parentTask.due_date.trim()
  );

  const hasDateOrderError = Boolean(
    modalInput.startDate &&
      modalInput.dueDate &&
      modalInput.startDate.trim() > modalInput.dueDate.trim()
  );

  // Render simpul node secara rekursif
  const renderNode = (node: TaskNode) => {
    // Jika filtering aktif dan node tidak termasuk yang harus tampil, lewati
    if (isFilteringActive && !visibleNodeIds.has(node.id)) {
      return null;
    }

    const isCollapsed = collapsedIds.has(node.id) && !isFilteringActive;
    const hasChildren = node.children.length > 0;
    const isArchived = node.is_archived;
    const dueDateStatus = getDueDateStatus(node.due_date, node.is_completed || node.effective_completed);

    // Komponen reusable untuk badge metadata (tanggal, catatan, level, arsip)
    const renderBadges = (isMobileLine: boolean) => (
      <div
        className={`flex items-center gap-1.5 flex-wrap ${
          isMobileLine ? "flex sm:hidden mt-1" : "hidden sm:flex shrink-0"
        }`}
      >
        {/* Badge Status Jatuh Tempo */}
        {dueDateStatus === "overdue" && (
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>Terlambat ({formatTaskDate(node.due_date)})</span>
          </span>
        )}

        {dueDateStatus === "due-today" && (
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            <Clock className="w-3 h-3 shrink-0" />
            <span>Hari Ini</span>
          </span>
        )}

        {dueDateStatus === "upcoming" && (
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
            <Calendar className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
            <span>
              {node.start_date
                ? `${formatTaskDate(node.start_date)} - ${formatTaskDate(node.due_date)}`
                : formatTaskDate(node.due_date)}
            </span>
          </span>
        )}

        {!node.due_date && node.start_date && (
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--surface-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
            <Calendar className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
            <span>Mulai: {formatTaskDate(node.start_date)}</span>
          </span>
        )}

        {/* Badge Tingkat Kedalaman jika >= 2 di mobile */}
        {node.depth >= 2 && (
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
    );

    const hasMobileBadges =
      dueDateStatus !== "none" ||
      (!node.due_date && Boolean(node.start_date)) ||
      node.depth >= 2 ||
      isArchived;

    const hasMetadata = !node.is_leaf || hasMobileBadges;

    return (
      <div key={node.id} className="relative group">
        {/* Row Container */}
        <div
          className={`p-2.5 sm:px-3 sm:py-2.5 rounded-xl border transition-all ${
            isArchived
              ? "opacity-50 bg-[var(--surface-elevated)] border-dashed border-[var(--border-subtle)]"
              : node.effective_completed
              ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
              : dueDateStatus === "overdue"
              ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40"
              : "bg-[var(--surface)] hover:bg-[var(--surface-elevated)] border-[var(--border-subtle)]"
          }`}
          style={{
            // Indentasi adaptif: Di mobile dibatasi 10px per level (maks 3 level = 30px); desktop 14px (maks 56px)
            marginLeft: `${Math.min(node.depth, 3) * 10}px`,
          }}
        >
          {/* Row 1: Task controls, title, and actions */}
          <div className="flex items-start justify-between gap-2 min-w-0">
            {/* Sisi Kiri: Collapse Icon + Checkbox/Progress Ring + Title */}
            <div className="flex items-start gap-2 sm:gap-2.5 min-w-0 flex-1">
              {/* Chevron Kolapsibel */}
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleCollapse(node.id)}
                  aria-label={isCollapsed ? `Buka sub-tugas ${node.title}` : `Tutup sub-tugas ${node.title}`}
                  className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors shrink-0 mt-0.5"
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
              <div className="shrink-0 mt-0.5">
                {node.is_leaf ? (
                  <button
                    type="button"
                    onClick={() => handleToggleLeaf(node)}
                    disabled={isArchived}
                    aria-label={`Tandai selesai: ${node.title}`}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand)] ${
                      node.is_completed
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-[var(--border-strong)] hover:border-[var(--brand)] bg-[var(--surface)]"
                    }`}
                  >
                    {node.is_completed && <span className="text-xs font-bold leading-none">✓</span>}
                  </button>
                ) : (
                  <CircularProgress
                    progress={node.progress}
                    onClick={() => handleParentClick(node)}
                    title={`Induk: ${node.progress}% (Rata-rata cabang). Klik untuk opsi.`}
                  />
                )}
              </div>

              {/* Task Title & Desktop Inline Badges */}
              <div className="flex items-start sm:items-center gap-2 flex-wrap sm:flex-nowrap min-w-0 flex-1 mt-0.5 sm:mt-0">
                <span
                  className={`text-xs sm:text-sm font-medium leading-relaxed sm:leading-normal break-words flex-1 min-w-0 ${
                    node.effective_completed
                      ? "line-through text-[var(--text-muted)]"
                      : "text-[var(--text-primary)]"
                  }`}
                >
                  {node.title}
                </span>

                {/* Badges on Desktop (sitting inline on Row 1) */}
                {renderBadges(false)}
              </div>
            </div>

            {/* Sisi Kanan: Aksi (Desktop: 5 tombol cepat; Mobile: + dan overflow menu •••) */}
            <div className="flex items-center gap-1 shrink-0 mt-0.5 sm:mt-0">
              {/* DESKTOP ACTIONS: Tetap 5 tombol cepat saat hover */}
              <div className="hidden sm:flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                {/* Tombol Tambah Sub-tugas */}
                <button
                  type="button"
                  onClick={() => openAddModal(node.id)}
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
                  onClick={() => openEditModal(node)}
                  aria-label="Edit Tugas & Catatan"
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
                  title="Edit Detail, Tanggal & Catatan"
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

              {/* MOBILE ACTIONS: 2 target sentuh nyaman (>= 32px) dengan overflow menu ••• */}
              <div className="flex sm:hidden items-center gap-1 relative">
                {/* Tombol Tambah Cepat (+) */}
                <button
                  type="button"
                  onClick={() => openAddModal(node.id)}
                  aria-label={`Tambah sub-tugas di bawah ${node.title}`}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/60 active:scale-95 transition-transform"
                  title="Tambah Sub-tugas"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Tombol Menu Overflow (•••) */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveMobileMenuTaskId(activeMobileMenuTaskId === node.id ? null : node.id)
                  }
                  aria-label={`Menu aksi lainnya untuk ${node.title}`}
                  aria-expanded={activeMobileMenuTaskId === node.id}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-secondary)] bg-[var(--surface-elevated)] border border-[var(--border-subtle)] active:scale-95 transition-transform"
                  title="Aksi Lainnya"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {/* Dropdown Menu Aksi Mobile */}
                {activeMobileMenuTaskId === node.id && (
                  <>
                    {/* Backdrop tak kasat mata untuk menutup saat klik luar */}
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setActiveMobileMenuTaskId(null)}
                    />
                    <div
                      role="menu"
                      aria-orientation="vertical"
                      className="absolute right-0 top-9 z-40 w-48 py-1.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl animate-in zoom-in-95 duration-150"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setActiveMobileMenuTaskId(null);
                          openEditModal(node);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-left font-medium text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] active:bg-[var(--surface-elevated)] transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Edit Detail & Jadwal</span>
                      </button>

                      {hasChildren && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setActiveMobileMenuTaskId(null);
                            setFocusedBranchId(focusedBranchId === node.id ? null : node.id);
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-left font-medium text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] active:bg-[var(--surface-elevated)] transition-colors"
                        >
                          {focusedBranchId === node.id ? (
                            <>
                              <Minimize2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Keluar Mode Fokus</span>
                            </>
                          ) : (
                            <>
                              <Maximize2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Fokus Cabang Ini</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setActiveMobileMenuTaskId(null);
                          handleToggleArchive(node);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-left font-medium text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] active:bg-[var(--surface-elevated)] transition-colors"
                      >
                        <Archive className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{isArchived ? "Batalkan Arsip" : "Arsipkan Tugas"}</span>
                      </button>

                      <div className="my-1 border-t border-[var(--border-subtle)]" />

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setActiveMobileMenuTaskId(null);
                          handleDeleteTask(node);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-left font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Hapus Tugas</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Inline Notes (Displayed directly beneath task title, spanning full remaining width) */}
          {Boolean(node.notes && node.notes.trim()) && (
            <div className="pl-[60px] sm:pl-[64px] pr-1 sm:pr-2 pt-1 min-w-0">
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] dark:text-zinc-400 whitespace-pre-line break-words leading-relaxed font-normal">
                {node.notes}
              </p>
            </div>
          )}

          {/* Row 3: Secondary Metadata (Due date status, Lvl, Child-task progress, Archived) */}
          {hasMetadata && (
            <div
              className={`pl-[60px] sm:pl-[64px] pt-1 items-center gap-2 flex-wrap min-w-0 ${
                node.is_leaf ? "flex sm:hidden" : "flex"
              }`}
            >
              {/* Mobile Badges (Due date status, Lvl, Archived) */}
              {renderBadges(true)}

              {/* Sub-label untuk Induk: Menampilkan fakta rata-rata cabang */}
              {!node.is_leaf && (
                <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-medium">
                  🔒 {node.progress}% ({node.children.filter((c) => !c.is_archived).length} sub-tugas aktif)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Anak-anak Bersarang (Render jika tidak di-collapse) */}
        {hasChildren && !isCollapsed && (
          <div className="relative mt-1 space-y-1 pl-1 sm:pl-2.5">
            {/* Garis Pandu Vertikal Desktop */}
            <div
              className="hidden md:block absolute top-0 bottom-3 w-px bg-[var(--border-subtle)]"
              style={{
                left: `${Math.min(node.depth, 3) * 10 + 14}px`,
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
    <div className="space-y-3 sm:space-y-4">
      {/* Banner Mode Fokus Cabang (Hanya tampil saat fokus aktif, tanpa duplikasi header biasa) */}
      {focusedBranchId && (
        <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0">
              <FolderTree className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold truncate">
                Mode Fokus Cabang Aktif
              </h2>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 truncate">
                Menampilkan sub-pohon terisolasi. Klik tombol untuk melihat seluruh tugas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFocusedBranchId(null)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-zinc-900 text-amber-900 dark:text-amber-100 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors shrink-0 shadow-xs"
          >
            Tampilkan Semua
          </button>
        </div>
      )}

      {/* Toolbar Filter, Pencarian & Tambah Tugas */}
      <div className="flex flex-col gap-2.5 p-3 sm:p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Filter Pills with safe horizontal scroll */}
          <div className="relative flex-1 min-w-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-2 sm:py-1.5 rounded-xl font-semibold transition-colors shrink-0 flex items-center gap-1.5 min-h-[34px] sm:min-h-0 ${
                  filterStatus === "all"
                    ? "bg-[var(--text-primary)] text-[var(--surface)] shadow-xs"
                    : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span>Semua</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                  {counts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus("overdue")}
                className={`px-3 py-2 sm:py-1.5 rounded-xl font-semibold transition-colors shrink-0 flex items-center gap-1.5 min-h-[34px] sm:min-h-0 ${
                  filterStatus === "overdue"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/40"
                }`}
              >
                <span>Terlambat</span>
                {counts.overdue > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 font-bold">
                    {counts.overdue}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus("due-today")}
                className={`px-3 py-2 sm:py-1.5 rounded-xl font-semibold transition-colors shrink-0 flex items-center gap-1.5 min-h-[34px] sm:min-h-0 ${
                  filterStatus === "due-today"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-900/40"
                }`}
              >
                <span>Hari Ini</span>
                {counts.dueToday > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold">
                    {counts.dueToday}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus("upcoming")}
                className={`px-3 py-2 sm:py-1.5 rounded-xl font-semibold transition-colors shrink-0 flex items-center gap-1.5 min-h-[34px] sm:min-h-0 ${
                  filterStatus === "upcoming"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span>Mendatang</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                  {counts.upcoming}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus("no-deadline")}
                className={`px-3 py-2 sm:py-1.5 rounded-xl font-semibold transition-colors shrink-0 flex items-center gap-1.5 min-h-[34px] sm:min-h-0 ${
                  filterStatus === "no-deadline"
                    ? "bg-zinc-700 text-white shadow-xs"
                    : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span>Tanpa Tenggat</span>
              </button>
            </div>
          </div>

          {/* Search Input & Tombol Tambah Induk */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1 sm:w-52 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tugas / catatan..."
                className="w-full pl-8 pr-7 py-2 sm:py-1.5 text-base sm:text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Bersihkan pencarian"
                  className="w-6 h-6 flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => openAddModal(focusedBranchId)}
              aria-label="Tambah tugas induk baru"
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors shrink-0 min-h-[38px] sm:min-h-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="inline">Tambah Tugas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tree Content */}
      <div className="p-2.5 sm:p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] space-y-1.5 sm:space-y-2 shadow-xs min-h-[300px]">
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
        ) : isFilteringActive && visibleNodeIds.size === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
            <AlertCircle className="w-10 h-10 text-[var(--text-muted)] stroke-1" />
            <h3 className="text-sm font-semibold text-[var(--text-secondary)]">
              Tidak ada tugas yang cocok dengan filter
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Coba sesuaikan status tenggat waktu atau kata kunci pencarian Anda.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterStatus("all");
                setSearchQuery("");
              }}
              className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
            >
              Reset Filter
            </button>
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

      {/* Add / Edit Task Modal (Bottom Sheet on Mobile, Centered Dialog on Desktop) */}
      {modalInput.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <form
            onSubmit={handleSaveModal}
            className="w-full max-w-lg max-h-[88vh] sm:max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl border-t sm:border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 overflow-hidden"
          >
            {/* Mobile Grab Indicator */}
            <div className="w-10 h-1 rounded-full bg-[var(--border-strong)] mx-auto mt-2.5 sm:hidden shrink-0" />

            {/* Header Modal */}
            <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-[var(--border-subtle)] shrink-0">
              <div className="min-w-0 pr-2">
                <h3 className="text-base font-bold text-[var(--text-primary)] truncate">
                  {modalInput.mode === "add"
                    ? modalInput.parentId
                      ? "Tambah Sub-tugas Baru"
                      : "Tambah Tugas Induk Baru"
                    : "Edit Detail & Penjadwalan Tugas"}
                </h3>
                {parentTask && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                    Induk: <span className="font-semibold text-[var(--text-secondary)]">{parentTask.title}</span>
                    {parentTask.due_date && ` (Batas: ${formatTaskDate(parentTask.due_date)})`}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label="Tutup form"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto px-5 py-4 space-y-4 flex-1 overscroll-contain">
              {/* Input Judul Tugas */}
              <div>
                <label
                  htmlFor="task-title-input"
                  className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
                >
                  Judul Tugas <span className="text-rose-500">*</span>
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
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Input Penjadwalan Tanggal (start_date & due_date) */}
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Jadwal Pengerjaan (Opsional)</span>
                  </span>

                  {/* Preset Cepat dengan Tombol Nyaman */}
                  <div className="flex items-center gap-1 text-[11px] flex-wrap">
                    <button
                      type="button"
                      onClick={() => applyDatePreset("today")}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-blue-500 text-[var(--text-secondary)] hover:text-blue-600 transition-colors"
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset("tomorrow")}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-blue-500 text-[var(--text-secondary)] hover:text-blue-600 transition-colors"
                    >
                      Besok
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset("clear")}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--surface)] border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label
                      htmlFor="task-start-date"
                      className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1"
                    >
                      Tanggal Mulai
                    </label>
                    <input
                      id="task-start-date"
                      type="date"
                      value={modalInput.startDate}
                      onChange={(e) =>
                        setModalInput((prev) => ({ ...prev, startDate: e.target.value }))
                      }
                      className="w-full px-3 py-2 sm:py-1.5 text-base sm:text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="task-due-date"
                      className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1"
                    >
                      Batas Waktu (Due Date)
                    </label>
                    <input
                      id="task-due-date"
                      type="date"
                      value={modalInput.dueDate}
                      onChange={(e) =>
                        setModalInput((prev) => ({ ...prev, dueDate: e.target.value }))
                      }
                      className="w-full px-3 py-2 sm:py-1.5 text-base sm:text-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Peringatan jika start_date > due_date */}
                {hasDateOrderError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-xs text-rose-800 dark:text-rose-300">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>Tanggal mulai tidak boleh melebihi batas waktu (due date).</span>
                  </div>
                )}

                {/* Peringatan hierarki lembut jika sub-tugas melampaui induk */}
                {hasParentDeadlineWarning && !hasDateOrderError && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                    <Clock className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      Perhatian: Batas waktu sub-tugas melampaui batas waktu tugas induk ({formatTaskDate(parentTask?.due_date)}).
                    </span>
                  </div>
                )}
              </div>

              {/* Input Catatan Konteks (notes) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="task-notes-input"
                    className="block text-xs font-semibold text-[var(--text-secondary)]"
                  >
                    Catatan & Konteks Tugas (Opsional)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {modalInput.notes.length} karakter
                  </span>
                </div>
                <textarea
                  id="task-notes-input"
                  rows={4}
                  value={modalInput.notes}
                  onChange={(e) =>
                    setModalInput((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Tambahkan detail naskah, link referensi, checklist perlengkapan, atau instruksi tim..."
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-y min-h-[90px]"
                />
              </div>
            </div>

            {/* Sticky Footer Modal */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--surface)] shrink-0">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-h-[38px] sm:min-h-0"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={hasDateOrderError || !modalInput.title.trim()}
                className="px-5 py-2.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-xs transition-colors flex items-center gap-1.5 min-h-[38px] sm:min-h-0"
              >
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
