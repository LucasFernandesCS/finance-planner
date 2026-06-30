import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { navigate } from "../../app/navigation";
import { hasAccessToken } from "../../lib/auth-token";
import { AuthenticatedLayout } from "./AuthenticatedLayout";

export function ProtectedRoute({ activePath, children }: { activePath: string; children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(hasAccessToken);

  useEffect(() => {
    const sync = () => setAuthenticated(hasAccessToken());
    window.addEventListener("auth-token-change", sync);
    return () => window.removeEventListener("auth-token-change", sync);
  }, []);

  useEffect(() => {
    if (!authenticated) {
      navigate("/login");
    }
  }, [authenticated]);

  if (!authenticated) {
    return null;
  }

  return <AuthenticatedLayout activePath={activePath}>{children}</AuthenticatedLayout>;
}
