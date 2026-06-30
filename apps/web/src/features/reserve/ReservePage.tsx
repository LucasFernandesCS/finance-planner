import { useCallback, useState } from "react";

import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Textarea } from "../../components/ui/Textarea";
import { ApiError, apiRequest } from "../../lib/api";
import { currentDate, formatDate } from "../../lib/date";
import { formatMoney, reaisToCents } from "../../lib/money";
import type { Reserve, ReserveTransaction } from "../../lib/types";
import { useApiResource } from "../../lib/use-api-resource";

export function ReservePage() {
  const [protectionMonths, setProtectionMonths] = useState("6");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [note, setNote] = useState("");
  const [occurredAt, setOccurredAt] = useState(currentDate());
  const [message, setMessage] = useState<string | null>(null);
  const reserveLoader = useCallback(() => apiRequest<{ reserve: Reserve | null; setupRequired: boolean }>("/reserve"), []);
  const transactionsLoader = useCallback(() => apiRequest<{ transactions: ReserveTransaction[] }>("/reserve/transactions"), []);
  const reserveState = useApiResource(reserveLoader, []);
  const transactionsState = useApiResource(transactionsLoader, []);
  const reserve = reserveState.data?.reserve ?? null;

  function refresh() {
    reserveState.reload();
    transactionsState.reload();
  }

  async function configure(method: "POST" | "PATCH") {
    setMessage(null);
    try {
      await apiRequest("/reserve", {
        method,
        body: { protectionMonths: Number(protectionMonths) }
      });
      setMessage(method === "POST" ? "Reserva configurada." : "Reserva atualizada.");
      refresh();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Nao foi possivel salvar a reserva.");
    }
  }

  async function move(kind: "deposits" | "withdrawals", amount: string) {
    setMessage(null);
    try {
      await apiRequest(`/reserve/${kind}`, {
        method: "POST",
        body: { amountInCents: reaisToCents(amount), occurredAt, note: note || null }
      });
      setDepositAmount("");
      setWithdrawAmount("");
      setNote("");
      setMessage(kind === "deposits" ? "Deposito registrado." : "Saque registrado.");
      refresh();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Nao foi possivel registrar a movimentacao.");
    }
  }

  return (
    <div className="page-stack">
      <PageHeader title="Reserva" description="Reserva de emergencia e movimentacoes." />
      {reserveState.loading ? <LoadingState /> : null}
      {reserveState.error ? <ErrorState message={reserveState.error} onRetry={reserveState.reload} /> : null}
      {message ? <p className="form-message success">{message}</p> : null}

      <div className="metric-grid">
        <Metric title="Saldo atual" value={formatMoney(reserve?.currentBalanceInCents)} />
        <Metric title="Meta calculada" value={reserve ? formatMoney(reserve.targetAmountInCents) : "Nao configurada"} />
        <Metric title="Conclusao" value={reserve ? `${reserve.completionPercentage}%` : "0%"} />
        <Card className="metric-card">
          <span>Status</span>
          {reserve ? <StatusBadge value={reserve.status} /> : <strong>Nao configurada</strong>}
        </Card>
      </div>

      <Card>
        <div className="card-heading">
          <h2>{reserve ? "Atualizar protecao" : "Configurar reserva"}</h2>
        </div>
        {!reserve ? <EmptyState message="Reserva ainda nao configurada." /> : null}
        <div className="inline-form">
          <Input label="Meses de protecao" type="number" min="1" value={protectionMonths} onChange={(event) => setProtectionMonths(event.target.value)} />
          <Button onClick={() => void configure(reserve ? "PATCH" : "POST")}>{reserve ? "Atualizar" : "Configurar"}</Button>
        </div>
      </Card>

      {reserve ? (
        <Card>
          <div className="card-heading">
            <h2>Movimentar reserva</h2>
          </div>
          <div className="form-grid two-columns">
            <Input label="Data" type="date" value={occurredAt} onChange={(event) => setOccurredAt(event.target.value)} />
            <Textarea label="Nota" value={note} onChange={(event) => setNote(event.target.value)} />
            <Input label="Deposito" type="number" min="0.01" step="0.01" value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} />
            <Button onClick={() => void move("deposits", depositAmount)}>Depositar</Button>
            <Input label="Saque" type="number" min="0.01" step="0.01" value={withdrawAmount} onChange={(event) => setWithdrawAmount(event.target.value)} />
            <Button variant="secondary" onClick={() => void move("withdrawals", withdrawAmount)}>Sacar</Button>
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="card-heading">
          <h2>Movimentacoes</h2>
        </div>
        {transactionsState.loading && reserve ? <LoadingState /> : null}
        {transactionsState.error && reserve ? <ErrorState message={transactionsState.error} onRetry={transactionsState.reload} /> : null}
        {reserve && (transactionsState.data?.transactions.length ?? 0) === 0 ? <EmptyState message="Nenhuma movimentacao cadastrada." /> : null}
        {reserve ? (
          <ul className="item-list">
            {(transactionsState.data?.transactions ?? []).map((transaction) => (
              <li key={transaction.id}>
                <div>
                  <strong>{transaction.type === "DEPOSIT" ? "Deposito" : "Saque"}</strong>
                  <span>{formatDate(transaction.occurredAt)} · {transaction.note ?? "Sem nota"}</span>
                </div>
                <strong>{formatMoney(transaction.amountInCents)}</strong>
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card className="metric-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </Card>
  );
}
