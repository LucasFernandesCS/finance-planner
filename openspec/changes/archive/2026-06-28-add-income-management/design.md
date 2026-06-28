# Design: Adicionar Gerenciamento de Rendas

## Visão geral

Esta mudança adiciona gerenciamento de rendas para usuários autenticados.

O usuário poderá registrar quanto espera receber em um mês, separando renda mensal e renda extra.

A implementação seguirá TDD:

```txt
1. Criar testes unitários de validação de renda
2. Implementar validações puras
3. Criar testes unitários do IncomeService
4. Implementar IncomeService
5. Criar testes de integração dos endpoints
6. Implementar rotas, controller, repository e Prisma
7. Rodar suíte completa
```

O backend seguirá a arquitetura em camadas:

```txt
Route → Controller → Service → Repository → Prisma
```

O domínio será implementado em:

```txt
apps/api/src/modules/incomes/
```

## Decisões técnicas

### Representação monetária

O sistema SHALL representar valores monetários como inteiro em centavos.

Exemplo:

```txt
R$ 2.120,00 → 212000
R$ 1.621,50 → 162150
```

Campo sugerido:

```txt
amountInCents
```

Isso evita problemas de precisão com números decimais em JavaScript.

### Tipos de renda

O sistema SHALL aceitar dois tipos de renda:

```txt
MONTHLY
EXTRA
```

- `MONTHLY`: renda mensal principal, como salário.
- `EXTRA`: renda pontual daquele mês, como herança, bônus, devolução de empréstimo ou comissão.

### Histórico mensal

Cada renda SHALL possuir um mês de referência.

Campo sugerido:

```txt
referenceMonth
```

O valor deverá representar o mês da renda.

Exemplo:

```txt
2026-06-01
```

Mesmo que a API receba `2026-06`, a persistência pode normalizar para o primeiro dia do mês.

Essa decisão permite gerar gráficos futuramente usando os registros mensais.

### Ownership

O usuário autenticado SHALL ser identificado pelo token JWT.

O client não deve enviar `userId` para criar uma renda.

O `userId` da renda SHALL ser sempre derivado do usuário autenticado.

Um usuário SHALL NOT conseguir atualizar, remover ou acessar rendas pertencentes a outro usuário.

### Limites

Valores de renda SHALL respeitar:

```txt
amountInCents > 0
amountInCents <= 99999999999
```

Esse limite representa:

```txt
R$ 999.999.999,99
```

Títulos SHALL respeitar:

```txt
1 até 100 caracteres
```

## Arquitetura

Estrutura esperada:

```txt
apps/api/src/modules/incomes/
├── income.routes.ts
├── income.controller.ts
├── income.service.ts
├── income.repository.ts
├── income.schemas.ts
├── income.types.ts
└── income.errors.ts
```

Testes esperados:

```txt
apps/api/tests/unit/incomes/income-policy.spec.ts
apps/api/tests/unit/incomes/income.service.spec.ts
apps/api/tests/integration/incomes/income.spec.ts
```

## Áreas afetadas

- `apps/api/src/modules/incomes` — novo módulo de rendas.
- `apps/api/src/app.ts` — registro das rotas de renda.
- `apps/api/src/shared/middlewares/auth` — middleware de autenticação já existente.
- `apps/api/prisma/schema.prisma` — model de renda.
- `apps/api/tests/unit/incomes` — testes unitários.
- `apps/api/tests/integration/incomes` — testes de integração.

## Modelo de dados

### Income

```prisma
enum IncomeType {
  MONTHLY
  EXTRA
}

model Income {
  id             String     @id @default(uuid())
  userId         String
  title          String
  amountInCents  BigInt
  type           IncomeType
  referenceMonth DateTime
  description    String?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, referenceMonth])
  @@index([userId, type])
}
```

O model `User` deverá receber:

```prisma
incomes Income[]
```

## Contrato de API

Todas as rotas SHALL exigir autenticação.

### POST /incomes

Cria uma renda para o usuário autenticado.

Request:

```json
{
  "title": "Salário",
  "amountInCents": 212000,
  "type": "MONTHLY",
  "referenceMonth": "2026-06",
  "description": "Salário atual"
}
```

Success response:

```json
{
  "income": {
    "id": "uuid",
    "title": "Salário",
    "amountInCents": 212000,
    "type": "MONTHLY",
    "referenceMonth": "2026-06",
    "description": "Salário atual"
  }
}
```

### GET /incomes?month=2026-06

Lista rendas do usuário autenticado no mês informado.

Success response:

```json
{
  "incomes": [
    {
      "id": "uuid",
      "title": "Salário",
      "amountInCents": 212000,
      "type": "MONTHLY",
      "referenceMonth": "2026-06",
      "description": "Salário atual"
    },
    {
      "id": "uuid",
      "title": "Bônus",
      "amountInCents": 50000,
      "type": "EXTRA",
      "referenceMonth": "2026-06",
      "description": "Bônus do mês"
    }
  ]
}
```

### PATCH /incomes/:incomeId

Atualiza uma renda do usuário autenticado.

Request:

```json
{
  "title": "Salário atualizado",
  "amountInCents": 212000,
  "type": "MONTHLY",
  "referenceMonth": "2026-06",
  "description": "Novo salário"
}
```

Success response:

```json
{
  "income": {
    "id": "uuid",
    "title": "Salário atualizado",
    "amountInCents": 212000,
    "type": "MONTHLY",
    "referenceMonth": "2026-06",
    "description": "Novo salário"
  }
}
```

### DELETE /incomes/:incomeId

Remove uma renda do usuário autenticado.

Success response:

```json
{
  "message": "Renda removida com sucesso."
}
```

## Regras de validação

| Campo            | Regra                          |
| ---------------- | ------------------------------ |
| `title`          | obrigatório                    |
| `title`          | mínimo 1 caractere             |
| `title`          | máximo 100 caracteres          |
| `amountInCents`  | obrigatório                    |
| `amountInCents`  | inteiro                        |
| `amountInCents`  | maior que zero                 |
| `amountInCents`  | menor ou igual a `99999999999` |
| `type`           | obrigatório                    |
| `type`           | deve ser `MONTHLY` ou `EXTRA`  |
| `referenceMonth` | obrigatório                    |
| `referenceMonth` | formato `YYYY-MM`              |

## Mapeamento de erros

| Caso                                        | HTTP Status | Código de erro                 |
| ------------------------------------------- | ----------: | ------------------------------ |
| Não autenticado                             |         401 | UNAUTHORIZED                   |
| Renda não encontrada                        |         404 | INCOME_NOT_FOUND               |
| Tentativa de alterar renda de outro usuário |         403 | FORBIDDEN                      |
| Campos obrigatórios ausentes                |         400 | VALIDATION_ERROR               |
| Valor negativo                              |         400 | INCOME_AMOUNT_MUST_BE_POSITIVE |
| Valor zerado                                |         400 | INCOME_AMOUNT_MUST_BE_POSITIVE |
| Valor acima do limite                       |         400 | INCOME_AMOUNT_OVERFLOW         |
| Título muito longo                          |         400 | INCOME_TITLE_TOO_LONG          |

## Testes unitários

### income-policy.spec.ts

Deve testar regras puras:

- aceita renda válida
- rejeita valor negativo
- rejeita valor zerado
- rejeita valor acima do limite
- rejeita título vazio
- rejeita título muito longo
- rejeita tipo inválido
- rejeita mês de referência inválido

### income.service.spec.ts

Deve testar o service com repository mockado:

- cria renda para usuário autenticado
- atualiza renda própria
- remove renda própria
- lista rendas do usuário autenticado
- rejeita alteração de renda pertencente a outro usuário
- rejeita remoção de renda pertencente a outro usuário
- rejeita renda não encontrada
- rejeita valores inválidos

## Testes de integração

Arquivo sugerido:

```txt
apps/api/tests/integration/incomes/income.spec.ts
```

Cenários obrigatórios:

- adição de renda bem-sucedida
- tentativa de adicionar renda sem autenticação
- tentativa de editar renda de outro usuário
- tentativa de remover renda de outro usuário
- tentativa de adicionar renda negativa
- tentativa de adicionar renda zerada
- tentativa de adicionar renda sem campos obrigatórios
- tentativa de adicionar renda acima do limite
- tentativa de adicionar renda com título muito longo
- listagem retorna apenas rendas do usuário autenticado
- atualização de renda própria
- remoção de renda própria

## Estratégia TDD

A implementação SHALL seguir esta ordem:

```txt
1. Criar testes unitários de validação de renda
2. Rodar e confirmar falha
3. Implementar validações puras
4. Rodar e confirmar sucesso

5. Criar testes unitários do IncomeService
6. Rodar e confirmar falha
7. Implementar IncomeService
8. Rodar e confirmar sucesso

9. Criar testes de integração de POST /incomes
10. Rodar e confirmar falha
11. Implementar rota, controller, repository e Prisma para criação
12. Rodar e confirmar sucesso

13. Criar testes de integração de GET /incomes
14. Implementar listagem

15. Criar testes de integração de PATCH /incomes/:incomeId
16. Implementar atualização

17. Criar testes de integração de DELETE /incomes/:incomeId
18. Implementar remoção

19. Rodar suíte completa
```

## Restrições

- Não implementar frontend.
- Não implementar dashboard.
- Não permitir `userId` no body.
- Não permitir acesso a rendas de outro usuário.
- Não usar valores monetários em ponto flutuante para cálculos internos.
- Não alterar autenticação existente além do uso do middleware.
