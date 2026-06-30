import { useCallback, useState } from "react";

import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { apiRequest } from "../../lib/api";
import { currentMonth } from "../../lib/date";
import { formatMoney } from "../../lib/money";
import type { DashboardSummary } from "../../lib/types";
import { useApiResource } from "../../lib/use-api-resource";

export function DashboardPage() {
  const [month, setMonth] = useState(currentMonth());
  const loader = useCallback(
    () => apiRequest<DashboardSummary>("/dashboard/summary", { query: { month } }),
    [month]
  );
  const { data, error, loading, reload } = useApiResource(loader, [month]);

  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard"
        description="Resumo financeiro do periodo."
        actions={<Input label="Mes" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />}
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {data ? <DashboardContent summary={data} /> : null}
    </div>
  );
}

function DashboardContent({ summary }: { summary: DashboardSummary }) {
  return (
    <>
      <div className="metric-grid">
        <Metric title="Renda total" value={formatMoney(summary.income.totalIncomeInCents)} />
        <Metric title="Despesas totais" value={formatMoney(summary.expenses.totalExpensesInCents)} />
        <Metric title="Sobra prevista" value={formatMoney(summary.cashFlow.expectedSurplusInCents)} />
        <Metric
          title="Dividas abertas"
          value={`Dividas totais - ${summary.debts.openDebtsCount}`}
          detail={formatMoney(summary.debts.openDebtBalanceInCents)}
        />
        <Metric
          title="Reserva"
          value={summary.reserve ? formatMoney(summary.reserve.currentBalanceInCents) : "Nao configurada"}
          detail={summary.reserve ? `${summary.reserve.completionPercentage}% da meta` : undefined}
        />
        <Metric
          title="Objetivo principal"
          value={summary.primaryGoal?.title ?? "Nao definido"}
          detail={summary.primaryGoal ? `${summary.primaryGoal.completionPercentage}% concluido` : undefined}
        />
      </div>

      <Card>
        <div className="card-heading">
          <h2>Alertas</h2>
        </div>
        {summary.alerts.length === 0 ? (
          <p className="muted">Nenhum alerta para este periodo.</p>
        ) : (
          <ul className="item-list">
            {summary.alerts.map((alert) => (
              <li key={`${alert.type}-${alert.message}`}>
                <div>
                  <strong>{alert.message}</strong>
                </div>
                <StatusBadge value={alert.severity} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

function Metric({ title, value, detail }: { title: string; value: string; detail?: string }) {
  return (
    <Card className="metric-card">
      <span>{title}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </Card>
  );
}
