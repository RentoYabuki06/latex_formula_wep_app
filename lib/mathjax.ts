// MathJax v3 (tex-svg-full) を CDN から一度だけロードするユーティリティ

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { MathJax: any }
}

let mathJaxPromise: Promise<typeof window.MathJax> | null = null;

export function loadMathJax(): Promise<typeof window.MathJax> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("MathJax is browser-only"));
  }
  if (mathJaxPromise) return mathJaxPromise;

  mathJaxPromise = new Promise((resolve, reject) => {
    window.MathJax = {
      tex: {
        packages: { "[+]": ["physics", "color", "cancel", "mhchem"] },
      },
      svg: {
        // フォントパスを SVG 内に埋め込み、自己完結した SVG を出力する(エクスポート用)
        fontCache: "none",
      },
      startup: {
        typeset: false,
        ready() {
          window.MathJax.startup.defaultReady();
          window.MathJax.startup.promise.then(() => resolve(window.MathJax));
        },
      },
    };
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg-full.js";
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load MathJax"));
    document.head.appendChild(script);
  });
  return mathJaxPromise;
}

export interface RenderResult {
  svg: SVGSVGElement;
  error: string | null;
}

/** LaTeX 文字列を SVG 要素にレンダリングする */
export async function renderLatex(
  latex: string,
  display: boolean,
): Promise<RenderResult> {
  const MathJax = await loadMathJax();
  // 前回のレンダリング状態(ラベル等)をリセット
  MathJax.texReset();
  const container: HTMLElement = await MathJax.tex2svgPromise(latex, {
    display,
  });
  const svg = container.querySelector("svg") as SVGSVGElement;

  // MathJax はコンパイルエラーを SVG 内の <merror>(data-mjx-error)として返す
  const errorNode = svg.querySelector("[data-mjx-error]");
  const error = errorNode?.getAttribute("data-mjx-error") ?? null;
  return { svg, error };
}
