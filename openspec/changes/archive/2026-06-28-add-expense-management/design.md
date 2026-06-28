# Design: Adicionar Gerenciamento de Despesas

## Visão geral

Esta mudança adiciona gerenciamento de despesas para usuários autenticados.

O sistema terá duas seções:

- despesas fixas
- despesas variáveis

Despesas fixas são recorrentes e representam gastos que se repetem nos meses futuros enquanto estiverem ativas.

Despesas variáveis são pontuais e pertencem a um mês específico.

A implementação seguirá TDD:

```txt
1. Criar testes unitários de validação de despesas
2. Implementar validações puras
3. Criar testes unitários dos services
4. Implementar services
5. Criar testes de integração dos endpoints
6. Implementar rotas, controllers, repositories e Prisma
7. Rodar suíte completa
```

O backend seguirá a arquitetura em camadas:

```txt
Route → Controller → Service → Repository → Prisma
```

O domínio será implementado em:

```txt
apps/api/src/modules/expenses/
```

## Decisões técnicas

### Representação monetária

O sistema SHALL representar valores monetários como inteiro em centavos.

Exemplo:

```txt
R$ 850,00 → 85000
R$ 1.621,50 → 162150
```

Campo sugerido:

```txt
amountInCents
```

Isso evita problemas de precisão com números decimais em JavaScript.

### Tipos de despesa

O sistema SHALL separar despesas em dois models principais:

```txt
FixedExpense
VariableExpense
```

A separação evita misturar regras de recorrência com despesas pontuais.

### Despesas fixas

Despesas fixas representam gastos recorrentes.

Exemplos:

- Água
- Energia
- Condomínio
- Aluguel
- IPVA
- IPTU
- Internet
- Plano de saúde
- Escola
- Academia
- Assinaturas

A despesa fixa SHALL possuir um mês inicial de vigência.

Campo sugerido:

```txt
startMonth
```

Exemplo:

```txt
2026-06-01
```

Mesmo que a API receba `2026-06`, a persistência pode normalizar para o primeiro dia do mês.

Enquanto a despesa fixa estiver ativa, ela poderá ser considerada nos meses futuros.

Para remoção, nesta change o sistema SHALL permitir remover uma despesa fixa própria. Uma estratégia futura poderá substituir remoção por encerramento de vigência, caso seja necessário preservar histórico financeiro detalhado.

### Despesas variáveis

Despesas variáveis representam gastos pontuais de um mês específico.

Exemplos:

- iFood
- Uber
- Compras
- Farmácia
- Lazer
- Manutenção
- Presente
- Mercado extra

A despesa variável SHALL possuir mês de referência.

Campo sugerido:

```txt
referenceMonth
```

Exemplo:

```txt
2026-06-01
```

### Categorias

O sistema SHALL aceitar categorias padronizadas.

Categorias sugeridas:

```txt
WATER
ENERGY
CONDOMINIUM
RENT
IPVA
IPTU
INTERNET
HEALTH
EDUCATION
TRANSPORT
FOOD
GROCERIES
SHOPPING
LEISURE
SUBSCRIPTION
MAINTENANCE
TAX
OTHER
```

As categorias podem ser usadas tanto para despesas fixas quanto para despesas variáveis.

### Ownership

O usuário autenticado SHALL ser identificado pelo token JWT.

O client não deve enviar `userId` para criar despesas.

O `userId` da despesa SHALL ser sempre derivado do usuário autenticado.

Um usuário SHALL NOT conseguir atualizar, remover ou acessar despesas pertencentes a outro usuário.

### Limites

Valores de despesa SHALL respeitar:

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
apps/api/src/modules/expenses/
├── expense.routes.ts
├── fixed-expense.controller.ts
├── variable-expense.controller.ts
├── fixed-expense.service.ts
├── variable-expense.service.ts
├── expense.repository.ts
├── expense.schemas.ts
├── expense.types.ts
└── expense.errors.ts
```

Testes esperados:

```txt
apps/api/tests/unit/expenses/expense-policy.spec.ts
apps/api/tests/unit/expenses/fixed-expense.service.spec.ts
apps/api/tests/unit/expenses/variable-expense.service.spec.ts
apps/api/tests/integration/expenses/fixed-expense.spec.ts
apps/api/tests/integration/expenses/variable-expense.spec.ts
```

## Áreas afetadas

- `apps/api/src/modules/expenses` — novo módulo de despesas.
- `apps/api/src/app.ts` — registro das rotas de despesas.
- `apps/api/src/shared/middlewares/auth` — middleware de autenticação existente.
- `apps/api/prisma/schema.prisma` — models de despesas.
- `apps/api/tests/unit/expenses` — testes unitários.
- `apps/api/tests/integration/expenses` — testes de integração.

## Modelo de dados

### ExpenseCategory

```prisma
enum ExpenseCategory {
  WATER
  ENERGY
  CONDOMINIUM
  RENT
  IPVA
  IPTU
  INTERNET
  HEALTH
  EDUCATION
  TRANSPORT
  FOOD
  GROCERIES
  SHOPPING
  LEISURE
  SUBSCRIPTION
  MAINTENANCE
  TAX
  OTHER
}
```

### FixedExpense

```prisma
model FixedExpense {
  id            String          @id @default(uuid())
  userId        String
  title         String
  amountInCents BigInt
  category      ExpenseCategory
  startMonth    DateTime
  description   String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, startMonth])
  @@index([userId, category])
}
```

### VariableExpense

```prisma
model VariableExpense {
  id             String          @id @default(uuid())
  userId         String
  title          String
  amountInCents  BigInt
  category       ExpenseCategory
  referenceMonth DateTime
  description    String?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, referenceMonth])
  @@index([userId, category])
}
```

O model `User` deverá receber:

```prisma
fixedExpenses FixedExpense[]
variableExpenses VariableExpense[]
```

## Contrato de API

Todas as rotas SHALL exigir autenticação.

## Despesas fixas

### POST /fixed-expenses

Cria uma despesa fixa para o usuário autenticado.

Request:

```json
{
  "title": "Condomínio",
  "amountInCents": 73000,
  "category": "CONDOMINIUM",
  "startMonth": "2026-06",
  "description": "Condomínio do apartamento"
}
```

Success response:

```json
{
  "fixedExpense": {
    "id": "uuid",
    "title": "Condomínio",
    "amountInCents": 73000,
    "category": "CONDOMINIUM",
    "startMonth": "2026-06",
    "description": "Condomínio do apartamento"
  }
}
```

### GET /fixed-expenses

Lista despesas fixas do usuário autenticado.

Success response:

```json
{
  "fixedExpenses": [
    {
      "id": "uuid",
      "title": "Condomínio",
      "amountInCents": 73000,
      "category": "CONDOMINIUM",
      "startMonth": "2026-06",
      "description": "Condomínio do apartamento"
    }
  ]
}
```

### PATCH /fixed-expenses/:fixedExpenseId

Atualiza uma despesa fixa do usuário autenticado.

Request:

```json
{
  "title": "Condomínio atualizado",
  "amountInCents": 80000,
  "category": "CONDOMINIUM",
  "startMonth": "2026-06",
  "description": "Novo valor do condomínio"
}
```

Success response:

```json
{
  "fixedExpense": {
    "id": "uuid",
    "title": "Condomínio atualizado",
    "amountInCents": 80000,
    "category": "CONDOMINIUM",
    "startMonth": "2026-06",
    "description": "Novo valor do condomínio"
  }
}
```

### DELETE /fixed-expenses/:fixedExpenseId

Remove uma despesa fixa do usuário autenticado.

Success response:

```json
{
  "message": "Despesa fixa removida com sucesso."
}
```

## Despesas variáveis

### POST /variable-expenses

Cria uma despesa variável para o usuário autenticado.

Request:

```json
{
  "title": "iFood",
  "amountInCents": 4500,
  "category": "FOOD",
  "referenceMonth": "2026-06",
  "description": "Pedido de comida"
}
```

Success response:

```json
{
  "variableExpense": {
    "id": "uuid",
    "title": "iFood",
    "amountInCents": 4500,
    "category": "FOOD",
    "referenceMonth": "2026-06",
    "description": "Pedido de comida"
  }
}
```

### GET /variable-expenses?month=2026-06

Lista despesas variáveis do usuário autenticado no mês informado.

Success response:

```json
{
  "variableExpenses": [
    {
      "id": "uuid",
      "title": "iFood",
      "amountInCents": 4500,
      "category": "FOOD",
      "referenceMonth": "2026-06",
      "description": "Pedido de comida"
    }
  ]
}
```

### PATCH /variable-expenses/:variableExpenseId

Atualiza uma despesa variável do usuário autenticado.

Request:

```json
{
  "title": "Uber",
  "amountInCents": 2800,
  "category": "TRANSPORT",
  "referenceMonth": "2026-06",
  "description": "Corrida de Uber"
}
```

Success response:

```json
{
  "variableExpense": {
    "id": "uuid",
    "title": "Uber",
    "amountInCents": 2800,
    "category": "TRANSPORT",
    "referenceMonth": "2026-06",
    "description": "Corrida de Uber"
  }
}
```

### DELETE /variable-expenses/:variableExpenseId

Remove uma despesa variável do usuário autenticado.

Success response:

```json
{
  "message": "Despesa variável removida com sucesso."
}
```

## Regras de validação

| Campo            | Regra                             |
| ---------------- | --------------------------------- |
| `title`          | obrigatório                       |
| `title`          | mínimo 1 caractere                |
| `title`          | máximo 100 caracteres             |
| `amountInCents`  | obrigatório                       |
| `amountInCents`  | inteiro                           |
| `amountInCents`  | maior que zero                    |
| `amountInCents`  | menor ou igual a `99999999999`    |
| `category`       | obrigatório                       |
| `category`       | deve ser uma categoria válida     |
| `startMonth`     | obrigatório para despesa fixa     |
| `startMonth`     | formato `YYYY-MM`                 |
| `referenceMonth` | obrigatório para despesa variável |
| `referenceMonth` | formato `YYYY-MM`                 |

## Mapeamento de erros

| Caso                                          | HTTP Status | Código de erro                  |
| --------------------------------------------- | ----------: | ------------------------------- |
| Não autenticado                               |         401 | UNAUTHORIZED                    |
| Despesa fixa não encontrada                   |         404 | FIXED_EXPENSE_NOT_FOUND         |
| Despesa variável não encontrada               |         404 | VARIABLE_EXPENSE_NOT_FOUND      |
| Tentativa de alterar despesa de outro usuário |         403 | FORBIDDEN                       |
| Campos obrigatórios ausentes                  |         400 | VALIDATION_ERROR                |
| Valor negativo                                |         400 | EXPENSE_AMOUNT_MUST_BE_POSITIVE |
| Valor zerado                                  |         400 | EXPENSE_AMOUNT_MUST_BE_POSITIVE |
| Valor acima do limite                         |         400 | EXPENSE_AMOUNT_OVERFLOW         |
| Título muito longo                            |         400 | EXPENSE_TITLE_TOO_LONG          |
| Categoria inválida                            |         400 | INVALID_EXPENSE_CATEGORY        |
| Mês inválido                                  |         400 | INVALID_REFERENCE_MONTH         |

## Testes unitários

### expense-policy.spec.ts

Deve testar regras puras:

- aceita despesa válida
- rejeita valor negativo
- rejeita valor zerado
- rejeita valor acima do limite
- rejeita título vazio
- rejeita título muito longo
- rejeita categoria inválida
- rejeita mês inválido

### fixed-expense.service.spec.ts

Deve testar o service com repository mockado:

- cria despesa fixa para usuário autenticado
- lista despesas fixas do usuário autenticado
- atualiza despesa fixa própria
- remove despesa fixa própria
- rejeita alteração de despesa fixa pertencente a outro usuário
- rejeita remoção de despesa fixa pertencente a outro usuário
- rejeita despesa fixa não encontrada
- rejeita valores inválidos

### variable-expense.service.spec.ts

Deve testar o service com repository mockado:

- cria despesa variável para usuário autenticado
- lista despesas variáveis do usuário autenticado por mês
- atualiza despesa variável própria
- remove despesa variável própria
- rejeita alteração de despesa variável pertencente a outro usuário
- rejeita remoção de despesa variável pertencente a outro usuário
- rejeita despesa variável não encontrada
- rejeita valores inválidos

## Testes de integração

### fixed-expense.spec.ts

Cenários obrigatórios:

- adição de despesa fixa bem-sucedida
- tentativa de adicionar despesa fixa sem autenticação
- tentativa de editar despesa fixa de outro usuário
- tentativa de remover despesa fixa de outro usuário
- tentativa de adicionar despesa fixa negativa
- tentativa de adicionar despesa fixa zerada
- tentativa de adicionar despesa fixa sem campos obrigatórios
- tentativa de adicionar despesa fixa acima do limite
- tentativa de adicionar despesa fixa com título muito longo
- listagem retorna apenas despesas fixas do usuário autenticado
- atualização de despesa fixa própria
- remoção de despesa fixa própria

### variable-expense.spec.ts

Cenários obrigatórios:

- adição de despesa variável bem-sucedida
- tentativa de adicionar despesa variável sem autenticação
- tentativa de editar despesa variável de outro usuário
- tentativa de remover despesa variável de outro usuário
- tentativa de adicionar despesa variável negativa
- tentativa de adicionar despesa variável zerada
- tentativa de adicionar despesa variável sem campos obrigatórios
- tentativa de adicionar despesa variável acima do limite
- tentativa de adicionar despesa variável com título muito longo
- listagem retorna apenas despesas variáveis do usuário autenticado
- atualização de despesa variável própria
- remoção de despesa variável própria

## Estratégia TDD

A implementação SHALL seguir esta ordem:

```txt
1. Criar testes unitários de validação de despesas
2. Rodar e confirmar falha
3. Implementar validações puras
4. Rodar e confirmar sucesso

5. Criar testes unitários do FixedExpenseService
6. Rodar e confirmar falha
7. Implementar FixedExpenseService
8. Rodar e confirmar sucesso

9. Criar testes unitários do VariableExpenseService
10. Rodar e confirmar falha
11. Implementar VariableExpenseService
12. Rodar e confirmar sucesso

13. Criar testes de integração de despesas fixas
14. Rodar e confirmar falha
15. Implementar rotas, controller, repository e Prisma para despesas fixas
16. Rodar e confirmar sucesso

17. Criar testes de integração de despesas variáveis
18. Rodar e confirmar falha
19. Implementar rotas, controller, repository e Prisma para despesas variáveis
20. Rodar e confirmar sucesso

21. Rodar suíte completa
```

## Restrições

- Não implementar frontend.
- Não implementar dashboard.
- Não permitir `userId` no body.
- Não permitir acesso a despesas de outro usuário.
- Não usar valores monetários em ponto flutuante para cálculos internos.
- Não alterar autenticação existente além do uso do middleware.
