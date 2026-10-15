"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { taskService } from "@/lib/services/task.service";
import { TaskItem, TaskNode, buildTaskTree } from "@/lib/todo-engine";
import { normalizeSupabaseError } from "@/lib/supabase/errors";

export function useTasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal memuat pohon tugas");
      setError(appErr.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Bangun struktur pohon on-the-fly secara reaktif
  const taskTree = useMemo(() => buildTaskTree(tasks), [tasks]);

  const createTask = async (title: string, parentId: string | null = null): Promise<TaskItem> => {
    setIsSaving(true);
    setError(null);
    try {
      const created = await taskService.createTask(title, parentId, tasks);
      setTasks((prev) => [...prev, created]);
      return created;
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal membuat tugas");
      setError(appErr.message);
      throw appErr;
    } finally {
      setIsSaving(false);
    }
  };

  const updateTask = async (id: string, updates: Partial<TaskItem>): Promise<TaskItem> => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await taskService.updateTask(id, updates, tasks);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal memperbarui tugas");
      setError(appErr.message);
      throw appErr;
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLeaf = async (task: TaskNode): Promise<TaskItem> => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await taskService.toggleLeafTask(task.id, task.is_completed);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      return updated;
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal mengubah status tugas");
      setError(appErr.message);
      throw appErr;
    } finally {
      setIsSaving(false);
    }
  };

  const toggleArchive = async (task: TaskNode): Promise<TaskItem> => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await taskService.toggleArchiveTask(task.id, task.is_archived);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      return updated;
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal mengarsipkan tugas");
      setError(appErr.message);
      throw appErr;
    } finally {
      setIsSaving(false);
    }
  };

  const cascadeComplete = async (task: TaskNode): Promise<void> => {
    setIsSaving(true);
    setError(null);
    try {
      const updatedList = await taskService.cascadeComplete(task.id, tasks);
      setTasks(updatedList);
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal menyelesaikan seluruh sub-tugas");
      setError(appErr.message);
      throw appErr;
    } finally {
      setIsSaving(false);
    }
  };

  const cascadeReopen = async (task: TaskNode): Promise<void> => {
    setIsSaving(true);
    setError(null);
    try {
      const updatedList = await taskService.cascadeReopen(task.id, tasks);
      setTasks(updatedList);
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal membuka kembali sub-tugas");
      setError(appErr.message);
      throw appErr;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTask = async (task: TaskNode): Promise<void> => {
    setIsSaving(true);
    setError(null);
    try {
      await taskService.deleteTask(task.id);
      
      // Hapus task dan seluruh keturunannya dari state lokal
      const idsToDelete = new Set<string>();
      function collect(node: TaskNode) {
        idsToDelete.add(node.id);
        node.children.forEach(collect);
      }
      collect(task);

      setTasks((prev) => prev.filter((t) => !idsToDelete.has(t.id)));
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal menghapus tugas");
      setError(appErr.message);
      throw appErr;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    tasks,
    taskTree,
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
    refetch: fetchTasks,
  };
}
