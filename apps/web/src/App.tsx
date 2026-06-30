import type { ReactElement } from "react";
import { useEffect } from "react";

import { navigate, privateRoutes } from "./app/navigation";
import { usePathname } from "./app/use-pathname";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { hasAccessToken } from "./lib/auth-token";
import { LoginPage, RegisterPage } from "./features/auth/AuthPages";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { DebtsPage } from "./features/debts/DebtsPage";
import { ExpensesPage } from "./features/expenses/ExpensesPage";
import { GoalsPage } from "./features/goals/GoalsPage";
import { IncomesPage } from "./features/incomes/IncomesPage";
import { ProfilePage } from "./features/profile/ProfilePage";
import { ReservePage } from "./features/reserve/ReservePage";
import "./styles.css";

const pages: Record<string, () => ReactElement> = {
  "/dashboard": DashboardPage,
  "/incomes": IncomesPage,
  "/expenses": ExpensesPage,
  "/goals": GoalsPage,
  "/debts": DebtsPage,
  "/reserve": ReservePage,
  "/profile": ProfilePage
};

export function App() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") {
      navigate(hasAccessToken() ? "/dashboard" : "/login");
    }
  }, [pathname]);

  if (pathname === "/login") {
    if (hasAccessToken()) {
      navigate("/dashboard");
      return null;
    }
    return <LoginPage />;
  }

  if (pathname === "/register") {
    if (hasAccessToken()) {
      navigate("/dashboard");
      return null;
    }
    return <RegisterPage />;
  }

  const Page = pages[pathname] ?? DashboardPage;
  const activePath = privateRoutes.some((route) => route.path === pathname) ? pathname : "/dashboard";

  return (
    <ProtectedRoute activePath={activePath}>
      <Page />
    </ProtectedRoute>
  );
}
