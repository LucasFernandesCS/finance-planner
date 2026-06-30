const labels: Record<string, string> = {
  MONTHLY: "Mensal",
  EXTRA: "Extra",
  NOT_STARTED: "Nao iniciado",
  IN_PROGRESS: "Em andamento",
  ACHIEVED: "Concluido",
  OVERDUE: "Atrasada",
  PAID: "Paga",
  BUILDING: "Construindo",
  PROTECTED: "Protegida",
  REPLENISHING: "Repondo",
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baixa"
};

export function StatusBadge({ value }: { value: string }) {
  return <span className={`status-badge status-${value.toLowerCase().replaceAll("_", "-")}`}>{labels[value] ?? value}</span>;
}
