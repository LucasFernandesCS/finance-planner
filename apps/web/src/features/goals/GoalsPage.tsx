import { useCallback, useMemo, useState } from "react";

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
import { calculateMonthsUntilDate, currentDate } from "../../lib/date";
import { centsToInputValue, formatMoney, reaisToCents } from "../../lib/money";
import { goalStatusOptions } from "../../lib/options";
import type { Goal, GoalStatus } from "../../lib/types";
import { useApiResource } from "../../lib/use-api-resource";

type GoalForm = {
  title: string;
  targetAmount: string;
  monthlyAmount: string;
  deadlineDate: string;
  status: GoalStatus;
  description: string;
};

const emptyGoalForm = (): GoalForm => ({
  title: "",
  targetAmount: "",
  monthlyAmount: "",
  deadlineDate: currentDate(),
  status: "IN_PROGRESS",
  description: ""
});

export function GoalsPage() {
  const [form, setForm] = useState(emptyGoalForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contributionGoalId, setContributionGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const loader = useCallback(() => apiRequest<{ goals: Goal[] }>("/goals"), []);
  const { data, error, loading, reload } = useApiResource(loader, []);
  const goals = data?.goals ?? [];
  const suggestedMonthlyAmountInCents = useMemo(() => {
    const amount = reaisToCents(form.targetAmount);
    const months = calculateMonthsUntilDate(form.deadlineDate);

    if (!Number.isFinite(amount) || amount <= 0 || months <= 0) {
      return null;
    }

    return Math.ceil(amount / months);
  }, [form.deadlineDate, form.targetAmount]);
  const monthlyAmountInCents = reaisToCents(form.monthlyAmount);
  const monthlyAmountBelowSuggestion =
    suggestedMonthlyAmountInCents !== null &&
    Number.isFinite(monthlyAmountInCents) &&
    monthlyAmountInCents > 0 &&
    monthlyAmountInCents < suggestedMonthlyAmountInCents;

  function update(field: keyof GoalForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function edit(goal: Goal) {
    setEditingId(goal.id);
    setForm({
      title: goal.title,
      targetAmount: centsToInputValue(goal.targetAmountInCents),
      monthlyAmount: centsToInputValue(goal.monthlyAmountInCents),
      deadlineDate: goal.deadlineDate.slice(0, 10),
      status: goal.status,
      description: goal.description ?? ""
    });
  }

  function reset() {
    setEditingId(null);
    setForm(emptyGoalForm());
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (monthlyAmountBelowSuggestion) {
      setMessage("O aporte mensal informado e menor que o necessario para atingir este objetivo no prazo escolhido.");
      return;
    }

    try {
      await apiRequest(editingId ? `/goals/${editingId}` : "/goals", {
        method: editingId ? "PATCH" : "POST",
        body: {
          title: form.title,
          targetAmountInCents: reaisToCents(form.targetAmount),
          monthlyAmountInCents: reaisToCents(form.monthlyAmount),
          deadlineDate: form.deadlineDate,
          status: form.status,
          description: form.description || null
        }
      });
      setMessage(editingId ? "Objetivo atualizado." : "Objetivo cadastrado.");
      reset();
      reload();
    } catch (err) {
      setMessage(
        err instanceof ApiError && err.code === "GOAL_MONTHLY_AMOUNT_TOO_LOW"
          ? "O aporte mensal informado e menor que o necessario para atingir este objetivo no prazo escolhido."
          : err instanceof ApiError
            ? err.message
            : "Nao foi possivel salvar o objetivo."
      );
    }
  }

  async function remove(id: string) {
    setMessage(null);
    try {
      await apiRequest(`/goals/${id}`, { method: "DELETE" });
      setMessage("Objetivo removido.");
      reload();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Nao foi possivel remover o objetivo.");
    }
  }

  async function contribute(goalId: string) {
    setMessage(null);
    try {
      await apiRequest(`/goals/${goalId}/contributions`, {
        method: "POST",
        body: { amountInCents: reaisToCents(contributionAmount), note: null }
      });
      setContributionAmount("");
      setContributionGoalId(null);
      setMessage("Aporte registrado.");
      reload();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Nao foi possivel registrar o aporte.");
    }
  }

  async function setPrimary(goalId: string) {
    setMessage(null);
    try {
      await apiRequest("/me/primary-goal", { method: "PATCH", body: { primaryGoalId: goalId } });
      setMessage("Objetivo principal atualizado.");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Nao foi possivel definir o objetivo principal.");
    }
  }

  return (
    <div className="page-stack">
      <PageHeader title="Objetivos" description="Metas financeiras e aportes." />
      <Card>
        <div className="card-heading">
          <h2>{editingId ? "Editar objetivo" : "Novo objetivo"}</h2>
          {editingId ? <Button variant="ghost" onClick={reset}>Cancelar</Button> : null}
        </div>
        <form className="form-grid two-columns" onSubmit={submit}>
          <Input label="Titulo" value={form.title} onChange={(event) => update("title", event.target.value)} required />
          <Input label="Valor alvo" type="number" min="0.01" step="0.01" value={form.targetAmount} onChange={(event) => update("targetAmount", event.target.value)} required />
          <Input label="Aporte mensal" type="number" min="0.01" step="0.01" value={form.monthlyAmount} onChange={(event) => update("monthlyAmount", event.target.value)} required />
          <Input label="Prazo" type="date" value={form.deadlineDate} onChange={(event) => update("deadlineDate", event.target.value)} required />
          <Select label="Status" value={form.status} onChange={(event) => update("status", event.target.value)} options={goalStatusOptions} />
          <Textarea label="Descricao" value={form.description} onChange={(event) => update("description", event.target.value)} />
          {suggestedMonthlyAmountInCents !== null ? (
            <p className={monthlyAmountBelowSuggestion ? "form-message error" : "form-message success"}>
              Aporte mensal sugerido: {formatMoney(suggestedMonthlyAmountInCents)}
            </p>
          ) : null}
          {message ? <p className={message.includes("menor que o necessario") ? "form-message error" : "form-message success"}>{message}</p> : null}
          <Button type="submit" disabled={monthlyAmountBelowSuggestion}>{editingId ? "Salvar objetivo" : "Cadastrar objetivo"}</Button>
        </form>
      </Card>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {!loading && !error && goals.length === 0 ? <EmptyState message="Nenhum objetivo cadastrado." /> : null}
      {goals.length > 0 ? (
        <div className="list-grid">
          {goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.currentAmountInCents / goal.targetAmountInCents) * 100));
            return (
              <Card key={goal.id}>
                <div className="card-heading">
                  <h2>{goal.title}</h2>
                  <StatusBadge value={goal.status} />
                </div>
                <p className="muted">{formatMoney(goal.currentAmountInCents)} de {formatMoney(goal.targetAmountInCents)}</p>
                <div className="progress-bar"><span style={{ width: `${progress}%` }} /></div>
                <p className="muted">{progress}% · aporte mensal {formatMoney(goal.monthlyAmountInCents)}</p>
                {contributionGoalId === goal.id ? (
                  <div className="inline-form">
                    <Input label="Aporte" type="number" min="0.01" step="0.01" value={contributionAmount} onChange={(event) => setContributionAmount(event.target.value)} />
                    <Button onClick={() => void contribute(goal.id)}>Registrar</Button>
                  </div>
                ) : null}
                <div className="row-actions">
                  <Button variant="secondary" onClick={() => edit(goal)}>Editar</Button>
                  <Button variant="secondary" onClick={() => setContributionGoalId(goal.id)}>Aportar</Button>
                  <Button variant="ghost" onClick={() => void setPrimary(goal.id)}>Principal</Button>
                  <ConfirmDelete onConfirm={() => void remove(goal.id)} />
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
