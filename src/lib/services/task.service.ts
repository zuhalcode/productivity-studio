import { taskRepository } from "@/lib/repositories/task.repository";
import { TaskItem } from "@/types/database";
import {
  validateTaskMove,
  cascadeCompleteTask,
  cascadeReopenTask,
} from "@/lib/todo-engine";
import { AppError } from "@/lib/supabase/errors";

export function generateDefaultTasks(): Array<Omit<TaskItem, "created_at" | "updated_at">> {
  const sprintId = crypto.randomUUID();
  const scriptParentId = crypto.randomUUID();

  return [
    {
      id: sprintId,
      user_id: null,
      parent_id: null,
      content_plan_id: null,
      title: "Batch Sprint Minggu 1",
      description: "Sprint batch mingguan 3-3-1",
      sort_order: 1,
      is_completed: false,
      is_archived: false,
      due_date: null,
    },
    {
      id: crypto.randomUUID(),
      user_id: null,
      parent_id: sprintId,
      content_plan_id: null,
      title: "Senin: Riset & Validasi 7 Topik",
      description: "Cari ide winning & hook di library",
      sort_order: 1,
      is_completed: true,
      is_archived: false,
      due_date: null,
    },
    {
      id: scriptParentId,
      user_id: null,
      parent_id: sprintId,
      content_plan_id: null,
      title: "Selasa: Tulis 7 Naskah HTPC",
      description: "Tulis struktur 4 blok HTPC",
      sort_order: 2,
      is_completed: false,
      is_archived: false,
      due_date: null,
    },
    {
      id: crypto.randomUUID(),
      user_id: null,
      parent_id: scriptParentId,
      content_plan_id: null,
      title: "Script Video #1 (Engagement)",
      description: null,
      sort_order: 1,
      is_completed: true,
      is_archived: false,
      due_date: null,
    },
    {
      id: crypto.randomUUID(),
      user_id: null,
      parent_id: scriptParentId,
      content_plan_id: null,
      title: "Script Video #2 (Engagement)",
      description: null,
      sort_order: 2,
      is_completed: false,
      is_archived: false,
      due_date: null,
    },
    {
      id: crypto.randomUUID(),
      user_id: null,
      parent_id: sprintId,
      content_plan_id: null,
      title: "Sabtu: Batch Syuting 7 Video",
      description: "Syuting maraton 2-3 jam",
      sort_order: 3,
      is_completed: false,
      is_archived: false,
      due_date: null,
    },
    {
      id: crypto.randomUUID(),
      user_id: null,
      parent_id: sprintId,
      content_plan_id: null,
      title: "Minggu: Editing & Penjadwalan",
      description: "Export dan jadwalkan di Meta Business Suite",
      sort_order: 4,
      is_completed: false,
      is_archived: false,
      due_date: null,
    },
  ];
}

export class TaskService {
  /**
   * Mengambil semua tugas dari Supabase.
   * Tidak melakukan auto-seeding otomatis jika kosong, agar state kosong tetap persisten.
   */
  async getTasks(): Promise<TaskItem[]> {
    return await taskRepository.getTasks();
  }

  /**
   * Menginisialisasi tugas default batch sprint (eksplisit bila diinginkan pengguna).
   */
  async initializeDefaultTasks(): Promise<TaskItem[]> {
    const defaults = generateDefaultTasks();
    const created: TaskItem[] = [];
    for (const d of defaults) {
      const row = await taskRepository.createTask(d);
      created.push(row);
    }
    return created;
  }

  /**
   * Mengosongkan seluruh tugas secara permanen dari Supabase.
   */
  async deleteAllTasks(): Promise<void> {
    await taskRepository.deleteAllTasks();
  }

  /**
   * Menambahkan tugas baru (akar atau anak).
   */
  async createTask(
    title: string,
    parentId: string | null = null,
    currentTasks: TaskItem[] = []
  ): Promise<TaskItem> {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      throw new AppError("Judul tugas tidak boleh kosong.", "VALIDATION_ERROR");
    }

    if (parentId) {
      const parentExists = currentTasks.some((t) => t.id === parentId);
      if (!parentExists) {
        throw new AppError("Tugas induk tidak ditemukan.", "NOT_FOUND");
      }
    }

    const newTask: Omit<TaskItem, "id" | "created_at" | "updated_at"> = {
      user_id: null,
      parent_id: parentId,
      content_plan_id: null,
      title: trimmedTitle,
      description: null,
      sort_order: currentTasks.filter((t) => t.parent_id === parentId).length + 1,
      is_completed: false,
      is_archived: false,
      due_date: null,
    };

    return await taskRepository.createTask({
      id: crypto.randomUUID(),
      ...newTask,
    });
  }

  /**
   * Memperbarui informasi tugas (judul, deskripsi, urutan, dll.).
   * Memvalidasi pencegahan siklus jika parent_id diubah.
   */
  async updateTask(
    id: string,
    updates: Partial<TaskItem>,
    currentTasks: TaskItem[] = []
  ): Promise<TaskItem> {
    if (updates.title !== undefined && !updates.title.trim()) {
      throw new AppError("Judul tugas tidak boleh kosong.", "VALIDATION_ERROR");
    }

    // Validasi pemindahan tugas (cycle prevention & depth limit)
    if (updates.parent_id !== undefined && updates.parent_id !== null) {
      const validation = validateTaskMove(currentTasks, id, updates.parent_id);
      if (!validation.isValid) {
        throw new AppError(validation.errorMessage || "Pemindahan tugas tidak valid.", "INVALID_MOVE");
      }
    }

    return await taskRepository.updateTask(id, updates);
  }

  /**
   * Mengubah status penyelesaian tugas daun (toggle leaf).
   */
  async toggleLeafTask(id: string, currentCompleted: boolean): Promise<TaskItem> {
    return await taskRepository.updateTask(id, {
      is_completed: !currentCompleted,
    });
  }

  /**
   * Mengarsipkan / membuka arsip tugas.
   */
  async toggleArchiveTask(id: string, currentArchived: boolean): Promise<TaskItem> {
    return await taskRepository.updateTask(id, {
      is_archived: !currentArchived,
    });
  }

  /**
   * Cascading complete: menandai seluruh tugas dan keturunannya sebagai selesai.
   */
  async cascadeComplete(parentId: string, currentTasks: TaskItem[]): Promise<TaskItem[]> {
    const updatedTasks = cascadeCompleteTask(currentTasks, parentId);
    
    // Identifikasi task yang statusnya berubah
    const changed = updatedTasks.filter((updated) => {
      const original = currentTasks.find((orig) => orig.id === updated.id);
      return original && original.is_completed !== updated.is_completed;
    });

    if (changed.length > 0) {
      await taskRepository.bulkUpdateTasks(changed);
    }

    return updatedTasks;
  }

  /**
   * Cascading reopen: membuka kembali seluruh tugas dan keturunannya menjadi belum selesai.
   */
  async cascadeReopen(parentId: string, currentTasks: TaskItem[]): Promise<TaskItem[]> {
    const updatedTasks = cascadeReopenTask(currentTasks, parentId);

    // Identifikasi task yang statusnya berubah
    const changed = updatedTasks.filter((updated) => {
      const original = currentTasks.find((orig) => orig.id === updated.id);
      return original && original.is_completed !== updated.is_completed;
    });

    if (changed.length > 0) {
      await taskRepository.bulkUpdateTasks(changed);
    }

    return updatedTasks;
  }

  /**
   * Menghapus tugas (PostgreSQL ON DELETE CASCADE akan otomatis menghapus seluruh anak).
   */
  async deleteTask(id: string): Promise<void> {
    await taskRepository.deleteTask(id);
  }
}

export const taskService = new TaskService();
