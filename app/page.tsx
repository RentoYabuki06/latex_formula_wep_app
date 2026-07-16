import EquationEditor from "@/components/EquationEditor";

export default function Home() {
  return (
    <div className="app">
      <header className="header">
        <h1>
          LaTeX <span>Studio</span>
        </h1>
        <div className="header-actions" />
      </header>
      <EquationEditor />
    </div>
  );
}
