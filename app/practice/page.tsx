import Link from "next/link";
import PracticeGame from "@/components/PracticeGame";

export const metadata = {
  title: "数式再現練習 | LaTeX Studio",
};

export default function PracticePage() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1>
            LaTeX <span>Studio</span>{" "}
            <span className="header-sub">練習モード</span>
          </h1>
        </div>
        <div className="header-actions">
          <Link href="/" className="btn">
            ← エディタへ戻る
          </Link>
        </div>
      </header>
      <PracticeGame />
    </div>
  );
}
