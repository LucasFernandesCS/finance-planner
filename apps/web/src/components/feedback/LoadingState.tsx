export function LoadingState({ label = "Carregando..." }: { label?: string }) {
  return <p className="state state-loading">{label}</p>;
}
