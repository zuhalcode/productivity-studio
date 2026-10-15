/**
 * Productivity Studio: Centralized Error Normalization
 * 
 * Mengonversi error dari Supabase PostgreSQL / jaringan menjadi AppError yang aman,
 * informatif, dan tidak membocorkan detail sensitif ke antarmuka pengguna.
 */

export interface SupabaseErrorLike {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly originalError?: unknown;
  public readonly isOperational: boolean;

  constructor(message: string, code = "APP_ERROR", originalError?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.originalError = originalError;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function normalizeSupabaseError(error: unknown, fallbackMessage = "Terjadi kesalahan saat memproses data"): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (!error) {
    return new AppError(fallbackMessage, "UNKNOWN_ERROR");
  }

  const err = error as SupabaseErrorLike;
  const rawMessage = typeof err.message === "string" ? err.message : "";
  const code = typeof err.code === "string" ? err.code : "DB_ERROR";

  // 1. Deteksi Exception Trigger Kustom dari PostgreSQL
  if (rawMessage.includes("CIRCULAR_REFERENCE_DETECTED")) {
    return new AppError("Tidak dapat memindahkan tugas ke dalam cabangnya sendiri (siklus terdeteksi).", "CIRCULAR_REFERENCE", error);
  }
  if (rawMessage.includes("CANNOT_SET_SELF_AS_PARENT")) {
    return new AppError("Tugas tidak dapat dijadikan induk untuk dirinya sendiri.", "SELF_PARENT_ERROR", error);
  }
  if (rawMessage.includes("MAX_DEPTH_EXCEEDED")) {
    return new AppError("Batas kedalaman sarang tugas maksimal 20 level telah tercapai.", "MAX_DEPTH_EXCEEDED", error);
  }
  if (rawMessage.includes("CANNOT_MODIFY_SYSTEM_RECORD")) {
    return new AppError("Template sistem bawaan dilindungi dan tidak dapat diubah atau dihapus.", "PROTECTED_SYSTEM_RECORD", error);
  }

  // 2. Kode Error Standar PostgreSQL
  switch (code) {
    case "23505": // Unique violation
      return new AppError("Data dengan identifikasi ini sudah ada di dalam sistem.", "DUPLICATE_KEY", error);
    case "23503": // Foreign key violation
      return new AppError("Data induk atau referensi yang dituju tidak ditemukan.", "FOREIGN_KEY_VIOLATION", error);
    case "23514": // Check constraint violation
      return new AppError("Format atau nilai data yang dimasukkan tidak memenuhi aturan validasi.", "CHECK_VIOLATION", error);
    case "42501": // RLS / Permission denied
      return new AppError("Akses ditolak oleh kebijakan keamanan data (Row Level Security).", "PERMISSION_DENIED", error);
    case "PGRST116": // PostgREST row count error (e.g. single() found 0 rows)
      return new AppError("Data yang dicari tidak ditemukan.", "NOT_FOUND", error);
  }

  // 3. Network or connection errors
  if (rawMessage.includes("Failed to fetch") || rawMessage.includes("NetworkError")) {
    return new AppError("Gagal menghubungi server basis data. Periksa koneksi internet atau server Supabase lokal.", "NETWORK_ERROR", error);
  }

  return new AppError(rawMessage || fallbackMessage, code, error);
}
