export const privateRoutes = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/incomes", label: "Rendas" },
  { path: "/expenses", label: "Despesas" },
  { path: "/goals", label: "Objetivos" },
  { path: "/debts", label: "Dividas" },
  { path: "/reserve", label: "Reserva" },
  { path: "/profile", label: "Perfil" }
] as const;

export type AppPath = (typeof privateRoutes)[number]["path"] | "/login" | "/register" | "/";

export function navigate(path: string): void {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("app:navigate"));
}
