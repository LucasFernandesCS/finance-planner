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
import { currentMonth } from "../../lib/date";
import { centsToInputValue, formatMoney, reaisToCents } from "../../lib/money";
import type { Income } from "../../lib/types";
import { useApiResource } from "../../lib/use-api-resource";

type IncomeForm = {
  title: string;
  amount: string;
  type: "MONTHLY" | "EXTRA";
  referenceMonth: string;
  description: string;
};

const emptyForm = (month: string): IncomeForm => ({
  title: "",
  amount: "",
  type: "MONTHLY",
  referenceMonth: month,
  description: ""
});

export function IncomesPage() {
  const [month, setMonth] = useState(currentMonth());
  const [form, setForm] = useState(emptyForm(month));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const loader = useCallback(() => apiRequest<{ incomes: Income[] }>("/incomes", { query: { month } }), [month]);
  const { data, error, loading, reload } = useApiResource(loader, [month]);

  function update(field: keyof IncomeForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function edit(income: Income) {
    setEditingId(income.id);
    setForm({
      title: income.title,
      amount: centsToInputValue(income.amountInCents),
      type: income.type,
      referenceMonth: income.referenceMonth,
      description: income.description ?? ""
    });
  }

  function reset() {
    setEditingId(null);
    setForm(emptyForm(month));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    try {
      await apiRequest(editingId ? `/incomes/${editingId}` : "/incomes", {
        method: editingId ? "PATCH" : "POST",
        body: {
          title: form.title,
          amountInCents: reaisToCents(form.amount),
          type: form.type,
          referenceMonth: form.referenceMonth,
          description: form.description || null
        }
      });
      setMessage(editingId ? "Renda atualizada." : "Renda cadastrada.");
      reset();
      reload();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Nao foi possivel salvar a renda.");
    }
  }

  async function remove(id: string) {
    setMessage(null);
    try {
      await apiRequest(`/incomes/${id}`, { method: "DELETE" });
      setMessage("Renda removida.");
      reload();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Nao foi possivel remover a renda.");
    }
  }

  const incomes = data?.incomes ?? [];

  return (
    <div className="page-stack">
      <PageHeader
        title="Rendas"
        description="Entradas mensais e extras."
        actions={<Input label="Mes" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />}
      />

      <Card>
        <div className="card-heading">
          <h2>{editingId ? "Editar renda" : "Nova renda"}</h2>
          {editingId ? <Button variant="ghost" onClick={reset}>Cancelar</Button> : null}
        </div>
        <form className="form-grid two-columns" onSubmit={submit}>
          <Input label="Titulo" value={form.title} onChange={(event) => update("title", event.target.value)} required />
          <Input label="Valor" type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => update("amount", event.target.value)} required />
          <Select
            label="Tipo"
            value={form.type}
            onChange={(event) => update("type", event.target.value)}
            options={[
              { value: "MONTHLY", label: "Mensal" },
              { value: "EXTRA", label: "Extra" }
            ]}
          />
          <Input label="Mes de referencia" type="month" value={form.referenceMonth} onChange={(event) => update("referenceMonth", event.target.value)} required />
          <Textarea label="Descricao" value={form.description} onChange={(event) => update("description", event.target.value)} />
          {message ? <p className="form-message success">{message}</p> : null}
          <Button type="submit">{editingId ? "Salvar renda" : "Cadastrar renda"}</Button>
        </form>
      </Card>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {!loading && !error && incomes.length === 0 ? <EmptyState message="Nenhuma renda cadastrada." /> : null}
      {incomes.length > 0 ? (
        <Card>
          <ul className="item-list">
            {incomes.map((income) => (
              <li key={income.id}>
                <div>
                  <strong>{income.title}</strong>
                  <span>{formatMoney(income.amountInCents)} · {income.referenceMonth}</span>
                </div>
                <StatusBadge value={income.type} />
                <div className="row-actions">
                  <Button variant="secondary" onClick={() => edit(income)}>Editar</Button>
                  <ConfirmDelete onConfirm={() => void remove(income.id)} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
