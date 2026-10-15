/**
 * Productivity Studio: Database & Domain Models Type Definitions
 * 
 * Sesuai dengan spesifikasi DATABASE_DESIGN.md dan migrasi Supabase PostgreSQL 15+.
 */

// ==========================================
// 1. Niche Profile & Ikigai Content Strategist
// ==========================================
export type StrategyStatus = "draft" | "completed" | "archived";

export interface IkigaiData {
  love_topics: string[];
  skill_topics: string[];
  market_needs: string[];
  monetizable: string[];
}

export interface CreatorContext {
  platforms: string[]; // "Instagram" | "TikTok" | "YouTube Shorts" | "LinkedIn" | "Twitter/X"
  target_audience: string;
  primary_goal: string; // "Personal Branding" | "Digital Product" | "Client Acquisition" | "Monetization"
  authority_notes?: string | null;
}

export interface NicheRecommendation {
  niche_name: string;
  rationalization: string;
  sustainability_score: number; // 1-10 integer
  market_demand_score: number;  // 1-10 integer
  monetization_score: number;   // 1-10 integer
  risk_factors: string;
}

export interface BestNicheRecommendation {
  niche_name: string;
  primary_reason: string;
}

export interface LaunchPillar {
  pillar_name: "Otoritas" | "Koneksi" | "Konversi";
  content_idea: string;
  recommended_format: string;
}

export interface MonetizationRoadmapItem {
  phase: string;
  offering_type: string;
  description: string;
}

export interface MarketAnalysis {
  competitor_oversaturation: string[];
  content_gaps: string[];
  launch_pillars: LaunchPillar[];
  monetization_roadmap: MonetizationRoadmapItem[];
}

export interface NicheProfileRow {
  id: string; // UUID
  user_id: string | null;
  strategy_name?: string | null;
  status?: StrategyStatus;

  ikigai_data: IkigaiData;
  creator_context?: CreatorContext;
  recommended_niches?: NicheRecommendation[] | null;
  best_niche_recommendation?: BestNicheRecommendation | null;

  sweet_spot: string | null;
  niche_final: string;
  core_value: string;
  value_statement?: string | null;
  core_message?: string | null;

  bio_ig_a: string | null;
  bio_ig_b: string | null;
  bio_ig_c: string | null;
  bio_tiktok: string | null;
  bio_tiktok_b?: string | null;
  tagline: string | null;

  market_analysis?: MarketAnalysis;

  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type NicheProfile = NicheProfileRow;

// ==========================================
// 2. Audience Persona (Customer Avatar / ICP)
// ==========================================
export interface PersonaDemographics {
  age_range: string;
  gender: string;
  occupation: string;
  income: string;
  location: string;
}

export interface AudiencePersonaRow {
  id: string; // UUID
  user_id: string | null;
  persona_name: string;
  demographics: PersonaDemographics;
  pain_points: string;
  desires: string;
  objections: string;
  narrative: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AudiencePersona = AudiencePersonaRow;

// ==========================================
// 3. Content Plan (Kalender 3-3-1 BCP)
// ==========================================
export type FunnelLayer = "Engagement" | "Authority" | "Sales";
export type ContentFormat = "Single Image" | "Carousel" | "Reels";
export type ContentStatus = "Ide" | "On Process" | "Done" | "Posted";
export type ContentPlatform = "Instagram" | "TikTok" | "YouTube" | string;

export interface ContentPlanRow {
  id: string; // UUID
  user_id: string | null;
  niche_id: string | null;
  persona_id: string | null;
  month_index: number; // 1-12
  week_index: number;  // 1-4
  slot_index: number;  // 1-7
  scheduled_date: string | null;
  funnel_layer: FunnelLayer;
  topic: string;
  reference_url: string | null;
  format: ContentFormat;
  platform: ContentPlatform;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export type ContentPlan = ContentPlanRow;

// ==========================================
// 4. Content Brief (Studio Naskah HTPC)
// ==========================================
export interface ContentBriefRow {
  id: string; // UUID
  plan_id: string; // UUID unique
  hook_ref_id: string | null; // UUID
  cta_ref_id: string | null;  // UUID
  target_duration: string | null;
  hook_text: string;
  tension_text: string;
  payoff_text: string;
  ctv_text: string;
  caption: string | null;
  hashtags: string[];
  production_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ContentBrief = ContentBriefRow;

// ==========================================
// 5. Tasks (Recursive Hierarchical Todo Engine)
// ==========================================
export interface TaskRow {
  id: string; // UUID
  user_id: string | null;
  parent_id: string | null; // UUID (self-referencing)
  content_plan_id: string | null; // UUID
  title: string;
  description: string | null;
  sort_order: number;
  is_completed: boolean;
  is_archived: boolean;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskItem = TaskRow;

// ==========================================
// 6. Performance Metrics & Evaluator
// ==========================================
export interface PerformanceMetricRow {
  id: string; // UUID
  user_id: string | null;
  content_plan_id: string; // UUID unique
  post_date: string;
  content_link: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  evaluation_date: string | null;
  learning_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type PerformanceMetric = PerformanceMetricRow;

export type ContentVerdict = "WINNING" | "GOOD" | "OPTIMASI" | "STOP" | "PENDING";

export interface EvaluatedMetric extends PerformanceMetric {
  save_rate: number; // Persentase, e.g. 5.25 (%)
  engagement_rate: number; // Persentase, e.g. 8.10 (%)
  verdict: ContentVerdict;
}

// ==========================================
// 7. Reference Repositories (System & Custom)
// ==========================================
export interface HookTemplateRow {
  id: string;
  system_code: string | null;
  category: "NEGATIVITY" | "CURIOSITY" | "LIST_NUMBER" | "CONTROVERSY" | "FOMO" | "AUTHORITY" | string;
  template_text: string;
  example_text: string;
  suitable_niche: string | null;
  platform: string;
  is_system: boolean;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export interface IdeaTemplateRow {
  id: string;
  system_code: string | null;
  niche: string;
  funnel_layer: FunnelLayer | string;
  format_type: string;
  template_text: string;
  example_text: string;
  is_system: boolean;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export interface CtaTemplateRow {
  id: string;
  system_code: string | null;
  category: "ENGAGEMENT" | "AUTHORITY" | "SALES" | string;
  cta_type: "CTA" | "CTV" | string;
  template_text: string;
  example_text: string;
  is_system: boolean;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export interface GlossaryTermRow {
  id: string;
  system_code: string | null;
  category: string;
  term: string;
  definition: string;
  example_usage: string | null;
  is_system: boolean;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export interface ToolReferenceRow {
  id: string;
  system_code: string | null;
  phase: "Riset" | "Nulis" | "Produksi" | "Editing" | "Analisis" | string;
  name: string;
  pricing_model: "Gratis" | "Freemium" | "Berbayar" | string;
  purpose: string;
  category_tag: string;
  url: string | null;
  is_system: boolean;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}
