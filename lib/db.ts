import { createClient } from "@/lib/supabase/client";

export interface Equation {
  id: string;
  latex: string;
  display: boolean;
  color: string;
  created_at: string;
}

/** 履歴を新しい順に取得 */
export async function listEquations(limit = 200): Promise<Equation[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("equations")
    .select("id, latex, display, color, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** 数式をログとして保存 */
export async function saveEquation(input: {
  latex: string;
  display: boolean;
  color: string;
}): Promise<Equation> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("equations")
    .insert(input)
    .select("id, latex, display, color, created_at")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

/** 履歴から削除 */
export async function deleteEquation(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("equations").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
