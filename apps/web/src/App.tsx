import "./styles.css";

export function App() {
  return (
    <main className="app-shell">
      <section className="status-panel" aria-labelledby="app-title">
        <p className="status-label">Finance Planner</p>
        <h1 id="app-title">Family Dreams is running</h1>
        <p className="status-copy">The project foundation is ready for the next feature.</p>
      </section>
    </main>
  );
}
