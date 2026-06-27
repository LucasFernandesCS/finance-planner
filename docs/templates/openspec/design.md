# Design: <Título da mudança>

## Visão geral

<Explique a abordagem técnica da mudança. Descreva, em alto nível, como a solução será implementada.>

## Arquitetura

<Descreva as camadas, módulos, serviços, repositórios, componentes ou dependências afetadas.>

Fluxo backend preferido:

```txt
Route → Controller → Service → Repository → Prisma
```

## Áreas afetadas

- `<caminho/do/arquivo-ou-módulo>` — <motivo da alteração>
- `<caminho/do/arquivo-ou-módulo>` — <motivo da alteração>
- `<caminho/do/arquivo-ou-módulo>` — <motivo da alteração>

## Contrato de API

### <MÉTODO> <ROTA>

Exemplo:

```txt
POST /auth/login
```

Request:

```json
{
  "field": "value"
}
```

Success response:

```json
{
  "id": "uuid",
  "field": "value"
}
```

Error response:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem legível para o usuário ou desenvolvedor"
  }
}
```

## Modelo de dados

<Descreva tabelas, models do Prisma, migrations, índices, constraints e relacionamentos afetados.>

Exemplo:

```prisma
model Example {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
}
```

## Regras de validação

| Campo     | Regra     |
| --------- | --------- |
| `<campo>` | `<regra>` |
| `<campo>` | `<regra>` |

## Regras de autorização

| Ação      | Quem pode executar        |
| --------- | ------------------------- |
| Criar     | <usuário/regra/permissão> |
| Listar    | <usuário/regra/permissão> |
| Detalhar  | <usuário/regra/permissão> |
| Atualizar | <usuário/regra/permissão> |
| Remover   | <usuário/regra/permissão> |

## Mapeamento de erros

| Caso              | HTTP Status | Código de erro   |
| ----------------- | ----------: | ---------------- |
| Entrada inválida  |         400 | VALIDATION_ERROR |
| Não autenticado   |         401 | UNAUTHORIZED     |
| Sem permissão     |         403 | FORBIDDEN        |
| Não encontrado    |         404 | NOT_FOUND        |
| Conflito de regra |         409 | CONFLICT         |

## Estratégia de testes

### Testes unitários

- <O que precisa ser testado isoladamente>

### Testes de integração

- <O que precisa ser testado com API/banco/camadas integradas>

### Testes E2E

- <O que precisa ser testado como fluxo completo, se aplicável>

## Perguntas em aberto

- <Dúvida técnica ou de negócio ainda não resolvida>
- <Dúvida técnica ou de negócio ainda não resolvida>
