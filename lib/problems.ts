// 数式再現練習の組み込み問題集(難易度別)

export type Level = "beginner" | "intermediate" | "advanced";

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

export const PROBLEMS: Record<Level, string[]> = {
  beginner: [
    String.raw`\frac{1}{2}`,
    String.raw`x^2 + y^2 = r^2`,
    String.raw`\sqrt{2}`,
    String.raw`a_n`,
    String.raw`\alpha + \beta`,
    String.raw`\frac{a+b}{2}`,
    String.raw`x \neq 0`,
    String.raw`2^{10} = 1024`,
    String.raw`S = \pi r^2`,
    String.raw`\frac{dy}{dx}`,
  ],
  intermediate: [
    String.raw`\int_0^1 x^2 \, dx = \frac{1}{3}`,
    String.raw`\sum_{k=1}^{n} k = \frac{n(n+1)}{2}`,
    String.raw`\lim_{x \to 0} \frac{\sin x}{x} = 1`,
    String.raw`e^{i\pi} + 1 = 0`,
    String.raw`\binom{n}{k} = \frac{n!}{k!(n-k)!}`,
    String.raw`\vec{a} \cdot \vec{b} = |\vec{a}| |\vec{b}| \cos\theta`,
    String.raw`x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`,
    String.raw`\log_a xy = \log_a x + \log_a y`,
    String.raw`\sin^2\theta + \cos^2\theta = 1`,
    String.raw`\frac{\partial f}{\partial x}`,
  ],
  advanced: [
    String.raw`\begin{pmatrix} a & b \\ c & d \end{pmatrix}`,
    String.raw`\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}`,
    String.raw`\nabla \times \vec{E} = -\frac{\partial \vec{B}}{\partial t}`,
    String.raw`f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!} (x-a)^n`,
    String.raw`i\hbar \frac{\partial}{\partial t} \Psi = \hat{H} \Psi`,
    String.raw`\begin{cases} x + y = 1 \\ x - y = 3 \end{cases}`,
    String.raw`\lim_{n \to \infty} \left( 1 + \frac{1}{n} \right)^n = e`,
    String.raw`\frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}`,
    String.raw`\det(A - \lambda I) = 0`,
    String.raw`\oint_C \vec{F} \cdot d\vec{r} = \iint_S (\nabla \times \vec{F}) \cdot d\vec{S}`,
  ],
};
