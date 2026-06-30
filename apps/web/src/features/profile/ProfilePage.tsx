import { useCallback, useEffect, useState } from "react";

import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import { ApiError, apiRequest } from "../../lib/api";
import type { UserProfile } from "../../lib/types";
import { useApiResource } from "../../lib/use-api-resource";

type ProfileForm = {
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl: string;
  timezone: string;
  financialMonthStartDay: string;
};

export function ProfilePage() {
  const loader = useCallback(() => apiRequest<UserProfile>("/me"), []);
  const { data, error, loading, reload } = useApiResource(loader, []);
  const [form, setForm] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    displayName: "",
    avatarUrl: "",
    timezone: "America/Recife",
    financialMonthStartDay: "1"
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setForm({
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        displayName: data.profile.displayName ?? "",
        avatarUrl: data.profile.avatarUrl ?? "",
        timezone: data.profile.timezone,
        financialMonthStartDay: String(data.profile.financialMonthStartDay)
      });
    }
  }, [data]);

  function update(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    try {
      await apiRequest<UserProfile>("/me/profile", {
        method: "PATCH",
        body: {
          firstName: form.firstName,
          lastName: form.lastName,
          displayName: form.displayName || null,
          avatarUrl: form.avatarUrl || null,
          currencyCode: "BRL",
          locale: "pt-BR",
          timezone: form.timezone,
          financialMonthStartDay: Number(form.financialMonthStartDay)
        }
      });
      setMessage("Perfil atualizado.");
      reload();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Nao foi possivel atualizar o perfil.");
    }
  }

  return (
    <div className="page-stack">
      <PageHeader title="Perfil" description="Dados pessoais e preferencias financeiras." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {data ? (
        <>
          <Card>
            <div className="card-heading">
              <h2>Dados do usuario</h2>
            </div>
            <dl className="compact-dl">
              <div><dt>Email</dt><dd>{data.user.email}</dd></div>
              <div><dt>Moeda</dt><dd>{data.profile.currencyCode}</dd></div>
              <div><dt>Locale</dt><dd>{data.profile.locale}</dd></div>
              <div><dt>Objetivo principal</dt><dd>{data.profile.primaryGoalId ?? "Nao definido"}</dd></div>
            </dl>
          </Card>
          <Card>
            <div className="card-heading">
              <h2>Atualizar perfil</h2>
            </div>
            <form className="form-grid two-columns" onSubmit={submit}>
              <Input label="Nome" value={form.firstName} onChange={(event) => update("firstName", event.target.value)} required />
              <Input label="Sobrenome" value={form.lastName} onChange={(event) => update("lastName", event.target.value)} required />
              <Input label="Nome de exibicao" value={form.displayName} onChange={(event) => update("displayName", event.target.value)} />
              <Input label="Avatar URL" value={form.avatarUrl} onChange={(event) => update("avatarUrl", event.target.value)} />
              <Select
                label="Timezone"
                value={form.timezone}
                onChange={(event) => update("timezone", event.target.value)}
                options={[
                  { value: "America/Recife", label: "America/Recife" },
                  { value: "America/Sao_Paulo", label: "America/Sao_Paulo" }
                ]}
              />
              <Input label="Inicio do mes financeiro" type="number" min="1" max="28" value={form.financialMonthStartDay} onChange={(event) => update("financialMonthStartDay", event.target.value)} />
              {message ? <p className="form-message success">{message}</p> : null}
              <Button type="submit">Salvar perfil</Button>
            </form>
          </Card>
        </>
      ) : null}
    </div>
  );
}
