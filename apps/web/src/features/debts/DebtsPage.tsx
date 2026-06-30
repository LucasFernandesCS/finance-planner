import { useCallback, useState } from "react";

import { ConfirmDelete } from "../../components/feedback/ConfirmDelete";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Textarea } from "../../components/ui/Textarea";
import { ApiError, apiRequest } from "../../lib/api";
import { centsToInputValue, formatMoney, reaisToCents } from "../../lib/money";
import { debtTypeOptions } from "../../lib/options";
import type { Debt, DebtType } from "../../lib/types";
import { useApiResource } from "../../lib/use-api-resource";

type DebtForm = {
  title: string;
  creditor: string;
  type: DebtType;
  originalAmount: string;
  installmentAmount: string;
  monthlyDueDay: string;
  description: string;
};

const emptyDebtForm = (): DebtForm => ({
  title: "",
  creditor: "",
  type: "OTHER",
  originalAmount: "",
  installmentAmount: "",
  monthlyDueDay: "10",
  description: ""
});

export function DebtsPage() {
  const [form, setForm] = useState(emptyDebtForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [paymentDebtId, setPaymentDebtId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const loader = useCallback(() => apiRequest<{ debts: Debt[] }>("/debts"), []);
  const { data, error, loading, reload } = useApiResource(loader, []);
  const debts = data?.debts ?? [];

  function update(field: keyof DebtForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function edit(debt: Debt) {
    setEditingId(debt.id);
    setForm({
      title: debt.title,
      creditor: debt.creditor,
      type: debt.type,
      originalAmount: centsToInputValue(debt.originalAmountInCents),
      installmentAmount: centsToInputValue(debt.installmentAmountInCents),
      monthlyDueDay: String(debt.monthlyDueDay),
      description: debt.description ?? ""
    });
  }

  function reset() {
    setEditingId(null);
    setForm(emptyDebtForm());
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    try {
      await apiRequest(editingId ? `/debts/${editingId}` : "/debts", {
        method: editingId ? "PATCH" : "POST",
        body: {
          title: form.title,
          creditor: form.creditor,
          type: form.type,
          originalAmountInCents: reaisToCents(form.originalAmount),
          installmentAmountInCents: form.installmentAmount ? reaisToCents(form.installmentAmount) : null,
          monthlyDueDay: Number(form.monthlyDueDay),
          description: form.description || null
        }
      });
      setMessage(editingId ? "Divida atualizada." : "Divida cadastrada.");
      reset();
      reload();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Nao foi possivel salvar a divida.");
    }
  }

  async function remove(id: string) {
    setMessage(null);
    try {
      await apiRequest(`/debts/${id}`, { method: "DELETE" });
      setMessage("Divida removida.");
      reload();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Nao foi possivel remover a divida.");
    }
  }

  async function pay(id: string) {
    setMessage(null);
    try {
      await apiRequest(`/debts/${id}/payments`, {
        method: "POST",
        body: { amountInCents: reaisToCents(paymentAmount), note: null }
      });
      setPaymentAmount("");
      setPaymentDebtId(null);
      setMessage("Pagamento registrado.");
      reload();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Nao foi possivel registrar o pagamento.");
    }
  }

  return (
    <div className="page-stack">
      <PageHeader title="Dividas" description="Saldos, vencimentos e pagamentos." />
      <Card>
        <div className="card-heading">
          <h2>{editingId ? "Editar divida" : "Nova divida"}</h2>
          {editingId ? <Button variant="ghost" onClick={reset}>Cancelar</Button> : null}
        </div>
        <form className="form-grid two-columns" onSubmit={submit}>
          <Input label="Titulo" value={form.title} onChange={(event) => update("title", event.target.value)} required />
          <Input label="Credor" value={form.creditor} onChange={(event) => update("creditor", event.target.value)} required />
          <Select label="Tipo" value={form.type} onChange={(event) => update("type", event.target.value)} options={debtTypeOptions} />
          <Input label="Valor original" type="number" min="0.01" step="0.01" value={form.originalAmount} onChange={(event) => update("originalAmount", event.target.value)} required />
          <Input label="Parcela" type="number" min="0.01" step="0.01" value={form.installmentAmount} onChange={(event) => update("installmentAmount", event.target.value)} />
          <Input label="Dia vencimento" type="number" min="1" max="28" value={form.monthlyDueDay} onChange={(event) => update("monthlyDueDay", event.target.value)} required />
          <Textarea label="Descricao" value={form.description} onChange={(event) => update("description", event.target.value)} />
          {message ? <p className="form-message success">{message}</p> : null}
          <Button type="submit">{editingId ? "Salvar divida" : "Cadastrar divida"}</Button>
        </form>
      </Card>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {!loading && !error && debts.length === 0 ? <EmptyState message="Nenhuma divida cadastrada." /> : null}
      {debts.length > 0 ? (
        <div className="list-grid">
          {debts.map((debt) => (
            <Card key={debt.id}>
              <div className="card-heading">
                <h2>{debt.title}</h2>
                <StatusBadge value={debt.status} />
              </div>
              <p className="muted">Credor: {debt.creditor}</p>
              <dl className="compact-dl">
                <div><dt>Saldo</dt><dd>{formatMoney(debt.currentBalanceInCents)}</dd></div>
                <div><dt>Original</dt><dd>{formatMoney(debt.originalAmountInCents)}</dd></div>
                <div><dt>Vencimento</dt><dd>dia {debt.monthlyDueDay}</dd></div>
              </dl>
              {paymentDebtId === debt.id ? (
                <div className="inline-form">
                  <Input label="Pagamento" type="number" min="0.01" step="0.01" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} />
                  <Button onClick={() => void pay(debt.id)}>Registrar</Button>
                </div>
              ) : null}
              <div className="row-actions">
                <Button variant="secondary" onClick={() => edit(debt)}>Editar</Button>
                <Button variant="secondary" onClick={() => setPaymentDebtId(debt.id)}>Pagar</Button>
                <ConfirmDelete onConfirm={() => void remove(debt.id)} />
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
