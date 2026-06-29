# Design: Adicionar Gerenciamento de Dívidas

## Visão geral

Esta mudança adiciona gerenciamento de dívidas para usuários autenticados.

Uma dívida representa um passivo financeiro. Ela possui um saldo devedor, um credor, um tipo, uma data de vencimento mensal e um status.

O pagamento da dívida representa uma saída de caixa real. Por isso, ao registrar um pagamento, o sistema deverá criar uma despesa variável reflexa.

A implementação seguirá TDD:

```txt
1. Criar testes unitários de regras de dívida
2. Implementar regras puras
3. Criar testes unitários do DebtService
4. Implementar DebtService
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
apps/api/src/modules/debts/
```

## Decisões técnicas

### Representação monetária

O sistema SHALL representar valores monetários como inteiro em centavos.

Exemplo:

```txt
R$ 10.000,00 → 1000000
R$ 500,00 → 50000
```

Campos monetários principais:

```txt
originalAmountInCents
currentBalanceInCents
installmentAmountInCents
amountInCents
```

### Status da dívida

O sistema SHALL aceitar os seguintes status:

```txt
IN_PROGRESS
OVERDUE
PAID
```

Significados:

- `IN_PROGRESS`: dívida em andamento e ainda não quitada.
- `OVERDUE`: dívida vencida no mês atual sem pagamento registrado.
- `PAID`: dívida quitada, com saldo devedor igual a zero.

Embora a ideia inicial tenha citado apenas “Em andamento” e “Quitada”, o status `OVERDUE` é necessário porque a regra de negócio exige marcar atraso quando o vencimento não foi pago.

### Tipos de dívida

O sistema SHALL aceitar os seguintes tipos:

```txt
INSTALLMENT
RECURRING
REVOLVING
INFORMAL_LOAN
FINANCING
OTHER
```

Significados:

- `INSTALLMENT`: dívida parcelada com valor de parcela esperado.
- `RECURRING`: débito recorrente enquanto existir saldo.
- `REVOLVING`: dívida rotativa, como cartão ou crédito rotativo.
- `INFORMAL_LOAN`: empréstimo informal, como dívida com amigo ou familiar.
- `FINANCING`: financiamento, como carro ou imóvel.
- `OTHER`: outro tipo de dívida.

### Saldo devedor

A dívida terá dois valores principais:

```txt
originalAmountInCents
currentBalanceInCents
```

Na criação da dívida:

```txt
currentBalanceInCents = originalAmountInCents
```

Ao registrar pagamento:

```txt
novoSaldo = currentBalanceInCents - amountInCents
```

O sistema SHALL rejeitar pagamento maior que o saldo atual.

### Pagamento da dívida

O usuário SHALL poder registrar pagamentos em uma dívida.

Cada pagamento SHALL criar um registro em `DebtPayment`.

Cada pagamento SHALL reduzir o saldo devedor da dívida.

Cada pagamento SHALL criar uma despesa variável reflexa.

A criação do pagamento, a atualização da dívida e a criação da despesa reflexa SHALL ocorrer na mesma transação.

### Despesa variável reflexa

Como ainda não existe módulo de conta bancária interna, o pagamento da dívida SHALL ser refletido no fluxo de caixa através de uma despesa variável.

A despesa variável reflexa deverá conter:

```txt
title = "Pagamento de dívida: {debt.title}"
amountInCents = valor pago
category = DEBT_PAYMENT
referenceMonth = mês do pagamento
description = observação do pagamento ou referência da dívida
```

Caso o enum atual de categorias de despesa ainda não tenha categoria própria para dívida, esta change SHALL adicionar:

```txt
DEBT_PAYMENT
```

ao enum `ExpenseCategory`.

### Vencimento mensal

A dívida SHALL possuir um dia de vencimento mensal.

Campo sugerido:

```txt
monthlyDueDay
```

O sistema SHALL aceitar valores entre:

```txt
1 e 28
```

O limite em 28 evita problemas com meses de tamanhos diferentes.

### Marcação de atraso

Uma dívida SHALL ser marcada como `OVERDUE` quando:

```txt
status != PAID
AND currentBalanceInCents > 0
AND data atual é posterior ao vencimento do mês atual
AND não existe pagamento registrado para a dívida no mês atual
```

No MVP, essa atualização será feita de forma preguiçosa durante:

```txt
GET /debts
GET /debts/:debtId
POST /debts/:debtId/payments
```

Não será criado job em background nesta change.

### Pagamento de dívida atrasada

Se uma dívida estiver `OVERDUE` e o usuário registrar um pagamento válido, o sistema SHALL:

- reduzir o saldo
- criar histórico de pagamento
- criar despesa variável reflexa
- alterar o status para `PAID` se o saldo chegar a zero
- alterar o status para `IN_PROGRESS` se ainda houver saldo

### Quitação automática

Quando um pagamento faz o saldo devedor chegar a zero, o sistema SHALL alterar o status automaticamente para:

```txt
PAID
```

### Ownership

O usuário autenticado SHALL ser identificado pelo token JWT.

O client não deve enviar `userId` para criar dívida.

O `userId` da dívida SHALL ser sempre derivado do usuário autenticado.

Um usuário SHALL NOT conseguir listar, atualizar, remover ou pagar dívidas pertencentes a outro usuário.

### Limites

Valores de dívida SHALL respeitar:

```txt
originalAmountInCents > 0
originalAmountInCents <= 99999999999
currentBalanceInCents >= 0
installmentAmountInCents > 0 quando informado
installmentAmountInCents <= 99999999999
```

Esse limite representa:

```txt
R$ 999.999.999,99
```

Títulos SHALL respeitar:

```txt
1 até 100 caracteres
```

Credor SHALL respeitar:

```txt
1 até 100 caracteres
```

## Arquitetura

Estrutura esperada:

```txt
apps/api/src/modules/debts/
├── debt.routes.ts
├── debt.controller.ts
├── debt.service.ts
├── debt.repository.ts
├── debt.schemas.ts
├── debt.types.ts
├── debt.errors.ts
└── debt-policy.ts
```

Testes esperados:

```txt
apps/api/tests/unit/debts/debt-policy.spec.ts
apps/api/tests/unit/debts/debt.service.spec.ts
apps/api/tests/integration/debts/debt.spec.ts
```

## Áreas afetadas

- `apps/api/src/modules/debts` — novo módulo de dívidas.
- `apps/api/src/app.ts` — registro das rotas de dívidas.
- `apps/api/src/shared/middlewares/auth` — middleware de autenticação existente.
- `apps/api/src/modules/expenses` — criação de despesa variável reflexa.
- `apps/api/prisma/schema.prisma` — models de dívida e pagamento.
- `apps/api/tests/unit/debts` — testes unitários.
- `apps/api/tests/integration/debts` — testes de integração.

## Modelo de dados

### DebtStatus

```prisma
enum DebtStatus {
  IN_PROGRESS
  OVERDUE
  PAID
}
```

### DebtType

```prisma
enum DebtType {
  INSTALLMENT
  RECURRING
  REVOLVING
  INFORMAL_LOAN
  FINANCING
  OTHER
}
```

### ExpenseCategory

Adicionar ao enum existente:

```prisma
DEBT_PAYMENT
```

### Debt

```prisma
model Debt {
  id                       String     @id @default(uuid())
  userId                   String
  title                    String
  creditorName             String
  type                     DebtType
  status                   DebtStatus @default(IN_PROGRESS)
  originalAmountInCents    BigInt
  currentBalanceInCents    BigInt
  installmentAmountInCents BigInt?
  monthlyDueDay            Int
  description              String?
  createdAt                DateTime   @default(now())
  updatedAt                DateTime   @updatedAt

  user     User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  payments DebtPayment[]

  @@index([userId])
  @@index([userId, status])
  @@index([userId, type])
  @@index([userId, monthlyDueDay])
}
```

### DebtPayment

```prisma
model DebtPayment {
  id                  String   @id @default(uuid())
  userId              String
  debtId              String
  amountInCents       BigInt
  paidAt              DateTime @default(now())
  note                String?
  variableExpenseId   String?
  createdAt           DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  debt Debt @relation(fields: [debtId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([debtId])
  @@index([userId, paidAt])
}
```

O model `User` deverá receber:

```prisma
debts Debt[]
debtPayments DebtPayment[]
```

## Contrato de API

Todas as rotas SHALL exigir autenticação.

### POST /debts

Cria uma dívida para o usuário autenticado.

Request:

```json
{
  "title": "Financiamento do carro",
  "creditorName": "Banco Exemplo",
  "type": "FINANCING",
  "originalAmountInCents": 2500000,
  "installmentAmountInCents": 80000,
  "monthlyDueDay": 10,
  "description": "Financiamento do veículo"
}
```

Success response:

```json
{
  "debt": {
    "id": "uuid",
    "title": "Financiamento do carro",
    "creditorName": "Banco Exemplo",
    "type": "FINANCING",
    "status": "IN_PROGRESS",
    "originalAmountInCents": 2500000,
    "currentBalanceInCents": 2500000,
    "installmentAmountInCents": 80000,
    "monthlyDueDay": 10,
    "description": "Financiamento do veículo"
  }
}
```

### GET /debts

Lista dívidas do usuário autenticado.

Success response:

```json
{
  "debts": [
    {
      "id": "uuid",
      "title": "Financiamento do carro",
      "creditorName": "Banco Exemplo",
      "type": "FINANCING",
      "status": "IN_PROGRESS",
      "originalAmountInCents": 2500000,
      "currentBalanceInCents": 2500000,
      "installmentAmountInCents": 80000,
      "monthlyDueDay": 10
    }
  ]
}
```

### GET /debts/:debtId

Busca uma dívida específica do usuário autenticado.

### PATCH /debts/:debtId

Atualiza uma dívida própria.

Campos atualizáveis:

```txt
title
creditorName
type
installmentAmountInCents
monthlyDueDay
description
```

### DELETE /debts/:debtId

Remove uma dívida própria.

### POST /debts/:debtId/payments

Registra pagamento de uma dívida.

Request:

```json
{
  "amountInCents": 50000,
  "paidAt": "2026-06-29",
  "note": "Pagamento da parcela do mês"
}
```

Success response:

```json
{
  "debt": {
    "id": "uuid",
    "currentBalanceInCents": 2450000,
    "status": "IN_PROGRESS"
  },
  "payment": {
    "id": "uuid",
    "amountInCents": 50000,
    "paidAt": "2026-06-29",
    "note": "Pagamento da parcela do mês"
  },
  "variableExpense": {
    "id": "uuid",
    "title": "Pagamento de dívida: Financiamento do carro",
    "amountInCents": 50000,
    "category": "DEBT_PAYMENT",
    "referenceMonth": "2026-06"
  }
}
```

Quando o pagamento quitar a dívida:

```json
{
  "debt": {
    "id": "uuid",
    "currentBalanceInCents": 0,
    "status": "PAID"
  }
}
```

## Regras de validação

| Campo                        | Regra                                  |
| ---------------------------- | -------------------------------------- |
| `title`                      | obrigatório                            |
| `title`                      | máximo 100 caracteres                  |
| `creditorName`               | obrigatório                            |
| `creditorName`               | máximo 100 caracteres                  |
| `type`                       | obrigatório                            |
| `type`                       | deve ser um tipo válido                |
| `originalAmountInCents`      | obrigatório                            |
| `originalAmountInCents`      | maior que zero                         |
| `originalAmountInCents`      | menor ou igual a `99999999999`         |
| `installmentAmountInCents`   | opcional                               |
| `installmentAmountInCents`   | maior que zero quando informado        |
| `monthlyDueDay`              | obrigatório                            |
| `monthlyDueDay`              | inteiro entre 1 e 28                   |
| `amountInCents` em pagamento | obrigatório                            |
| `amountInCents` em pagamento | maior que zero                         |
| `amountInCents` em pagamento | não pode ser maior que o saldo devedor |

## Mapeamento de erros

| Caso                                         | HTTP Status | Código de erro                       |
| -------------------------------------------- | ----------: | ------------------------------------ |
| Não autenticado                              |         401 | UNAUTHORIZED                         |
| Dívida não encontrada                        |         404 | DEBT_NOT_FOUND                       |
| Tentativa de acessar dívida de outro usuário |         403 | FORBIDDEN                            |
| Campos obrigatórios ausentes                 |         400 | VALIDATION_ERROR                     |
| Valor da dívida negativo ou zerado           |         400 | DEBT_AMOUNT_MUST_BE_POSITIVE         |
| Valor da dívida acima do limite              |         400 | DEBT_AMOUNT_OVERFLOW                 |
| Título muito longo                           |         400 | DEBT_TITLE_TOO_LONG                  |
| Credor muito longo                           |         400 | DEBT_CREDITOR_TOO_LONG               |
| Tipo inválido                                |         400 | INVALID_DEBT_TYPE                    |
| Dia de vencimento inválido                   |         400 | INVALID_MONTHLY_DUE_DAY              |
| Pagamento negativo ou zerado                 |         400 | DEBT_PAYMENT_AMOUNT_MUST_BE_POSITIVE |
| Pagamento maior que saldo devedor            |         400 | DEBT_PAYMENT_EXCEEDS_BALANCE         |
| Tentativa de pagar dívida quitada            |         400 | DEBT_ALREADY_PAID                    |

## Testes unitários

### debt-policy.spec.ts

Deve testar regras puras:

- criação de dívida válida
- rejeição de dívida com valor negativo
- rejeição de dívida com valor zerado
- rejeição de dívida com valor acima do limite
- rejeição de título muito longo
- rejeição de credor muito longo
- rejeição de tipo inválido
- rejeição de vencimento menor que 1
- rejeição de vencimento maior que 28
- amortização bem-sucedida
- rejeição de pagamento negativo
- rejeição de pagamento zerado
- rejeição de pagamento maior que saldo devedor
- cálculo de status `PAID` quando saldo chega a zero
- cálculo de status `OVERDUE` quando vencimento passou e não houve pagamento no mês
- cálculo de status `IN_PROGRESS` quando pagamento regular é feito

### debt.service.spec.ts

Deve testar o service com repository mockado:

- cria dívida para usuário autenticado
- lista apenas dívidas do usuário autenticado
- atualiza dívida própria
- remove dívida própria
- rejeita atualização de dívida de outro usuário
- rejeita remoção de dívida de outro usuário
- registra pagamento em dívida própria
- reduz saldo devedor após pagamento
- cria histórico de pagamento
- cria despesa variável reflexa
- altera status para `PAID` quando saldo zera
- altera status para `OVERDUE` quando vencimento passou sem pagamento
- rejeita pagamento maior que saldo devedor
- rejeita pagamento em dívida de outro usuário
- rejeita pagamento em dívida quitada

## Testes de integração

Arquivo sugerido:

```txt
apps/api/tests/integration/debts/debt.spec.ts
```

Cenários obrigatórios:

- criação de dívida bem-sucedida
- tentativa de criar dívida sem autenticação
- tentativa de criar dívida com valor negativo
- tentativa de criar dívida com valor zerado
- tentativa de criar dívida sem campos obrigatórios
- tentativa de criar dívida com valor acima do limite
- tentativa de criar dívida com título muito longo
- listagem retorna apenas dívidas do usuário autenticado
- atualização de dívida própria
- tentativa de atualizar dívida de outro usuário
- remoção de dívida própria
- tentativa de remover dívida de outro usuário
- pagamento de dívida bem-sucedido
- pagamento reduz saldo devedor
- pagamento cria histórico em `DebtPayment`
- pagamento cria despesa variável reflexa
- tentativa de pagamento maior que saldo devedor
- tentativa de pagamento em dívida de outro usuário
- alteração automática para `PAID`
- alteração automática para `OVERDUE`
