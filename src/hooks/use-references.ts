"use client";

import { useState, useEffect, useCallback } from "react";
import { referenceService } from "@/lib/services/reference.service";
import {
  HookTemplateRow,
  IdeaTemplateRow,
  CtaTemplateRow,
  ToolReferenceRow,
  GlossaryTermRow,
} from "@/types/database";
import { normalizeSupabaseError } from "@/lib/supabase/errors";

export function useReferences() {
  const [hooks, setHooks] = useState<HookTemplateRow[]>([]);
  const [ideas, setIdeas] = useState<IdeaTemplateRow[]>([]);
  const [ctas, setCtas] = useState<CtaTemplateRow[]>([]);
  const [tools, setTools] = useState<ToolReferenceRow[]>([]);
  const [glossary, setGlossary] = useState<GlossaryTermRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHooks = useCallback(async (category?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await referenceService.getHooks(category);
      setHooks(data);
      return data;
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal memuat hook");
      setError(appErr.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchIdeas = useCallback(async (niche?: string, funnel?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await referenceService.getIdeas(niche, funnel);
      setIdeas(data);
      return data;
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal memuat ide konten");
      setError(appErr.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCtas = useCallback(async (category?: string, ctaType?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await referenceService.getCtas(category, ctaType);
      setCtas(data);
      return data;
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal memuat CTA");
      setError(appErr.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTools = useCallback(async (phase?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await referenceService.getTools(phase);
      setTools(data);
      return data;
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal memuat tools");
      setError(appErr.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchGlossary = useCallback(async (category?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await referenceService.getGlossary(category);
      setGlossary(data);
      return data;
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal memuat glosarium");
      setError(appErr.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCustomHook = async (
    templateText: string,
    exampleText: string,
    category: string,
    platform?: string
  ): Promise<HookTemplateRow> => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await referenceService.createCustomHook(templateText, exampleText, category, platform);
      setHooks((prev) => [created, ...prev]);
      return created;
    } catch (err: unknown) {
      const appErr = normalizeSupabaseError(err, "Gagal menambahkan hook kustom");
      setError(appErr.message);
      throw appErr;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hooks,
    ideas,
    ctas,
    tools,
    glossary,
    isLoading,
    error,
    fetchHooks,
    fetchIdeas,
    fetchCtas,
    fetchTools,
    fetchGlossary,
    createCustomHook,
  };
}
