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
import { Textarea } from "../../components/ui/Textarea";
import { ApiError, apiRequest } from "../../lib/api";
import { currentMonth } from "../../lib/date";
import { centsToInputValue, formatMoney, reaisToCents } from "../../lib/money";
import { expenseCategoryOptions } from "../../lib/options";
import type { ExpenseCategory, FixedExpense, VariableExpense } from "../../lib/types";
import { useApiResource } from "../../lib/use-api-resource";

type ExpenseForm = {
  title: string;
  amount: string;
  category: ExpenseCategory;
  month: string;
  description: string;
};

function emptyForm(month: string): ExpenseForm {
  return { title: "", amount: "", category: "OTHER", month, description: "" };
}

export function ExpensesPage() {
  const [month, setMonth] = useState(currentMonth());
  const fixedLoader = useCallback(() => apiRequest<{ fixedExpenses: FixedExpense[] }>("/fixed-expenses"), []);
  const variableLoader = useCallback(() => apiRequest<{ variableExpenses: VariableExpense[] }>("/variable-expenses", { query: { month } }), [month]);
  const fixed = useApiResource(fixedLoader, []);
  const variable = useApiResource(variableLoader, [month]);

  return (
    <div className="page-stack">
      <PageHeader
        title="Despesas"
        description="Custos fixos e variaveis."
        actions={<Input label="Mes" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />}
      />
      <ExpenseSection
        title="Despesas fixas"
        emptyMessage="Nenhuma despesa fixa cadastrada."
        items={fixed.data?.fixedExpenses ?? []}
        loading={fixed.loading}
        error={fixed.error}
        reload={fixed.reload}
        month={month}
        endpoint="/fixed-expenses"
        monthField="startMonth"
      />
      <ExpenseSection
        title="Despesas variaveis"
        emptyMessage="Nenhuma despesa variavel cadastrada."
        items={variable.data?.variableExpenses ?? []}
        loading={variable.loading}
        error={variable.error}
        reload={variable.reload}
        month={month}
        endpoint="/variable-expenses"
        monthField="referenceMonth"
      />
    </div>
  );
}

type ExpenseSectionProps<T extends { id: string; title: string; amountInCents: number; category: ExpenseCategory; description?: string | null }> = {
  title: string;
  emptyMessage: string;
  items: T[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  month: string;
  endpoint: string;
  monthField: "startMonth" | "referenceMonth";
};

function ExpenseSection<T extends { id: string; title: string; amountInCents: number; category: ExpenseCategory; description?: string | null }>(
  props: ExpenseSectionProps<T>
) {
  const [form, setForm] = useState(emptyForm(props.month));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function update(field: keyof ExpenseForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function edit(item: T) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      amount: centsToInputValue(item.amountInCents),
      category: item.category,
      month: "startMonth" in item && typeof item.startMonth === "string" ? item.startMonth : "referenceMonth" in item && typeof item.referenceMonth === "string" ? item.referenceMonth : props.month,
      description: item.description ?? ""
    });
  }

  function reset() {
    setEditingId(null);
    setForm(emptyForm(props.month));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    try {
      await apiRequest(editingId ? `${props.endpoint}/${editingId}` : props.endpoint, {
        method: editingId ? "PATCH" : "POST",
        body: {
          title: form.title,
          amountInCents: reaisToCents(form.amount),
          category: form.category,
          [props.monthField]: form.month,
          description: form.description || null
        }
      });
      setMessage(editingId ? "Despesa atualizada." : "Despesa cadastrada.");
      reset();
      props.reload();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Nao foi possivel salvar a despesa.");
    }
  }

  async function remove(id: string) {
    setMessage(null);
    try {
      await apiRequest(`${props.endpoint}/${id}`, { method: "DELETE" });
      setMessage("Despesa removida.");
      props.reload();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Nao foi possivel remover a despesa.");
    }
  }

  return (
    <Card>
      <div className="card-heading">
        <h2>{props.title}</h2>
        {editingId ? <Button variant="ghost" onClick={reset}>Cancelar</Button> : null}
      </div>
      <form className="form-grid two-columns" onSubmit={submit}>
        <Input label="Titulo" value={form.title} onChange={(event) => update("title", event.target.value)} required />
        <Input label="Valor" type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => update("amount", event.target.value)} required />
        <Select label="Categoria" value={form.category} onChange={(event) => update("category", event.target.value)} options={expenseCategoryOptions} />
        <Input label="Mes" type="month" value={form.month} onChange={(event) => update("month", event.target.value)} required />
        <Textarea label="Descricao" value={form.description} onChange={(event) => update("description", event.target.value)} />
        {message ? <p className="form-message success">{message}</p> : null}
        <Button type="submit">{editingId ? "Salvar despesa" : "Cadastrar despesa"}</Button>
      </form>

      {props.loading ? <LoadingState /> : null}
      {props.error ? <ErrorState message={props.error} onRetry={props.reload} /> : null}
      {!props.loading && !props.error && props.items.length === 0 ? <EmptyState message={props.emptyMessage} /> : null}
      {props.items.length > 0 ? (
        <ul className="item-list">
          {props.items.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <span>{formatMoney(item.amountInCents)} · {item.category}</span>
              </div>
              <div className="row-actions">
                <Button variant="secondary" onClick={() => edit(item)}>Editar</Button>
                <ConfirmDelete onConfirm={() => void remove(item.id)} />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
