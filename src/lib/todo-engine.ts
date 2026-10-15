/**
 * Productivity Studio: Recursive Hierarchical Todo Engine
 * 
 * Implementasi Otoritatif Mesin Todo Bersarang Bebas Kedalaman (Arbitrary Depth)
 * Sesuai Aturan Matematis PRODUCT_SPECIFICATION.md Bab 6 & DATABASE_DESIGN.md Bab 7:
 * - Daun: 0% jika incomplete, 100% jika complete
 * - Induk: Rata-rata bobot setara cabang anak langsung aktif (1/n * sum(progress(C)))
 * - Tugas diarsipkan (is_archived = true) dikeluarkan dari kalkulasi
 * - Pencegahan siklus & validasi kedalaman maksimal 20 level
 */

export interface TaskItem {
  id: string;
  user_id?: string | null;
  parent_id: string | null;
  content_plan_id?: string | null;
  title: string;
  description?: string | null;
  sort_order: number;
  is_completed: boolean;
  is_archived: boolean;
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TaskNode extends TaskItem {
  children: TaskNode[];
  progress: number; // 0.00 s/d 100.00
  effective_completed: boolean;
  is_leaf: boolean;
  depth: number;
}

/**
 * Membangun struktur pohon dari daftar datar (flat list) tasks
 * dan menghitung progres rekursif bottom-up secara on-the-fly O(N).
 */
export function buildTaskTree(tasks: TaskItem[]): TaskNode[] {
  // 1. Buat map seluruh task dengan struktur node dasar
  const nodeMap = new Map<string, TaskNode>();
  for (const t of tasks) {
    nodeMap.set(t.id, {
      ...t,
      children: [],
      progress: t.is_completed ? 100 : 0,
      effective_completed: t.is_completed,
      is_leaf: true,
      depth: 0,
    });
  }

  // 2. Hubungkan relasi anak ke induk
  const rootNodes: TaskNode[] = [];
  for (const t of tasks) {
    const node = nodeMap.get(t.id)!;
    if (t.parent_id && nodeMap.has(t.parent_id)) {
      const parent = nodeMap.get(t.parent_id)!;
      parent.children.push(node);
      parent.is_leaf = false;
    } else {
      rootNodes.push(node);
    }
  }

  // 3. Urutkan anak-anak berdasarkan sort_order
  for (const node of nodeMap.values()) {
    node.children.sort((a, b) => a.sort_order - b.sort_order);
  }
  rootNodes.sort((a, b) => a.sort_order - b.sort_order);

  // 4. Hitung kedalaman (depth) dan kalkulasi progres rekursif bottom-up
  function evaluateNode(node: TaskNode, currentDepth: number): void {
    node.depth = currentDepth;

    // Evaluasi seluruh anak terlebih dahulu (post-order traversal)
    for (const child of node.children) {
      evaluateNode(child, currentDepth + 1);
    }

    // Ambil anak-anak yang aktif (tidak diarsipkan)
    const activeChildren = node.children.filter((c) => !c.is_archived);

    if (activeChildren.length === 0) {
      // Tugas Daun (atau seluruh anak diarsipkan)
      node.is_leaf = true;
      node.progress = node.is_completed ? 100 : 0;
      node.effective_completed = node.is_completed;
    } else {
      // Tugas Induk: Rata-rata bobot setara cabang langsung
      node.is_leaf = false;
      const sum = activeChildren.reduce((acc, c) => acc + c.progress, 0);
      const rawAvg = sum / activeChildren.length;

      // Bulatkan ke 2 desimal secara presisi
      node.progress = Math.round(rawAvg * 100) / 100;
      node.effective_completed = node.progress === 100;
    }
  }

  for (const root of rootNodes) {
    evaluateNode(root, 0);
  }

  return rootNodes;
}

/**
 * Menghitung kedalaman maksimum sub-pohon di bawah sebuah task (downward depth).
 */
export function getSubtreeMaxDepth(tasks: TaskItem[], rootTaskId: string): number {
  const childrenMap = new Map<string, string[]>();
  for (const t of tasks) {
    if (t.parent_id) {
      const list = childrenMap.get(t.parent_id) || [];
      list.push(t.id);
      childrenMap.set(t.parent_id, list);
    }
  }

  function getDepth(id: string): number {
    const children = childrenMap.get(id) || [];
    if (children.length === 0) return 0;
    let maxChildDepth = 0;
    for (const childId of children) {
      maxChildDepth = Math.max(maxChildDepth, getDepth(childId));
    }
    return 1 + maxChildDepth;
  }

  return getDepth(rootTaskId);
}

/**
 * Validasi Pencegahan Siklus & Pembatasan Kedalaman Maksimum (Maks 20 Level).
 * Memeriksa leluhur ke atas DAN akumulasi sub-pohon ke bawah (Resolusi F-03).
 */
export function validateTaskMove(
  tasks: TaskItem[],
  taskId: string,
  targetParentId: string | null,
  maxDepth = 20
): { isValid: boolean; errorMessage?: string } {
  // 1. Pemindahan ke level root selalu aman dari siklus
  if (targetParentId === null) {
    // Namun pastikan sub-pohon tidak melebihi maxDepth jika di root
    const subtreeDepth = getSubtreeMaxDepth(tasks, taskId);
    if (subtreeDepth > maxDepth) {
      return {
        isValid: false,
        errorMessage: `MAX_DEPTH_EXCEEDED: Subtree depth (${subtreeDepth}) exceeds maximum allowed depth (${maxDepth}).`,
      };
    }
    return { isValid: true };
  }

  // 2. Tugas tidak boleh menjadi induk bagi dirinya sendiri
  if (taskId === targetParentId) {
    return {
      isValid: false,
      errorMessage: "CANNOT_SET_SELF_AS_PARENT: Task cannot be its own parent.",
    };
  }

  // 3. Telusuri rantai leluhur dari targetParentId ke atas
  const taskMap = new Map<string, TaskItem>();
  for (const t of tasks) {
    taskMap.set(t.id, t);
  }

  let currentId: string | null = targetParentId;
  let ancestorDepth = 0;

  while (currentId !== null) {
    ancestorDepth++;
    if (ancestorDepth > maxDepth) {
      return {
        isValid: false,
        errorMessage: `MAX_DEPTH_EXCEEDED: Maximum task nesting depth of ${maxDepth} exceeded.`,
      };
    }

    if (currentId === taskId) {
      return {
        isValid: false,
        errorMessage: "CANNOT_REPARENT_TO_DESCENDANT: Target parent is a descendant of this task.",
      };
    }

    const parentTask = taskMap.get(currentId);
    currentId = parentTask?.parent_id ?? null;
  }

  // 4. Validasi gabungan: Kedalaman leluhur + 1 + kedalaman sub-pohon ke bawah
  const subtreeDepth = getSubtreeMaxDepth(tasks, taskId);
  if (ancestorDepth + 1 + subtreeDepth > maxDepth) {
    return {
      isValid: false,
      errorMessage: `MAX_DEPTH_EXCEEDED: Combined total depth (${ancestorDepth + 1 + subtreeDepth}) exceeds ${maxDepth} levels.`,
    };
  }

  return { isValid: true };
}

/**
 * Operasi Cascading Complete: Menandai seluruh daun di bawah node menjadi complete.
 */
export function cascadeCompleteTask<T extends TaskItem>(tasks: T[], parentId: string): T[] {
  const childrenMap = new Map<string, string[]>();
  for (const t of tasks) {
    if (t.parent_id) {
      const list = childrenMap.get(t.parent_id) || [];
      list.push(t.id);
      childrenMap.set(t.parent_id, list);
    }
  }

  const descendantIds = new Set<string>();
  function collectDescendants(id: string) {
    const children = childrenMap.get(id) || [];
    for (const childId of children) {
      descendantIds.add(childId);
      collectDescendants(childId);
    }
  }
  collectDescendants(parentId);

  return tasks.map((t) => {
    if (t.id === parentId || descendantIds.has(t.id)) {
      return { ...t, is_completed: true };
    }
    return t;
  });
}

/**
 * Operasi Cascading Reopen (Resolusi F-02): Membuka kembali seluruh sub-tugas di bawah node.
 */
export function cascadeReopenTask<T extends TaskItem>(tasks: T[], parentId: string): T[] {
  const childrenMap = new Map<string, string[]>();
  for (const t of tasks) {
    if (t.parent_id) {
      const list = childrenMap.get(t.parent_id) || [];
      list.push(t.id);
      childrenMap.set(t.parent_id, list);
    }
  }

  const descendantIds = new Set<string>();
  function collectDescendants(id: string) {
    const children = childrenMap.get(id) || [];
    for (const childId of children) {
      descendantIds.add(childId);
      collectDescendants(childId);
    }
  }
  collectDescendants(parentId);

  return tasks.map((t) => {
    if (t.id === parentId || descendantIds.has(t.id)) {
      return { ...t, is_completed: false };
    }
    return t;
  });
}
