"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { renderLatex } from "@/lib/mathjax";
import {
  copyPngToClipboard,
  exportPdf,
  exportPng,
  exportSvg,
  suggestFilename,
} from "@/lib/export";
import { saveEquation, type Equation } from "@/lib/db";
import { useUser } from "@/lib/useUser";
import type { PaletteItem } from "@/lib/palette";
import AuthButton from "@/components/AuthButton";
import HistoryPanel from "@/components/HistoryPanel";
import SymbolPalette from "@/components/SymbolPalette";

const DEFAULT_LATEX = String.raw`\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}`;

export default function EquationEditor() {
  const [latex, setLatex] = useState(DEFAULT_LATEX);
  const [display, setDisplay] = useState(true);
  const [color, setColor] = useState("#000000");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(4);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useUser();

  const previewRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const renderSeq = useRef(0);

  // パレットからカーソル位置にスニペットを挿入する
  const handleInsert = useCallback(
    (item: PaletteItem) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart ?? latex.length;
      const end = ta.selectionEnd ?? start;
      const next = latex.slice(0, start) + item.insert + latex.slice(end);
      setLatex(next);
      const caret = start + (item.caret ?? item.insert.length);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(caret, caret);
      });
    },
    [latex],
  );

  const doRender = useCallback(async (tex: string, disp: boolean) => {
    const seq = ++renderSeq.current;
    try {
      const { svg, error } = await renderLatex(tex, disp);
      if (seq !== renderSeq.current) return; // 古いレンダリング結果は破棄
      setError(error);
      setLoading(false);
      svgRef.current = svg;
      if (previewRef.current) {
        previewRef.current.replaceChildren(svg);
      }
    } catch (e) {
      if (seq !== renderSeq.current) return;
      setLoading(false);
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  // 入力のデバウンスレンダリング
  useEffect(() => {
    const t = setTimeout(() => {
      if (latex.trim()) doRender(latex, display);
      else {
        svgRef.current = null;
        previewRef.current?.replaceChildren();
        setError(null);
      }
    }, 150);
    return () => clearTimeout(t);
  }, [latex, display, doRender]);

  const withExport = useCallback(
    async (fn: () => Promise<void> | void, done?: string) => {
      if (!svgRef.current) return;
      setBusy(true);
      setNotice(null);
      try {
        await fn();
        if (done) {
          setNotice(done);
          setTimeout(() => setNotice(null), 2500);
        }
      } catch (e) {
        setNotice(
          `エクスポート失敗: ${e instanceof Error ? e.message : String(e)}`,
        );
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const canExport = !busy && !error && !!latex.trim();

  const handleSelect = useCallback((eq: Equation) => {
    setLatex(eq.latex);
    setDisplay(eq.display);
    setColor(eq.color);
    setDrawerOpen(false);
  }, []);

  const handleSave = useCallback(
    () =>
      withExport(async () => {
        await saveEquation({ latex, display, color });
        setRefreshKey((k) => k + 1);
      }, "履歴に保存しました"),
    [withExport, latex, display, color],
  );

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <button
            className="hamburger"
            aria-label="履歴を開閉"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((o) => !o)}
          >
            ☰
          </button>
          <h1>
            LaTeX <span>Studio</span>
          </h1>
        </div>
        <div className="header-actions">
          <a href="/practice" className="btn" title="数式再現練習">
            練習
          </a>
          <AuthButton />
        </div>
      </header>

      {drawerOpen && (
        <div
          className="drawer-backdrop"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <HistoryPanel
        open={drawerOpen}
        user={user}
        refreshKey={refreshKey}
        onSelect={handleSelect}
      />

      <div className="main">
        <section className="editor-pane">
          <textarea
            ref={textareaRef}
            className="latex-input"
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            spellCheck={false}
            placeholder={"例: \\frac{a}{b}"}
            autoFocus
          />
          <SymbolPalette onInsert={handleInsert} />
          <div className="editor-options">
            <label className="option">
              <input
                type="checkbox"
                checked={display}
                onChange={(e) => setDisplay(e.target.checked)}
              />
              ディスプレイ数式
            </label>
            <label className="option">
              色
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="preview-pane">
          <div className="preview-area">
            {loading && (
              <span style={{ color: "#888" }}>MathJax を読み込み中…</span>
            )}
            {/* この div の中身は MathJax が直接操作するため、React の子要素は置かない */}
            <div
              ref={previewRef}
              className="preview-svg"
              style={{ color }}
              aria-live="polite"
            />
          </div>
          {error && <div className="render-error">{error}</div>}
          <div className="export-bar">
            <label className="option">
              PNG解像度
              <select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
              >
                <option value={2}>2x</option>
                <option value={4}>4x (推奨)</option>
                <option value={8}>8x</option>
                <option value={16}>16x</option>
              </select>
            </label>
            <button
              className="btn primary"
              disabled={!canExport}
              onClick={() =>
                withExport(() =>
                  exportPng(
                    svgRef.current!,
                    color,
                    scale,
                    suggestFilename(latex, "png"),
                  ),
                )
              }
            >
              透過PNG
            </button>
            <button
              className="btn"
              disabled={!canExport}
              onClick={() =>
                withExport(() =>
                  exportSvg(
                    svgRef.current!,
                    color,
                    suggestFilename(latex, "svg"),
                  ),
                )
              }
            >
              SVG
            </button>
            <button
              className="btn"
              disabled={!canExport}
              onClick={() =>
                withExport(() =>
                  exportPdf(
                    svgRef.current!,
                    color,
                    suggestFilename(latex, "pdf"),
                  ),
                )
              }
            >
              PDF
            </button>
            <button
              className="btn"
              disabled={!canExport}
              onClick={() =>
                withExport(
                  () => copyPngToClipboard(svgRef.current!, color, scale),
                  "PNGをクリップボードにコピーしました",
                )
              }
            >
              画像をコピー
            </button>
            <div className="spacer" />
            {notice && <span className="export-notice">{notice}</span>}
            {user && (
              <button
                className="btn"
                disabled={!canExport}
                onClick={handleSave}
                title="この数式を履歴に保存"
              >
                保存
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
