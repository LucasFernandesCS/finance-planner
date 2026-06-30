import { useState } from "react";

import { navigate } from "../../app/navigation";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { ApiError, apiRequest } from "../../lib/api";
import { setAccessToken } from "../../lib/auth-token";
import type { PublicUser } from "../../lib/types";

type AuthMessage = { kind: "success" | "error"; text: string } | null;

export function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<AuthMessage>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const isEmail = identifier.includes("@");

    try {
      const result = await apiRequest<{ accessToken: string; user: PublicUser }>("/auth/login", {
        method: "POST",
        auth: false,
        body: {
          [isEmail ? "email" : "cpf"]: identifier,
          password
        }
      });

      setAccessToken(result.accessToken);
      navigate("/dashboard");
    } catch (error) {
      setMessage({
        kind: "error",
        text: error instanceof ApiError ? error.message : "Credenciais invalidas."
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <Card className="auth-card">
        <p className="eyebrow">Finance Planner</p>
        <h1>Entrar</h1>
        <form className="form-grid" onSubmit={submit}>
          <Input label="Email ou CPF" value={identifier} onChange={(event) => setIdentifier(event.target.value)} required />
          <Input label="Senha" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {message ? <p className={`form-message ${message.kind}`}>{message.text}</p> : null}
          <Button type="submit" disabled={submitting}>{submitting ? "Entrando..." : "Entrar"}</Button>
        </form>
        <button className="link-button" type="button" onClick={() => navigate("/register")}>Criar conta</button>
      </Card>
    </main>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cpf: "",
    password: ""
  });
  const [message, setMessage] = useState<AuthMessage>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await apiRequest<{ user: PublicUser }>("/auth/register", {
        method: "POST",
        auth: false,
        body: form
      });
      setMessage({ kind: "success", text: "Conta criada com sucesso." });
      window.setTimeout(() => navigate("/login"), 500);
    } catch (error) {
      setMessage({
        kind: "error",
        text: error instanceof ApiError ? error.message : "Nao foi possivel criar a conta."
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <Card className="auth-card wide">
        <p className="eyebrow">Finance Planner</p>
        <h1>Criar conta</h1>
        <form className="form-grid two-columns" onSubmit={submit}>
          <Input label="Nome" value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} required />
          <Input label="Sobrenome" value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} required />
          <Input label="Email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
          <Input label="CPF" value={form.cpf} onChange={(event) => updateField("cpf", event.target.value)} required />
          <Input label="Senha" type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} required />
          {message ? <p className={`form-message ${message.kind}`}>{message.text}</p> : null}
          <Button type="submit" disabled={submitting}>{submitting ? "Criando..." : "Criar conta"}</Button>
        </form>
        <button className="link-button" type="button" onClick={() => navigate("/login")}>Ja tenho conta</button>
      </Card>
    </main>
  );
}
