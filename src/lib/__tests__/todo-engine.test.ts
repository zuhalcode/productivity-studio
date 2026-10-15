import { describe, it, expect } from "vitest";
import {
  TaskItem,
  buildTaskTree,
  validateTaskMove,
  cascadeCompleteTask,
  cascadeReopenTask,
  getDueDateStatus,
  validateTaskDates,
  formatTaskDate,
  getTodayLocalDateString,
} from "../todo-engine";

describe("Recursive Hierarchical Todo Engine — Formal Acceptance Test Suite (T-01 s/d T-11)", () => {
  // --------------------------------------------------------------------------
  // T-01: Standalone Incomplete
  // --------------------------------------------------------------------------
  it("T-01: Standalone Incomplete — Task mandiri belum selesai harus berprogres 0.00%", () => {
    const tasks: TaskItem[] = [
      {
        id: "T1",
        parent_id: null,
        title: "Tugas Mandiri Incomplete",
        sort_order: 1,
        is_completed: false,
        is_archived: false,
      },
    ];

    const tree = buildTaskTree(tasks);
    expect(tree).toHaveLength(1);
    expect(tree[0].progress).toBe(0);
    expect(tree[0].effective_completed).toBe(false);
    expect(tree[0].is_leaf).toBe(true);
  });

  // --------------------------------------------------------------------------
  // T-02: Standalone Complete
  // --------------------------------------------------------------------------
  it("T-02: Standalone Complete — Task mandiri selesai harus berprogres 100.00%", () => {
    const tasks: TaskItem[] = [
      {
        id: "T2",
        parent_id: null,
        title: "Tugas Mandiri Complete",
        sort_order: 1,
        is_completed: true,
        is_archived: false,
      },
    ];

    const tree = buildTaskTree(tasks);
    expect(tree).toHaveLength(1);
    expect(tree[0].progress).toBe(100);
    expect(tree[0].effective_completed).toBe(true);
    expect(tree[0].is_leaf).toBe(true);
  });

  // --------------------------------------------------------------------------
  // T-03: Parent dengan 3 Anak Daun
  // --------------------------------------------------------------------------
  it("T-03: Parent dengan 3 Anak Daun — Rata-rata cabang (100% + 0% + 0%) / 3 = 33.33%", () => {
    const tasks: TaskItem[] = [
      {
        id: "P",
        parent_id: null,
        title: "Parent P",
        sort_order: 1,
        is_completed: false,
        is_archived: false,
      },
      {
        id: "C1",
        parent_id: "P",
        title: "Child C1 (Selesai)",
        sort_order: 1,
        is_completed: true,
        is_archived: false,
      },
      {
        id: "C2",
        parent_id: "P",
        title: "Child C2 (Belum)",
        sort_order: 2,
        is_completed: false,
        is_archived: false,
      },
      {
        id: "C3",
        parent_id: "P",
        title: "Child C3 (Belum)",
        sort_order: 3,
        is_completed: false,
        is_archived: false,
      },
    ];

    const tree = buildTaskTree(tasks);
    expect(tree).toHaveLength(1);
    const parent = tree[0];
    expect(parent.children).toHaveLength(3);
    expect(parent.progress).toBe(33.33);
    expect(parent.effective_completed).toBe(false);
    expect(parent.is_leaf).toBe(false);
  });

  // --------------------------------------------------------------------------
  // T-04: Parent dengan Anak Bersarang (Contoh Otoritatif Spesifikasi)
  // --------------------------------------------------------------------------
  it("T-04: Parent dengan Anak Bersarang — A -> (A1, A2); A1 -> (A1a=100%, A1b=0%); A2=0% => A1=50%, A=25%", () => {
    const tasks: TaskItem[] = [
      {
        id: "A",
        parent_id: null,
        title: "Task A",
        sort_order: 1,
        is_completed: false,
        is_archived: false,
      },
      {
        id: "A1",
        parent_id: "A",
        title: "Task A1",
        sort_order: 1,
        is_completed: false,
        is_archived: false,
      },
      {
        id: "A2",
        parent_id: "A",
        title: "Task A2",
        sort_order: 2,
        is_completed: false,
        is_archived: false,
      },
      {
        id: "A1a",
        parent_id: "A1",
        title: "Task A1a",
        sort_order: 1,
        is_completed: true,
        is_archived: false,
      },
      {
        id: "A1b",
        parent_id: "A1",
        title: "Task A1b",
        sort_order: 2,
        is_completed: false,
        is_archived: false,
      },
    ];

    const tree = buildTaskTree(tasks);
    const taskA = tree[0];
    const taskA1 = taskA.children[0];
    const taskA2 = taskA.children[1];

    expect(taskA1.progress).toBe(50.0);
    expect(taskA2.progress).toBe(0.0);
    expect(taskA.progress).toBe(25.0);
  });

  // --------------------------------------------------------------------------
  // T-05: Kedalaman 4 Level Bersarang
  // --------------------------------------------------------------------------
  it("T-05: Kedalaman 4 Level Bersarang — L1 -> L2 -> L3 -> L4 (L4=100%, L3b=0%, L2b=100%)", () => {
    const tasks: TaskItem[] = [
      { id: "L1", parent_id: null, title: "L1", sort_order: 1, is_completed: false, is_archived: false },
      { id: "L2", parent_id: "L1", title: "L2", sort_order: 1, is_completed: false, is_archived: false },
      { id: "L2b", parent_id: "L1", title: "L2b (Selesai)", sort_order: 2, is_completed: true, is_archived: false },
      { id: "L3", parent_id: "L2", title: "L3", sort_order: 1, is_completed: false, is_archived: false },
      { id: "L3b", parent_id: "L2", title: "L3b (Belum)", sort_order: 2, is_completed: false, is_archived: false },
      { id: "L4", parent_id: "L3", title: "L4 (Selesai)", sort_order: 1, is_completed: true, is_archived: false },
    ];

    const tree = buildTaskTree(tasks);
    const l1 = tree[0];
    const l2 = l1.children.find((c) => c.id === "L2")!;
    const l2b = l1.children.find((c) => c.id === "L2b")!;
    const l3 = l2.children.find((c) => c.id === "L3")!;
    const l4 = l3.children.find((c) => c.id === "L4")!;

    expect(l4.progress).toBe(100.0);
    expect(l3.progress).toBe(100.0); // L3 hanya punya 1 anak (L4=100%) -> (100)/1 = 100%
    // L2 punya L3 (100%) dan L3b (0%) -> (100 + 0) / 2 = 50%
    expect(l2.progress).toBe(50.0);
    expect(l2b.progress).toBe(100.0);
    // L1 punya L2 (50%) dan L2b (100%) -> (50 + 100) / 2 = 75%
    expect(l1.progress).toBe(75.0);
  });

  // --------------------------------------------------------------------------
  // T-06: Centang & Buka di Level Terdalam
  // --------------------------------------------------------------------------
  it("T-06: Centang & Buka di Level Terdalam — Transisi beruntun dari T-04", () => {
    let tasks: TaskItem[] = [
      { id: "A", parent_id: null, title: "A", sort_order: 1, is_completed: false, is_archived: false },
      { id: "A1", parent_id: "A", title: "A1", sort_order: 1, is_completed: false, is_archived: false },
      { id: "A2", parent_id: "A", title: "A2", sort_order: 2, is_completed: false, is_archived: false },
      { id: "A1a", parent_id: "A1", title: "A1a", sort_order: 1, is_completed: true, is_archived: false },
      { id: "A1b", parent_id: "A1", title: "A1b", sort_order: 2, is_completed: false, is_archived: false },
    ];

    // Kondisi awal
    let tree = buildTaskTree(tasks);
    expect(tree[0].progress).toBe(25.0);

    // Langkah 1: Selesaikan A1b
    tasks = tasks.map((t) => (t.id === "A1b" ? { ...t, is_completed: true } : t));
    tree = buildTaskTree(tasks);
    let taskA = tree[0];
    let taskA1 = taskA.children[0];
    expect(taskA1.progress).toBe(100.0);
    expect(taskA.progress).toBe(50.0);

    // Langkah 2: Selesaikan A2
    tasks = tasks.map((t) => (t.id === "A2" ? { ...t, is_completed: true } : t));
    tree = buildTaskTree(tasks);
    taskA = tree[0];
    expect(taskA.progress).toBe(100.0);
    expect(taskA.effective_completed).toBe(true);

    // Langkah 3: Buka kembali A1a
    tasks = tasks.map((t) => (t.id === "A1a" ? { ...t, is_completed: false } : t));
    tree = buildTaskTree(tasks);
    taskA = tree[0];
    taskA1 = taskA.children[0];
    expect(taskA1.progress).toBe(50.0);
    expect(taskA.progress).toBe(75.0);
    expect(taskA.effective_completed).toBe(false);
  });

  // --------------------------------------------------------------------------
  // T-07: Tambah & Hapus Keturunan
  // --------------------------------------------------------------------------
  it("T-07: Tambah & Hapus Keturunan — P (C1=100%) => 100%, +C2(0%) => 50%, -C2 => 100%", () => {
    let tasks: TaskItem[] = [
      { id: "P", parent_id: null, title: "P", sort_order: 1, is_completed: false, is_archived: false },
      { id: "C1", parent_id: "P", title: "C1", sort_order: 1, is_completed: true, is_archived: false },
    ];

    let tree = buildTaskTree(tasks);
    expect(tree[0].progress).toBe(100.0);

    // Tambah C2 (0%)
    tasks.push({
      id: "C2",
      parent_id: "P",
      title: "C2",
      sort_order: 2,
      is_completed: false,
      is_archived: false,
    });
    tree = buildTaskTree(tasks);
    expect(tree[0].progress).toBe(50.0);

    // Hapus C2
    tasks = tasks.filter((t) => t.id !== "C2");
    tree = buildTaskTree(tasks);
    expect(tree[0].progress).toBe(100.0);
  });

  // --------------------------------------------------------------------------
  // T-08: Pemindahan Subtree Antar Induk
  // --------------------------------------------------------------------------
  it("T-08: Pemindahan Subtree Antar Induk — Reparenting memicu perhitungan ulang kedua pohon", () => {
    let tasks: TaskItem[] = [
      { id: "P1", parent_id: null, title: "P1", sort_order: 1, is_completed: false, is_archived: false },
      { id: "C1", parent_id: "P1", title: "C1 (100%)", sort_order: 1, is_completed: true, is_archived: false },
      { id: "S", parent_id: "P1", title: "Subtree S", sort_order: 2, is_completed: false, is_archived: false },
      { id: "S1", parent_id: "S", title: "S1 (100%)", sort_order: 1, is_completed: true, is_archived: false },
      { id: "S2", parent_id: "S", title: "S2 (0%)", sort_order: 2, is_completed: false, is_archived: false },

      { id: "P2", parent_id: null, title: "P2", sort_order: 2, is_completed: false, is_archived: false },
      { id: "C2", parent_id: "P2", title: "C2 (0%)", sort_order: 1, is_completed: false, is_archived: false },
    ];

    // Kondisi awal: S = (100+0)/2 = 50%. P1 = (100 + 50)/2 = 75%. P2 = 0%.
    let tree = buildTaskTree(tasks);
    let p1 = tree.find((t) => t.id === "P1")!;
    let p2 = tree.find((t) => t.id === "P2")!;
    expect(p1.progress).toBe(75.0);
    expect(p2.progress).toBe(0.0);

    // Pindahkan S ke bawah P2
    const validation = validateTaskMove(tasks, "S", "P2");
    expect(validation.isValid).toBe(true);

    tasks = tasks.map((t) => (t.id === "S" ? { ...t, parent_id: "P2" } : t));
    tree = buildTaskTree(tasks);
    p1 = tree.find((t) => t.id === "P1")!;
    p2 = tree.find((t) => t.id === "P2")!;

    // P1 sekarang hanya punya C1 (100%) -> P1 = 100%
    expect(p1.progress).toBe(100.0);
    // P2 sekarang punya C2 (0%) dan S (50%) -> P2 = (0 + 50)/2 = 25%
    expect(p2.progress).toBe(25.0);
  });

  // --------------------------------------------------------------------------
  // T-09: Penolakan Referensi Sirkular
  // --------------------------------------------------------------------------
  it("T-09: Penolakan Referensi Sirkular — Rantai A -> B -> C menolak A.parent_id = C dan self-parent", () => {
    const tasks: TaskItem[] = [
      { id: "A", parent_id: null, title: "A", sort_order: 1, is_completed: false, is_archived: false },
      { id: "B", parent_id: "A", title: "B", sort_order: 1, is_completed: false, is_archived: false },
      { id: "C", parent_id: "B", title: "C", sort_order: 1, is_completed: false, is_archived: false },
    ];

    // Coba jadikan C sebagai induk bagi A (sirkular)
    const circularCheck = validateTaskMove(tasks, "A", "C");
    expect(circularCheck.isValid).toBe(false);
    expect(circularCheck.errorMessage).toContain("CANNOT_REPARENT_TO_DESCENDANT");

    // Coba jadikan A sebagai induk bagi dirinya sendiri
    const selfParentCheck = validateTaskMove(tasks, "A", "A");
    expect(selfParentCheck.isValid).toBe(false);
    expect(selfParentCheck.errorMessage).toContain("CANNOT_SET_SELF_AS_PARENT");
  });

  // --------------------------------------------------------------------------
  // T-10: Induk Kosong Pasca Penghapusan
  // --------------------------------------------------------------------------
  it("T-10: Induk Kosong Pasca Penghapusan — Parent P kembali menjadi daun dengan progres 0.00% tanpa NaN", () => {
    let tasks: TaskItem[] = [
      { id: "P", parent_id: null, title: "Parent P", sort_order: 1, is_completed: false, is_archived: false },
      { id: "C1", parent_id: "P", title: "Child C1", sort_order: 1, is_completed: false, is_archived: false },
    ];

    let tree = buildTaskTree(tasks);
    expect(tree[0].is_leaf).toBe(false);
    expect(tree[0].progress).toBe(0.0);

    // Hapus anak C1
    tasks = tasks.filter((t) => t.id !== "C1");
    tree = buildTaskTree(tasks);

    expect(tree[0].is_leaf).toBe(true);
    expect(tree[0].progress).toBe(0.0);
    expect(Number.isNaN(tree[0].progress)).toBe(false);
  });

  // --------------------------------------------------------------------------
  // T-11: Konsistensi Progres Pasca Reload
  // --------------------------------------------------------------------------
  it("T-11: Konsistensi Progres Pasca Reload — Serialisasi JSON/database flush menghasilkan angka 100% identik", () => {
    const complexTasks: TaskItem[] = [
      { id: "R1", parent_id: null, title: "Riset Pasar", sort_order: 1, is_completed: false, is_archived: false },
      { id: "R1_1", parent_id: "R1", title: "Riset Google Trends", sort_order: 1, is_completed: true, is_archived: false },
      { id: "R1_2", parent_id: "R1", title: "Riset Komentar Kompetitor", sort_order: 2, is_completed: false, is_archived: false },
      
      { id: "R2", parent_id: null, title: "Batch Scripting", sort_order: 2, is_completed: false, is_archived: false },
      { id: "R2_1", parent_id: "R2", title: "Naskah Video 1", sort_order: 1, is_completed: true, is_archived: false },
      { id: "R2_2", parent_id: "R2", title: "Naskah Video 2", sort_order: 2, is_completed: true, is_archived: false },
      { id: "R2_3", parent_id: "R2", title: "Naskah Video 3", sort_order: 3, is_completed: false, is_archived: false },
      { id: "R2_3_1", parent_id: "R2_3", title: "Hook Draft", sort_order: 1, is_completed: true, is_archived: false },
      { id: "R2_3_2", parent_id: "R2_3", title: "Payoff Draft", sort_order: 2, is_completed: false, is_archived: false },
    ];

    // Kalkulasi awal
    const tree1 = buildTaskTree(complexTasks);

    // Simulasi serialize -> deserialize (Reload dari PostgreSQL/JSON)
    const serialized = JSON.stringify(complexTasks);
    const reloadedTasks: TaskItem[] = JSON.parse(serialized);
    const tree2 = buildTaskTree(reloadedTasks);

    expect(tree1.length).toBe(tree2.length);
    for (let i = 0; i < tree1.length; i++) {
      expect(tree1[i].progress).toBe(tree2[i].progress);
      expect(tree1[i].effective_completed).toBe(tree2[i].effective_completed);
    }
  });

  // --------------------------------------------------------------------------
  // Ekstra: Cascading Completion & Cascading Reopen (Resolusi F-02)
  // --------------------------------------------------------------------------
  it("Cascading Complete & Reopen — Menandai induk secara kaskade mengubah seluruh daun", () => {
    let tasks: TaskItem[] = [
      { id: "P", parent_id: null, title: "Parent", sort_order: 1, is_completed: false, is_archived: false },
      { id: "C1", parent_id: "P", title: "C1", sort_order: 1, is_completed: false, is_archived: false },
      { id: "C2", parent_id: "P", title: "C2", sort_order: 2, is_completed: false, is_archived: false },
    ];

    // Cascade complete
    tasks = cascadeCompleteTask(tasks, "P");
    let tree = buildTaskTree(tasks);
    expect(tree[0].progress).toBe(100.0);
    expect(tree[0].effective_completed).toBe(true);

    // Cascade reopen
    tasks = cascadeReopenTask(tasks, "P");
    tree = buildTaskTree(tasks);
    expect(tree[0].progress).toBe(0.0);
    expect(tree[0].effective_completed).toBe(false);
  });

  // --------------------------------------------------------------------------
  // T-12: Due Date Status Derivations
  // --------------------------------------------------------------------------
  describe("T-12: Due Date Status Derivations", () => {
    const referenceDate = "2026-10-15";

    it("Mengidentifikasi tugas belum selesai yang melewati tenggat sebagai 'overdue'", () => {
      const status = getDueDateStatus("2026-10-14", false, referenceDate);
      expect(status).toBe("overdue");
    });

    it("Mengidentifikasi tugas belum selesai yang jatuh tempo hari ini sebagai 'due-today'", () => {
      const status = getDueDateStatus("2026-10-15", false, referenceDate);
      expect(status).toBe("due-today");
    });

    it("Mengidentifikasi tugas dengan tenggat masa depan sebagai 'upcoming'", () => {
      const status = getDueDateStatus("2026-10-20", false, referenceDate);
      expect(status).toBe("upcoming");
    });

    it("Tugas tanpa due_date mengembalikan status 'none'", () => {
      expect(getDueDateStatus(null, false, referenceDate)).toBe("none");
      expect(getDueDateStatus("", false, referenceDate)).toBe("none");
      expect(getDueDateStatus(undefined, false, referenceDate)).toBe("none");
    });

    it("Tugas yang sudah SELESAI tidak pernah berstatus 'overdue' meskipun tanggalnya terlewat", () => {
      const status = getDueDateStatus("2026-10-10", true, referenceDate);
      expect(status).not.toBe("overdue");
      expect(status).toBe("none");
    });

    it("Tugas yang sudah SELESAI tidak pernah berstatus 'due-today'", () => {
      const status = getDueDateStatus("2026-10-15", true, referenceDate);
      expect(status).not.toBe("due-today");
      expect(status).toBe("none");
    });

    it("Hanya start_date yang terlewat tanpa due_date tidak menjadikan tugas 'overdue'", () => {
      // getDueDateStatus hanya memeriksa due_date
      const status = getDueDateStatus(null, false, referenceDate);
      expect(status).toBe("none");
    });
  });

  // --------------------------------------------------------------------------
  // T-13: Date Ordering & Format Validation
  // --------------------------------------------------------------------------
  describe("T-13: Date Ordering & Format Validation", () => {
    it("Valid jika start_date <= due_date", () => {
      expect(validateTaskDates("2026-10-10", "2026-10-15").isValid).toBe(true);
      expect(validateTaskDates("2026-10-15", "2026-10-15").isValid).toBe(true);
    });

    it("Valid jika hanya start_date atau hanya due_date atau keduanya null", () => {
      expect(validateTaskDates("2026-10-10", null).isValid).toBe(true);
      expect(validateTaskDates(null, "2026-10-15").isValid).toBe(true);
      expect(validateTaskDates(null, null).isValid).toBe(true);
    });

    it("Menolak jika start_date > due_date", () => {
      const result = validateTaskDates("2026-10-20", "2026-10-15");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("Tanggal mulai tidak boleh melebihi batas waktu");
    });

    it("Menolak format tanggal selain YYYY-MM-DD", () => {
      expect(validateTaskDates("15-10-2026", "2026-10-20").isValid).toBe(false);
      expect(validateTaskDates("2026/10/10", "2026-10-20").isValid).toBe(false);
      expect(validateTaskDates("2026-10-10", "invalid-date").isValid).toBe(false);
    });

    it("formatTaskDate memformat tanggal ke bahasa yang ramah", () => {
      const formatted = formatTaskDate("2026-10-15");
      expect(formatted).toContain("15 Okt");
    });
  });

  // --------------------------------------------------------------------------
  // T-14: Hierarchy & Mathematical Non-Interference
  // --------------------------------------------------------------------------
  describe("T-14: Hierarchy & Mathematical Non-Interference", () => {
    it("Keberadaan start_date, due_date, dan notes tidak mengubah kalkulasi bobot pohon rekursif", () => {
      const tasksWithMeta: TaskItem[] = [
        {
          id: "P1",
          parent_id: null,
          title: "Sprint Produksi Konten",
          notes: "Catatan sprint mingguan batch produksi",
          start_date: "2026-10-01",
          due_date: "2026-10-31",
          sort_order: 1,
          is_completed: false,
          is_archived: false,
        },
        {
          id: "C1",
          parent_id: "P1",
          title: "Riset Hook",
          notes: "Pilih 3 dari template",
          start_date: "2026-10-01",
          due_date: "2026-10-05",
          sort_order: 1,
          is_completed: true,
          is_archived: false,
        },
        {
          id: "C2",
          parent_id: "P1",
          title: "Tulis Naskah",
          notes: null,
          start_date: "2026-10-06",
          due_date: "2026-10-10",
          sort_order: 2,
          is_completed: false,
          is_archived: false,
        },
      ];

      const tree = buildTaskTree(tasksWithMeta);
      expect(tree).toHaveLength(1);
      const root = tree[0];

      // Progres harus tetap (100 + 0) / 2 = 50.00%
      expect(root.progress).toBe(50.0);
      expect(root.effective_completed).toBe(false);
      expect(root.is_leaf).toBe(false);

      // Metadata tanggal & catatan tetap terjaga pada node
      expect(root.notes).toBe("Catatan sprint mingguan batch produksi");
      expect(root.due_date).toBe("2026-10-31");
      expect(root.children[0].notes).toBe("Pilih 3 dari template");
      expect(root.children[0].start_date).toBe("2026-10-01");
      expect(root.children[0].due_date).toBe("2026-10-05");
    });
  });
});

