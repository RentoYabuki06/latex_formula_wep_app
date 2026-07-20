// SVG / 透過PNG / PDF エクスポートユーティリティ

/** MathJax の SVG 出力での 1ex に相当するピクセル数(表示基準サイズ) */
const EX_TO_PX = 8;

/** SVG 要素の ex 単位の width/height をピクセルに換算する */
export function svgPixelSize(svg: SVGSVGElement): { width: number; height: number } {
  const w = parseFloat(svg.getAttribute("width") ?? "0");
  const h = parseFloat(svg.getAttribute("height") ?? "0");
  return { width: Math.max(w * EX_TO_PX, 1), height: Math.max(h * EX_TO_PX, 1) };
}

/**
 * MathJax の SVG をクローンし、currentColor を実際の色に焼き込んで
 * 自己完結した SVG にする(ビューア・変換ツールで色が失われないように)
 */
export function bakeColor(svg: SVGSVGElement, color: string): SVGSVGElement {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.querySelectorAll('[fill="currentColor"]').forEach((el) =>
    el.setAttribute("fill", color),
  );
  clone.querySelectorAll('[stroke="currentColor"]').forEach((el) =>
    el.setAttribute("stroke", color),
  );
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return clone;
}

export function svgToString(svg: SVGSVGElement, color: string): string {
  const clone = bakeColor(svg, color);
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' +
    new XMLSerializer().serializeToString(clone)
  );
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** SVG としてダウンロード */
export function exportSvg(svg: SVGSVGElement, color: string, filename: string): void {
  const blob = new Blob([svgToString(svg, color)], { type: "image/svg+xml" });
  downloadBlob(blob, filename);
}

/** 背景透過 PNG の Blob を生成(scale で解像度を指定) */
export function svgToPngBlob(
  svg: SVGSVGElement,
  color: string,
  scale: number,
  /** 背景色。省略時は塗らない = 透過 */
  background?: string,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const { width, height } = svgPixelSize(svg);
    const str = svgToString(svg, color);
    const url = URL.createObjectURL(new Blob([str], { type: "image/svg+xml" }));
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(width * scale);
        canvas.height = Math.ceil(height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context を取得できません");
        if (background) {
          ctx.fillStyle = background;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error("PNG の生成に失敗しました"));
        }, "image/png");
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG の読み込みに失敗しました"));
    };
    img.src = url;
  });
}

export async function exportPng(
  svg: SVGSVGElement,
  color: string,
  scale: number,
  filename: string,
): Promise<void> {
  const blob = await svgToPngBlob(svg, color, scale);
  downloadBlob(blob, filename);
}

/** PNG をクリップボードへコピー(background 指定で背景付き、省略で透過) */
export async function copyPngToClipboard(
  svg: SVGSVGElement,
  color: string,
  scale: number,
  background?: string,
): Promise<void> {
  const blob = await svgToPngBlob(svg, color, scale, background);
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}

/**
 * SVG をクリップボードへコピー。
 * 可能なら image/svg+xml として、非対応ブラウザではSVGソース文字列としてコピーする
 * (Figma / Illustrator / エディタ等にはテキスト貼り付けでも認識される)
 */
export async function copySvgToClipboard(
  svg: SVGSVGElement,
  color: string,
): Promise<void> {
  const str = svgToString(svg, color);
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/svg+xml": new Blob([str], { type: "image/svg+xml" }),
      }),
    ]);
  } catch {
    await navigator.clipboard.writeText(str);
  }
}

/** ベクターのまま PDF としてダウンロード */
export async function exportPdf(
  svg: SVGSVGElement,
  color: string,
  filename: string,
): Promise<void> {
  const [{ jsPDF }] = await Promise.all([
    import("jspdf"),
    import("svg2pdf.js"), // jsPDF に .svg() を追加するサイドエフェクトimport
  ]);

  const { width, height } = svgPixelSize(svg);
  const clone = bakeColor(svg, color);
  clone.setAttribute("width", `${width}px`);
  clone.setAttribute("height", `${height}px`);

  const PT_PER_PX = 0.75;
  const margin = 12; // pt
  const w = width * PT_PER_PX;
  const h = height * PT_PER_PX;

  const doc = new jsPDF({
    unit: "pt",
    format: [w + margin * 2, h + margin * 2],
    orientation: w >= h ? "landscape" : "portrait",
  });
  await doc.svg(clone, { x: margin, y: margin, width: w, height: h });
  doc.save(filename);
}

/** LaTeX 文字列からダウンロード用のファイル名を作る */
export function suggestFilename(latex: string, ext: string): string {
  const base =
    latex
      .replace(/\\[a-zA-Z]+/g, " ")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "equation";
  return `${base}.${ext}`;
}
