// 記号パレットの定義
// insert: 挿入されるLaTeX / caret: 挿入後のカーソル位置(insert内のオフセット、省略時は末尾)

export interface PaletteItem {
  label: string;
  insert: string;
  caret?: number;
}

export interface PaletteCategory {
  name: string;
  items: PaletteItem[];
}

const g = (label: string, insert: string): PaletteItem => ({ label, insert });

export const PALETTE: PaletteCategory[] = [
  {
    name: "ギリシャ",
    items: [
      g("α", "\\alpha "),
      g("β", "\\beta "),
      g("γ", "\\gamma "),
      g("δ", "\\delta "),
      g("ε", "\\varepsilon "),
      g("ζ", "\\zeta "),
      g("η", "\\eta "),
      g("θ", "\\theta "),
      g("κ", "\\kappa "),
      g("λ", "\\lambda "),
      g("μ", "\\mu "),
      g("ν", "\\nu "),
      g("ξ", "\\xi "),
      g("π", "\\pi "),
      g("ρ", "\\rho "),
      g("σ", "\\sigma "),
      g("τ", "\\tau "),
      g("φ", "\\varphi "),
      g("χ", "\\chi "),
      g("ψ", "\\psi "),
      g("ω", "\\omega "),
      g("Γ", "\\Gamma "),
      g("Δ", "\\Delta "),
      g("Θ", "\\Theta "),
      g("Λ", "\\Lambda "),
      g("Π", "\\Pi "),
      g("Σ", "\\Sigma "),
      g("Φ", "\\Phi "),
      g("Ψ", "\\Psi "),
      g("Ω", "\\Omega "),
    ],
  },
  {
    name: "構造",
    items: [
      { label: "a/b", insert: "\\frac{}{}", caret: 6 },
      { label: "√", insert: "\\sqrt{}", caret: 6 },
      { label: "ⁿ√", insert: "\\sqrt[]{}", caret: 6 },
      { label: "xⁿ", insert: "^{}", caret: 2 },
      { label: "xₙ", insert: "_{}", caret: 2 },
      { label: "C(n,k)", insert: "\\binom{}{}", caret: 7 },
      { label: "x̄", insert: "\\overline{}", caret: 10 },
      { label: "x̂", insert: "\\hat{}", caret: 5 },
      { label: "x⃗", insert: "\\vec{}", caret: 5 },
      { label: "ẋ", insert: "\\dot{}", caret: 5 },
      { label: "x̃", insert: "\\tilde{}", caret: 7 },
      { label: "{n}", insert: "\\{ \\}", caret: 3 },
    ],
  },
  {
    name: "積分・総和",
    items: [
      g("∫", "\\int "),
      { label: "∫ₐᵇ", insert: "\\int_{}^{} ", caret: 6 },
      g("∬", "\\iint "),
      g("∮", "\\oint "),
      { label: "Σ", insert: "\\sum_{}^{} ", caret: 6 },
      { label: "Π", insert: "\\prod_{}^{} ", caret: 7 },
      { label: "lim", insert: "\\lim_{ \\to } ", caret: 6 },
      g("∂", "\\partial "),
      g("∇", "\\nabla "),
      g("∞", "\\infty "),
      g("dx", "\\,dx"),
    ],
  },
  {
    name: "関係・演算",
    items: [
      g("≠", "\\neq "),
      g("≈", "\\approx "),
      g("≡", "\\equiv "),
      g("≤", "\\leq "),
      g("≥", "\\geq "),
      g("≪", "\\ll "),
      g("≫", "\\gg "),
      g("∝", "\\propto "),
      g("±", "\\pm "),
      g("×", "\\times "),
      g("÷", "\\div "),
      g("⋅", "\\cdot "),
      g("∈", "\\in "),
      g("∉", "\\notin "),
      g("⊂", "\\subset "),
      g("⊆", "\\subseteq "),
      g("∩", "\\cap "),
      g("∪", "\\cup "),
      g("∀", "\\forall "),
      g("∃", "\\exists "),
      g("∅", "\\emptyset "),
    ],
  },
  {
    name: "矢印",
    items: [
      g("→", "\\to "),
      g("←", "\\gets "),
      g("⇒", "\\Rightarrow "),
      g("⇐", "\\Leftarrow "),
      g("⇔", "\\Leftrightarrow "),
      g("↦", "\\mapsto "),
      g("↑", "\\uparrow "),
      g("↓", "\\downarrow "),
      g("⇌", "\\rightleftharpoons "),
      g("…", "\\dots "),
      g("⋯", "\\cdots "),
      g("⋮", "\\vdots "),
      g("⋱", "\\ddots "),
    ],
  },
  {
    name: "括弧・行列",
    items: [
      { label: "( )", insert: "\\left(  \\right)", caret: 7 },
      { label: "[ ]", insert: "\\left[  \\right]", caret: 7 },
      { label: "{ }", insert: "\\left\\{  \\right\\}", caret: 8 },
      { label: "⟨ ⟩", insert: "\\langle  \\rangle", caret: 8 },
      { label: "| |", insert: "\\left|  \\right|", caret: 7 },
      {
        label: "(⠿)",
        insert: "\\begin{pmatrix}  &  \\\\  &  \\end{pmatrix}",
        caret: 16,
      },
      {
        label: "[⠿]",
        insert: "\\begin{bmatrix}  &  \\\\  &  \\end{bmatrix}",
        caret: 16,
      },
      {
        label: "場合分け",
        insert: "\\begin{cases}  \\\\  \\end{cases}",
        caret: 14,
      },
    ],
  },
];
