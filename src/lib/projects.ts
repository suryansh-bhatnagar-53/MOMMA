import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectStatus = Database["public"]["Enums"]["project_status"];
export type TimelineEvent = Database["public"]["Tables"]["project_timeline"]["Row"];

export const STATUSES: ProjectStatus[] = ["Draft", "Analyzing", "Interviewing", "Ready", "Generated"];

export const statusClass: Record<ProjectStatus, string> = {
  Draft: "bg-cream text-ink border-line",
  Analyzing: "bg-mustard/20 text-ink border-mustard",
  Interviewing: "bg-brick/10 text-brick border-brick/40",
  Ready: "bg-moss/15 text-moss border-moss/40",
  Generated: "bg-ink text-paper border-ink",
};

// Row-level security scopes every query to the signed-in user.
export const projectApi = {
  async list() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("is_deleted", false)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  async create(input: { name: string; description: string }) {
    const { data, error } = await supabase.from("projects").insert(input).select().single();
    if (error) throw error;
    return data;
  },
  async get(id: string) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("is_deleted", false)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  async update(id: string, patch: Partial<Pick<Project, "name" | "description" | "status">>) {
    const { data, error } = await supabase.from("projects").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  async archive(id: string) {
    const { error } = await supabase.from("projects").update({ is_deleted: true }).eq("id", id);
    if (error) throw error;
  },
  async timeline(id: string) {
    const { data, error } = await supabase
      .from("project_timeline")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  async addEvent(id: string, type: string, details?: Json) {
    const { error } = await supabase.from("project_timeline").insert({ project_id: id, type, details: details ?? null });
    if (error) throw error;
  },
};

export function formatEvent(type: string) {
  const s = type.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
