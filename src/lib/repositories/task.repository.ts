import { supabase } from "@/lib/supabase/client";
import { TaskItem } from "@/types/database";
import { normalizeSupabaseError } from "@/lib/supabase/errors";

export class TaskRepository {
  /**
   * Mengambil seluruh data tugas.
   */
  async getTasks(): Promise<TaskItem[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      throw normalizeSupabaseError(error, "Gagal memuat daftar tugas");
    }

    return (data as TaskItem[]) || [];
  }

  /**
   * Membuat tugas baru (akar atau sub-tugas).
   */
  async createTask(
    task: Omit<TaskItem, "id" | "created_at" | "updated_at"> & { id?: string }
  ): Promise<TaskItem> {
    const payload = {
      ...task,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw normalizeSupabaseError(error, "Gagal menambahkan tugas baru");
    }

    return data as TaskItem;
  }

  /**
   * Memperbarui atribut tugas tunggal (judul, status selesai, arsip, urutan, dll.).
   */
  async updateTask(id: string, updates: Partial<TaskItem>): Promise<TaskItem> {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("tasks")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw normalizeSupabaseError(error, "Gagal memperbarui data tugas");
    }

    return data as TaskItem;
  }

  /**
   * Memperbarui beberapa tugas sekaligus (misalnya kaskade complete/reopen atau reordering).
   */
  async bulkUpdateTasks(tasks: Array<Partial<TaskItem> & { id: string }>): Promise<void> {
    if (tasks.length === 0) return;

    const timestamp = new Date().toISOString();
    const payload = tasks.map((t) => ({
      ...t,
      updated_at: timestamp,
    }));

    const { error } = await supabase
      .from("tasks")
      .upsert(payload);

    if (error) {
      throw normalizeSupabaseError(error, "Gagal memperbarui status kelompok tugas");
    }
  }

  /**
   * Menghapus tugas.
   * Catatan: PostgreSQL ON DELETE CASCADE akan otomatis menghapus seluruh keturunan di basis data.
   */
  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) {
      throw normalizeSupabaseError(error, "Gagal menghapus tugas");
    }
  }

  /**
   * Menghapus seluruh tugas dari basis data Supabase.
   */
  async deleteAllTasks(): Promise<void> {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      throw normalizeSupabaseError(error, "Gagal mengosongkan daftar tugas");
    }
  }
}

export const taskRepository = new TaskRepository();
