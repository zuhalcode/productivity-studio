"use client";

import { useState, useEffect, useCallback } from "react";
import { nicheService } from "@/lib/services/niche.service";
import { NicheProfile } from "@/types/database";
import { normalizeSupabaseError } from "@/lib/supabase/errors";

export function useNiche() {
  const [profile, setProfile] = useState<NicheProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await nicheService.getNicheProfile();
      setProfile(data);
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal memuat profil niche");
      setError(appErr.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async (updates: Partial<NicheProfile>): Promise<NicheProfile> => {
    if (!profile) throw new Error("Profil belum dimuat.");
    setIsSaving(true);
    setError(null);
    try {
      const updated = await nicheService.saveNicheProfile({
        ...profile,
        ...updates,
        id: profile.id,
      });
      setProfile(updated);
      return updated;
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal menyimpan profil niche");
      setError(appErr.message);
      throw appErr;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profile,
    isLoading,
    isSaving,
    error,
    saveProfile,
    refetch: fetchProfile,
  };
}
