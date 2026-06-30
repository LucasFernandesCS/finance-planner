# Design: Adicionar Acompanhamento de Reserva de Emergência

## Visão geral

Esta mudança adiciona acompanhamento de reserva de emergência para usuários autenticados.

A reserva de emergência é calculada com base no custo de vida mensal do usuário.

O usuário não informa uma meta fixa manualmente. Ele informa apenas a quantidade de meses de proteção desejada.

O sistema calcula:

```txt
targetAmountInCents = monthlyFixedExpensesInCents × protectionMonths
```

O saldo atual da reserva é controlado por depósitos e saques.

A meta é dinâmica e muda quando as despesas fixas do usuário mudam.

O backend seguirá a arquitetura em camadas:

```txt
Route → Controller → Service → Repository → Prisma
```

O domínio será implementado em:

```txt
apps/api/src/modules/reserve-tracking/
```

## Decisões técnicas

### Uma reserva por usuário

No MVP, cada usuário SHALL possuir no máximo uma reserva de emergência.

Isso simplifica o dashboard e evita múltiplas reservas concorrentes.

O model `EmergencyReserve` terá `userId` único.

### Representação monetária

O sistema SHALL representar valores monetários como inteiro em centavos.

Exemplo:

```txt
R$ 3.500,00 → 350000
R$ 21.000,00 → 2100000
```

Campos monetários principais:

```txt
currentBalanceInCents
amountInCents
targetAmountInCents calculado
monthlyFixedExpensesInCents calculado
```

### Meta dinâmica

A meta da reserva SHALL ser calculada dinamicamente.

```txt
targetAmountInCents = monthlyFixedExpensesInCents × protectionMonths
```

Onde:

```txt
monthlyFixedExpensesInCents = soma das despesas fixas ativas do usuário
```

A meta não deverá ser usada como fonte principal da verdade no banco.

O sistema poderá retornar a meta calculada nas respostas.

### Despesas fixas consideradas

O sistema SHALL considerar despesas fixas ativas do usuário.

No MVP, uma despesa fixa ativa é uma despesa fixa associada ao usuário autenticado cujo `startMonth` é menor ou igual ao mês atual.

Despesas variáveis não entram no cálculo da reserva.

Dívidas não entram diretamente no cálculo da reserva nesta change.

### Situação sem despesas fixas

Se o usuário não possui despesas fixas cadastradas, o sistema não consegue calcular uma meta realista.

Por isso, o sistema SHALL rejeitar a configuração inicial da reserva e retornar:

```txt
RESERVE_FIXED_EXPENSES_REQUIRED
```

O usuário deverá cadastrar despesas fixas antes de configurar a reserva.

### Meses de proteção

O usuário SHALL informar `protectionMonths`.

O valor deverá ser inteiro e maior ou igual a 1.

Valores comuns esperados:

```txt
3
6
12
```

O sistema não precisa limitar apenas a esses valores no MVP.

### Status da reserva

O sistema SHALL aceitar os seguintes status:

```txt
BUILDING
PROTECTED
REPLENISHING
```

Significados:

- `BUILDING`: saldo atual menor que a meta e reserva ainda não havia atingido proteção anteriormente.
- `PROTECTED`: saldo atual maior ou igual à meta.
- `REPLENISHING`: reserva já esteve protegida, mas ficou abaixo da meta por saque ou aumento das despesas fixas.

### Transição de status

O status SHALL ser calculado com base no saldo atual, meta atual e status anterior.

Regras:

```txt
Se currentBalanceInCents >= targetAmountInCents:
  status = PROTECTED

Se currentBalanceInCents < targetAmountInCents
AND status anterior era PROTECTED:
  status = REPLENISHING

Se currentBalanceInCents < targetAmountInCents
AND status anterior era REPLENISHING:
  status = REPLENISHING

Se currentBalanceInCents < targetAmountInCents
AND status anterior era BUILDING:
  status = BUILDING
```

Isso permite diferenciar uma reserva que nunca chegou à meta de uma reserva que já protegeu o usuário e agora precisa ser recomposta.

### Reposição por saque

Se a reserva estava `PROTECTED` e o usuário registra um saque que deixa o saldo menor que a meta, o sistema SHALL alterar status para:

```txt
REPLENISHING
```

### Reposição por aumento do custo de vida

Se a reserva estava `PROTECTED` e uma nova despesa fixa aumenta a meta acima do saldo atual, o sistema SHALL alterar status para:

```txt
REPLENISHING
```

Como não haverá job em background, essa atualização será feita de forma preguiçosa quando a reserva for consultada ou movimentada.

### Proteção por redução do custo de vida

Se uma despesa fixa é removida ou reduzida e a meta fica menor ou igual ao saldo atual, o sistema SHALL alterar status para:

```txt
PROTECTED
```

Essa atualização também será feita de forma preguiçosa durante a consulta ou movimentação da reserva.

### Movimentações da reserva

O sistema SHALL registrar movimentações da reserva em `ReserveTransaction`.

Tipos:

```txt
DEPOSIT
WITHDRAWAL
```

Cada depósito SHALL aumentar `currentBalanceInCents`.

Cada saque SHALL reduzir `currentBalanceInCents`.

O sistema SHALL rejeitar saque maior que saldo atual.

### Transação de banco

Ao registrar depósito ou saque, o sistema SHALL:

- criar `ReserveTransaction`
- atualizar `EmergencyReserve.currentBalanceInCents`
- atualizar `EmergencyReserve.status`

Essas ações SHALL ocorrer na mesma transação.

### Ownership

O usuário autenticado SHALL ser identificado pelo token JWT.

O client não deve enviar `userId` para criar ou alterar reserva.

O `userId` da reserva SHALL ser sempre derivado do usuário autenticado.

Um usuário SHALL NOT conseguir consultar, atualizar, depositar ou sacar da reserva de outro usuário.

### Limites

Valores de movimentação SHALL respeitar:

```txt
amountInCents > 0
amountInCents <= 99999999999
```

Esse limite representa:

```txt
R$ 999.999.999,99
```

`protectionMonths` SHALL respeitar:

```txt
protectionMonths >= 1
```

## Arquitetura

Estrutura esperada:

```txt
apps/api/src/modules/reserve-tracking/
├── reserve-tracking.routes.ts
├── reserve-tracking.controller.ts
├── reserve-tracking.service.ts
├── reserve-tracking.repository.ts
├── reserve-tracking.schemas.ts
├── reserve-tracking.types.ts
├── reserve-tracking.errors.ts
└── reserve-policy.ts
```

Testes esperados:

```txt
apps/api/tests/unit/reserve-tracking/reserve-policy.spec.ts
apps/api/tests/unit/reserve-tracking/reserve-tracking.service.spec.ts
apps/api/tests/integration/reserve-tracking/reserve-tracking.spec.ts
```

## Áreas afetadas

- `apps/api/src/modules/reserve-tracking` — novo módulo de reserva.
- `apps/api/src/app.ts` — registro das rotas de reserva.
- `apps/api/src/shared/middlewares/auth` — middleware de autenticação existente.
- `apps/api/src/modules/expenses` — leitura de despesas fixas.
- `apps/api/prisma/schema.prisma` — models de reserva e movimentações.
- `apps/api/tests/unit/reserve-tracking` — testes unitários.
- `apps/api/tests/integration/reserve-tracking` — testes de integração.

## Modelo de dados

### ReserveStatus

```prisma
enum ReserveStatus {
  BUILDING
  PROTECTED
  REPLENISHING
}
```

### ReserveTransactionType

```prisma
enum ReserveTransactionType {
  DEPOSIT
  WITHDRAWAL
}
```

### EmergencyReserve

```prisma
model EmergencyReserve {
  id                    String        @id @default(uuid())
  userId                String        @unique
  protectionMonths      Int
  currentBalanceInCents BigInt        @default(0)
  status                ReserveStatus @default(BUILDING)
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  user         User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions ReserveTransaction[]

  @@index([userId])
  @@index([userId, status])
}
```

### ReserveTransaction

```prisma
model ReserveTransaction {
  id            String                 @id @default(uuid())
  userId        String
  reserveId     String
  type          ReserveTransactionType
  amountInCents BigInt
  occurredAt    DateTime               @default(now())
  note          String?
  createdAt     DateTime               @default(now())

  user    User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  reserve EmergencyReserve @relation(fields: [reserveId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([reserveId])
  @@index([userId, occurredAt])
}
```

O model `User` deverá receber:

```prisma
emergencyReserve EmergencyReserve?
reserveTransactions ReserveTransaction[]
```

## Contrato de API

Todas as rotas SHALL exigir autenticação.

### GET /reserve

Consulta a reserva do usuário autenticado.

Se a reserva existir, o sistema retorna a reserva com meta calculada.

Success response:

```json
{
  "reserve": {
    "id": "uuid",
    "protectionMonths": 6,
    "currentBalanceInCents": 1050000,
    "monthlyFixedExpensesInCents": 350000,
    "targetAmountInCents": 2100000,
    "completionPercentage": 50,
    "status": "BUILDING"
  }
}
```

Se a reserva ainda não existir:

```json
{
  "reserve": null,
  "setupRequired": true
}
```

### POST /reserve

Configura a reserva do usuário autenticado.

Request:

```json
{
  "protectionMonths": 6
}
```

Success response:

```json
{
  "reserve": {
    "id": "uuid",
    "protectionMonths": 6,
    "currentBalanceInCents": 0,
    "monthlyFixedExpensesInCents": 350000,
    "targetAmountInCents": 2100000,
    "completionPercentage": 0,
    "status": "BUILDING"
  }
}
```

### PATCH /reserve

Atualiza os meses de proteção da reserva.

Request:

```json
{
  "protectionMonths": 12
}
```

Success response:

```json
{
  "reserve": {
    "id": "uuid",
    "protectionMonths": 12,
    "currentBalanceInCents": 1050000,
    "monthlyFixedExpensesInCents": 350000,
    "targetAmountInCents": 4200000,
    "completionPercentage": 25,
    "status": "BUILDING"
  }
}
```

### POST /reserve/deposits

Registra depósito na reserva.

Request:

```json
{
  "amountInCents": 50000,
  "occurredAt": "2026-06-29",
  "note": "Aporte do mês"
}
```

Success response:

```json
{
  "reserve": {
    "id": "uuid",
    "currentBalanceInCents": 1100000,
    "targetAmountInCents": 2100000,
    "completionPercentage": 52.38,
    "status": "BUILDING"
  },
  "transaction": {
    "id": "uuid",
    "type": "DEPOSIT",
    "amountInCents": 50000,
    "occurredAt": "2026-06-29",
    "note": "Aporte do mês"
  }
}
```

### POST /reserve/withdrawals

Registra saque da reserva.

Request:

```json
{
  "amountInCents": 30000,
  "occurredAt": "2026-06-29",
  "note": "Emergência médica"
}
```

Success response:

```json
{
  "reserve": {
    "id": "uuid",
    "currentBalanceInCents": 1070000,
    "targetAmountInCents": 2100000,
    "completionPercentage": 50.95,
    "status": "BUILDING"
  },
  "transaction": {
    "id": "uuid",
    "type": "WITHDRAWAL",
    "amountInCents": 30000,
    "occurredAt": "2026-06-29",
    "note": "Emergência médica"
  }
}
```

### GET /reserve/transactions

Lista movimentações da reserva.

Success response:

```json
{
  "transactions": [
    {
      "id": "uuid",
      "type": "DEPOSIT",
      "amountInCents": 50000,
      "occurredAt": "2026-06-29",
      "note": "Aporte do mês"
    }
  ]
}
```

## Regras de validação

| Campo              | Regra                          |
| ------------------ | ------------------------------ |
| `protectionMonths` | obrigatório                    |
| `protectionMonths` | inteiro                        |
| `protectionMonths` | maior ou igual a 1             |
| `amountInCents`    | obrigatório                    |
| `amountInCents`    | maior que zero                 |
| `amountInCents`    | menor ou igual a `99999999999` |
| `occurredAt`       | opcional                       |
| `note`             | opcional                       |
| `note`             | máximo 255 caracteres          |

## Mapeamento de erros

| Caso                                          | HTTP Status | Código de erro                              |
| --------------------------------------------- | ----------: | ------------------------------------------- |
| Não autenticado                               |         401 | UNAUTHORIZED                                |
| Reserva não encontrada                        |         404 | RESERVE_NOT_FOUND                           |
| Reserva já configurada                        |         409 | RESERVE_ALREADY_EXISTS                      |
| Campos inválidos                              |         400 | VALIDATION_ERROR                            |
| Meses de proteção inválidos                   |         400 | INVALID_PROTECTION_MONTHS                   |
| Usuário sem despesas fixas                    |         400 | RESERVE_FIXED_EXPENSES_REQUIRED             |
| Valor de movimentação negativo ou zerado      |         400 | RESERVE_TRANSACTION_AMOUNT_MUST_BE_POSITIVE |
| Valor de movimentação acima do limite         |         400 | RESERVE_TRANSACTION_AMOUNT_OVERFLOW         |
| Saque maior que saldo atual                   |         400 | RESERVE_WITHDRAWAL_EXCEEDS_BALANCE          |
| Tentativa de acessar reserva de outro usuário |         403 | FORBIDDEN                                   |

## Testes unitários

### reserve-policy.spec.ts

Deve testar regras puras:

- cálculo da meta da reserva
- cálculo do percentual de conclusão
- cálculo com percentual máximo acima de 100%
- validação de meses de proteção válidos
- rejeição de meses de proteção zerados
- rejeição de meses de proteção negativos
- rejeição de despesas fixas zeradas
- depósito bem-sucedido
- saque bem-sucedido
- rejeição de depósito negativo
- rejeição de depósito zerado
- rejeição de saque negativo
- rejeição de saque zerado
- rejeição de saque maior que saldo atual
- transição para `PROTECTED`
- transição para `REPLENISHING` após saque
- transição para `REPLENISHING` após aumento da meta
- transição para `PROTECTED` após redução da meta
- permanência em `BUILDING` quando reserva nunca foi protegida

### reserve-tracking.service.spec.ts

Deve testar o service com repository mockado:

- configura reserva para usuário autenticado
- rejeita configuração com meses zerados
- rejeita configuração com meses negativos
- rejeita configuração sem despesas fixas
- rejeita configuração duplicada
- consulta reserva com meta calculada
- recalcula meta após aumento de despesas fixas
- recalcula meta após redução de despesas fixas
- atualiza meses de proteção
- registra depósito
- soma depósito ao saldo atual
- registra saque
- subtrai saque do saldo atual
- rejeita saque maior que saldo atual
- cria histórico de movimentação
- muda status para `PROTECTED`
- muda status para `REPLENISHING`
- garante isolamento por usuário

## Testes de integração

Arquivo sugerido:

```txt
apps/api/tests/integration/reserve-tracking/reserve-tracking.spec.ts
```

Cenários obrigatórios:

- configuração de reserva bem-sucedida
- tentativa de configurar reserva sem autenticação
- tentativa de configurar reserva com meses zerados
- tentativa de configurar reserva com meses negativos
- tentativa de configurar reserva sem despesas fixas
- consulta de reserva com cálculo de meta
- recálculo dinâmico após adicionar nova despesa fixa
- recálculo dinâmico após reduzir ou remover despesa fixa
- depósito bem-sucedido
- depósito soma ao saldo atual
- saque bem-sucedido
- saque reduz saldo atual
- tentativa de saque maior que saldo atual
- alteração automática para `PROTECTED`
- alteração automática para `REPLENISHING` após saque
- alteração automática para `REPLENISHING` após aumento de despesas fixas
- alteração automática para `PROTECTED` após redução de despesas fixas
- listagem de movimentações
- isolamento de dados entre usuários

## Estratégia TDD

A implementação SHALL seguir esta ordem:

```txt
1. Criar testes unitários de reserve-policy
2. Rodar e confirmar falha
3. Implementar cálculos puros
4. Rodar e confirmar sucesso

5. Criar testes unitários do ReserveTrackingService
6. Rodar e confirmar falha
7. Implementar ReserveTrackingService
8. Rodar e confirmar sucesso

9. Criar testes de integração
10. Rodar e confirmar falha
11. Implementar Prisma, repository, controller e rotas
12. Rodar e confirmar sucesso

13. Rodar suíte completa
```

## Restrições

- Não implementar frontend.
- Não implementar dashboard.
- Não implementar conta bancária interna.
- Não implementar integração bancária.
- Não tratar depósito em reserva como despesa variável.
- Não permitir reserva familiar.
- Não permitir múltiplas reservas por usuário no MVP.
- Não permitir `userId` no body.
- Não permitir acesso à reserva de outro usuário.
- Não armazenar meta fixa como fonte principal da verdade.
