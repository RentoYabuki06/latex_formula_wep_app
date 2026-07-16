"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  deleteEquation,
  listEquations,
  renameEquation,
  type Equation,
} from "@/lib/db";

interface Props {
  open: boolean;
  user: User | null;
  /** 保存が行われるたびにインクリメントされ、一覧を再取得するトリガー */
  refreshKey: number;
  onSelect: (eq: Equation) => void;
}

export default function HistoryPanel({
  open,
  user,
  refreshKey,
  onSelect,
}: Props) {
  const [items, setItems] = useState<Equation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

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

  const startEdit = (eq: Equation) => {
    setEditingId(eq.id);
    setEditTitle(eq.title ?? "");
  };

  const commitEdit = async (id: string) => {
    const title = editTitle.trim() || null;
    setEditingId(null);
    try {
      await renameEquation(id, title);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, title } : i)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <aside className={`history-pane${open ? " open" : ""}`}>
      <div className="pane-title">履歴</div>
      <div className="history-list">
        {!user && (
          <p className="history-empty">
            ログインすると保存した数式がここに表示されます
          </p>
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
            {editingId === eq.id ? (
              <input
                className="history-rename-input"
                value={editTitle}
                placeholder="名前を入力"
                autoFocus
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => commitEdit(eq.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit(eq.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
              />
            ) : (
              <button
                className="history-latex"
                title={eq.latex}
                onClick={() => onSelect(eq)}
              >
                <span className="history-title">
                  {eq.title || eq.latex}
                </span>
                {eq.title && <code className="history-code">{eq.latex}</code>}
                <span className="history-date">
                  {new Date(eq.created_at).toLocaleString("ja-JP")}
                </span>
              </button>
            )}
            <div className="history-item-actions">
              <button
                className="history-icon-btn"
                title="名前を変更"
                onClick={() => startEdit(eq)}
              >
                ✎
              </button>
              <button
                className="history-icon-btn danger"
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
          </div>
        ))}
      </div>
    </aside>
  );
}
