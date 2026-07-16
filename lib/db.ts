import { createClient } from "@/lib/supabase/client";

export interface Equation {
  id: string;
  latex: string;
  display: boolean;
  color: string;
  title: string | null;
  created_at: string;
}

const COLS = "id, latex, display, color, title, created_at";

/** 履歴を新しい順に取得 */
export async function listEquations(limit = 200): Promise<Equation[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("equations")
    .select(COLS)
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
  title?: string | null;
}): Promise<Equation> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("equations")
    .insert(input)
    .select(COLS)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

/** 履歴の名前を変更 */
export async function renameEquation(
  id: string,
  title: string | null,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("equations")
    .update({ title })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/** 履歴から削除 */
export async function deleteEquation(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("equations").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
