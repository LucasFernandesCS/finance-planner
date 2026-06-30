import type { ReactNode } from "react";

import { navigate, privateRoutes } from "../../app/navigation";
import { clearAccessToken } from "../../lib/auth-token";
import { useMe } from "../../lib/use-api-resource";
import { Button } from "../ui/Button";

export function AuthenticatedLayout({ activePath, children }: { activePath: string; children: ReactNode }) {
  const { data } = useMe();
  const displayName = data?.profile.displayName ?? data?.user.firstName ?? "Finance Planner";

  function logout() {
    clearAccessToken();
    navigate("/login");
  }

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="brand">
          <strong>Finance Planner</strong>
          <span>{displayName}</span>
        </div>
        <nav className="nav-list" aria-label="Navegacao principal">
          {privateRoutes.map((route) => (
            <button
              className={activePath === route.path ? "nav-link active" : "nav-link"}
              key={route.path}
              type="button"
              onClick={() => navigate(route.path)}
            >
              {route.label}
            </button>
          ))}
        </nav>
        <Button variant="ghost" onClick={logout}>Sair</Button>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
