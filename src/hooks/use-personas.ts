"use client";

import { useState, useEffect, useCallback } from "react";
import { personaService } from "@/lib/services/persona.service";
import { AudiencePersona } from "@/types/database";
import { normalizeSupabaseError } from "@/lib/supabase/errors";

export function usePersonas() {
  const [personas, setPersonas] = useState<AudiencePersona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await personaService.getPersonas();
      setPersonas(data);
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal memuat persona audiens");
      setError(appErr.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  const createPersona = async (
    data: Omit<AudiencePersona, "id" | "created_at" | "updated_at">
  ): Promise<AudiencePersona> => {
    setIsSaving(true);
    setError(null);
    try {
      const created = await personaService.createPersona(data);
      setPersonas((prev) => [...prev, created]);
      return created;
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal menambahkan persona audiens");
      setError(appErr.message);
      throw appErr;
    } finally {
      setIsSaving(false);
    }
  };

  const updatePersona = async (
    id: string,
    updates: Partial<AudiencePersona>
  ): Promise<AudiencePersona> => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await personaService.updatePersona(id, updates);
      setPersonas((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal memperbarui persona audiens");
      setError(appErr.message);
      throw appErr;
    } finally {
      setIsSaving(false);
    }
  };

  const deletePersona = async (id: string): Promise<void> => {
    setIsSaving(true);
    setError(null);
    try {
      await personaService.deletePersona(id, personas.length);
      setPersonas((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal menghapus persona audiens");
      setError(appErr.message);
      throw appErr;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    personas,
    isLoading,
    isSaving,
    error,
    createPersona,
    updatePersona,
    deletePersona,
    refetch: fetchPersonas,
  };
}
