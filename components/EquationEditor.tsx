"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { renderLatex } from "@/lib/mathjax";

const DEFAULT_LATEX = String.raw`\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}`;

export default function EquationEditor() {
  const [latex, setLatex] = useState(DEFAULT_LATEX);
  const [display, setDisplay] = useState(true);
  const [color, setColor] = useState("#ffffff");
  const [lightBg, setLightBg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const previewRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const renderSeq = useRef(0);

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

  return (
    <div className="main">
      <section className="editor-pane">
        <div className="pane-title">LaTeX 入力</div>
        <textarea
          className="latex-input"
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          spellCheck={false}
          placeholder={"例: \\frac{a}{b}"}
          autoFocus
        />
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
          <label className="option">
            <input
              type="checkbox"
              checked={lightBg}
              onChange={(e) => setLightBg(e.target.checked)}
            />
            明るい背景で確認
          </label>
        </div>
      </section>

      <section className="preview-pane">
        <div className="pane-title">プレビュー(背景は透過確認用)</div>
        <div className={`preview-area${lightBg ? " light" : ""}`}>
          <div
            ref={previewRef}
            className="preview-svg"
            style={{ color }}
            aria-live="polite"
          >
            {loading && <span style={{ color: "var(--text-dim)" }}>MathJax を読み込み中…</span>}
          </div>
        </div>
        {error && <div className="render-error">{error}</div>}
      </section>
    </div>
  );
}
