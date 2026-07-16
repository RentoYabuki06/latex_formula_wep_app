"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { deleteEquation, listEquations, type Equation } from "@/lib/db";

interface Props {
  user: User | null;
  /** 保存が行われるたびにインクリメントされ、一覧を再取得するトリガー */
  refreshKey: number;
  onSelect: (eq: Equation) => void;
}

export default function HistoryPanel({ user, refreshKey, onSelect }: Props) {
  const [items, setItems] = useState<Equation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setItems(await listEquations());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  return (
    <aside className="history-pane">
      <div className="pane-title">履歴</div>
      <div className="history-list">
        {!user && (
          <p className="history-empty">ログインすると保存した数式がここに表示されます</p>
        )}
        {user && loading && items.length === 0 && (
          <p className="history-empty">読み込み中…</p>
        )}
        {user && !loading && items.length === 0 && !error && (
          <p className="history-empty">まだ保存された数式はありません</p>
        )}
        {error && <p className="history-error">{error}</p>}
        {items.map((eq) => (
          <div key={eq.id} className="history-item">
            <button
              className="history-latex"
              title={eq.latex}
              onClick={() => onSelect(eq)}
            >
              <code>{eq.latex}</code>
              <span className="history-date">
                {new Date(eq.created_at).toLocaleString("ja-JP")}
              </span>
            </button>
            <button
              className="history-delete"
              title="削除"
              onClick={async () => {
                try {
                  await deleteEquation(eq.id);
                  setItems((prev) => prev.filter((i) => i.id !== eq.id));
                } catch (e) {
                  setError(e instanceof Error ? e.message : String(e));
                }
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
