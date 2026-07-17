"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { renderLatex } from "@/lib/mathjax";
import { LEVEL_LABELS, PROBLEMS, type Level } from "@/lib/problems";
import type { PaletteItem } from "@/lib/palette";
import SymbolPalette from "@/components/SymbolPalette";

/** SVG構造を比較用に正規化する(タグ間の空白を除去) */
function normalizeSvg(svg: SVGSVGElement): string {
  return svg.innerHTML.replace(/>\s+</g, "><").trim();
}

type Judge = "idle" | "correct" | "wrong";

export default function PracticeGame() {
  const [level, setLevel] = useState<Level>("beginner");
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [judge, setJudge] = useState<Judge>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [solved, setSolved] = useState(0);
  const [tried, setTried] = useState(0);
  const countedRef = useRef(false); // この問題を挑戦数にカウント済みか
  const solvedRef = useRef(false); // この問題を正解数にカウント済みか

  const targetRef = useRef<HTMLDivElement>(null);
  const attemptRef = useRef<HTMLDivElement>(null);
  const targetSvgRef = useRef<SVGSVGElement | null>(null);
  const renderSeq = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const problems = PROBLEMS[level];
  const problem = problems[index % problems.length];

  // お手本のレンダリング
  useEffect(() => {
    let cancelled = false;
    renderLatex(problem, true).then(({ svg }) => {
      if (cancelled) return;
      targetSvgRef.current = svg;
      targetRef.current?.replaceChildren(svg);
    });
    return () => {
      cancelled = true;
    };
  }, [problem]);

  // 自分の入力のライブプレビュー + 自動判定
  useEffect(() => {
    const t = setTimeout(async () => {
      const seq = ++renderSeq.current;
      if (!input.trim()) {
        attemptRef.current?.replaceChildren();
        setJudge("idle");
        setError(null);
        return;
      }
      try {
        const { svg, error } = await renderLatex(input, true);
        if (seq !== renderSeq.current) return;
        setError(error);
        attemptRef.current?.replaceChildren(svg);
        if (!error && targetSvgRef.current) {
          const ok = normalizeSvg(svg) === normalizeSvg(targetSvgRef.current);
          setJudge(ok ? "correct" : "wrong");
          if (!countedRef.current) {
            countedRef.current = true;
            setTried((n) => n + 1);
          }
          if (ok && !solvedRef.current) {
            solvedRef.current = true;
            setSolved((n) => n + 1);
          }
        }
      } catch (e) {
        if (seq !== renderSeq.current) return;
        setError(e instanceof Error ? e.message : String(e));
      }
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const nextProblem = useCallback(() => {
    setIndex((i) => i + 1);
    setInput("");
    setJudge("idle");
    setError(null);
    setShowAnswer(false);
    countedRef.current = false;
    solvedRef.current = false;
    textareaRef.current?.focus();
  }, []);

  const changeLevel = useCallback((lv: Level) => {
    setLevel(lv);
    setIndex(0);
    setInput("");
    setJudge("idle");
    setError(null);
    setShowAnswer(false);
    countedRef.current = false;
    solvedRef.current = false;
  }, []);

  const handleInsert = useCallback(
    (item: PaletteItem) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart ?? input.length;
      const end = ta.selectionEnd ?? start;
      setInput(input.slice(0, start) + item.insert + input.slice(end));
      const caret = start + (item.caret ?? item.insert.length);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(caret, caret);
      });
    },
    [input],
  );

  return (
    <div className="practice">
      <div className="practice-toolbar">
        <div className="level-btns" role="group" aria-label="難易度">
          {(Object.keys(PROBLEMS) as Level[]).map((lv) => (
            <button
              key={lv}
              className={`btn level-btn${level === lv ? " active" : ""}`}
              aria-pressed={level === lv}
              onClick={() => changeLevel(lv)}
            >
              {LEVEL_LABELS[lv]}
            </button>
          ))}
        </div>
        <span className="practice-progress">
          問題 {(index % problems.length) + 1} / {problems.length}
        </span>
        <div className="spacer" />
        <span className="practice-score">
          正解 {solved} / 挑戦 {tried}
        </span>
      </div>

      <div className="practice-target">
        <div className="pane-title">お手本(これをLaTeXで再現してください)</div>
        <div className="practice-render">
          <div ref={targetRef} className="preview-svg practice-black" />
        </div>
      </div>

      <div className="practice-input-wrap">
        <textarea
          ref={textareaRef}
          className="latex-input practice-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="ここにLaTeXを入力…"
          autoFocus
        />
        <SymbolPalette onInsert={handleInsert} />
      </div>

      <div className="practice-attempt">
        <div className="pane-title">
          あなたのプレビュー
          {judge === "correct" && (
            <span className="judge correct">✓ 正解!</span>
          )}
          {judge === "wrong" && (
            <span className="judge wrong">まだ一致していません</span>
          )}
        </div>
        <div className="practice-render">
          <div ref={attemptRef} className="preview-svg practice-black" />
        </div>
        {error && <div className="render-error">{error}</div>}
      </div>

      <div className="practice-actions">
        <button className="btn" onClick={() => setShowAnswer((s) => !s)}>
          {showAnswer ? "答えを隠す" : "答えを見る"}
        </button>
        {showAnswer && <code className="practice-answer">{problem}</code>}
        <div className="spacer" />
        <button className="btn primary" onClick={nextProblem}>
          次の問題 →
        </button>
      </div>
    </div>
  );
}
