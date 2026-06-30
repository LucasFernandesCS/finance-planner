# Design: Adicionar Resumo do Dashboard

## Visão geral

Esta mudança adiciona um endpoint de resumo financeiro para o dashboard do MVP.

O dashboard será uma camada read-only de agregação sobre os dados já existentes.

Ele deverá consolidar informações de:

- perfil do usuário
- rendas
- despesas fixas
- despesas variáveis
- dívidas
- reserva de emergência
- objetivo principal

O endpoint principal será:

```txt
GET /dashboard/summary
```

Com filtro opcional por mês:

```txt
GET /dashboard/summary?month=YYYY-MM
```

O backend seguirá a arquitetura em camadas:

```txt
Route → Controller → Service → Repository → Prisma
```

O domínio será implementado em:

```txt
apps/api/src/modules/dashboard/
```

## Decisões técnicas

### Sem nova tabela

O dashboard SHALL NOT criar model novo no Prisma.

O dashboard SHALL calcular os dados dinamicamente a partir dos models existentes:

```txt
User
UserProfile
Income
FixedExpense
VariableExpense
Debt
EmergencyReserve
ReserveTransaction
Goal
```

### Endpoint único para o MVP

No MVP, haverá apenas um endpoint:

```txt
GET /dashboard/summary
```

Isso reduz complexidade e entrega a tela inicial com todos os dados necessários.

### Usuário autenticado

O dashboard SHALL usar o usuário autenticado pelo JWT.

O client SHALL NOT enviar `userId`.

Todas as consultas SHALL filtrar por `userId` do token.

### Período de referência

O dashboard SHALL aceitar query opcional:

```txt
month=YYYY-MM
```

Se `month` for informado, ele define o mês de referência.

Se `month` não for informado, o sistema SHALL usar o mês atual considerando a timezone do perfil do usuário.

O período SHALL respeitar:

```txt
timezone
financialMonthStartDay
```

Quando `financialMonthStartDay = 1`, o mês de junho de 2026 será:

```txt
startDate = 2026-06-01
endDate = 2026-06-30
```

Quando `financialMonthStartDay = 5`, o mês financeiro de junho de 2026 será:

```txt
startDate = 2026-06-05
endDate = 2026-07-04
```

### Perfil ausente

Se o usuário ainda não possuir `UserProfile`, o dashboard SHALL usar valores padrão:

```txt
timezone = America/Recife
financialMonthStartDay = 1
```

Se a implementação atual já cria perfil automaticamente no `GET /me`, o dashboard poderá reutilizar a mesma estratégia ou aplicar fallback seguro.

### Rendas

O dashboard SHALL retornar:

```txt
monthlyIncomeInCents
extraIncomeInCents
totalIncomeInCents
```

Regras:

```txt
monthlyIncomeInCents = soma das rendas do tipo MONTHLY no período
extraIncomeInCents = soma das rendas do tipo EXTRA no período
totalIncomeInCents = monthlyIncomeInCents + extraIncomeInCents
```

### Despesas

O dashboard SHALL retornar:

```txt
fixedExpensesInCents
variableExpensesInCents
debtPaymentsInCents
totalExpensesInCents
```

Regras:

```txt
fixedExpensesInCents = soma das despesas fixas ativas no período
variableExpensesInCents = soma das despesas variáveis no período
debtPaymentsInCents = soma das despesas variáveis com category DEBT_PAYMENT
totalExpensesInCents = fixedExpensesInCents + variableExpensesInCents
```

`debtPaymentsInCents` SHALL ser apenas um detalhamento de `variableExpensesInCents`.

### Despesas fixas ativas

Para o MVP, uma despesa fixa ativa no período é uma despesa fixa do usuário cujo `startMonth` é menor ou igual ao fim do período consultado.

### Fluxo de caixa

O dashboard SHALL retornar:

```txt
expectedSurplusInCents
recurringSurplusInCents
```

Regras:

```txt
expectedSurplusInCents = totalIncomeInCents - totalExpensesInCents
recurringSurplusInCents = monthlyIncomeInCents - fixedExpensesInCents
```

### Indicadores percentuais

O dashboard MAY retornar indicadores percentuais:

```txt
fixedCommitmentRate
expenseRate
```

Regras:

```txt
fixedCommitmentRate = fixedExpensesInCents / totalIncomeInCents * 100
expenseRate = totalExpensesInCents / totalIncomeInCents * 100
```

Se `totalIncomeInCents = 0`, os percentuais SHALL retornar `0`.

### Dívidas

O dashboard SHALL considerar dívidas do usuário.

Dívidas abertas são dívidas com status diferente de:

```txt
PAID
```

O dashboard SHALL retornar:

```txt
openDebtBalanceInCents
openDebtsCount
overdueDebtsCount
```

Regras:

```txt
openDebtBalanceInCents = soma de currentBalanceInCents das dívidas com status diferente de PAID
openDebtsCount = quantidade de dívidas com status diferente de PAID
overdueDebtsCount = quantidade de dívidas com status OVERDUE
```

### Reserva de emergência

Se o usuário possuir reserva configurada, o dashboard SHALL retornar:

```txt
currentBalanceInCents
monthlyFixedExpensesInCents
targetAmountInCents
completionPercentage
status
```

A meta SHALL ser calculada dinamicamente:

```txt
targetAmountInCents = fixedExpensesInCents * protectionMonths
```

Se a reserva não existir, o dashboard SHALL retornar:

```json
{
  "reserve": null,
  "reserveSetupRequired": true
}
```

### Objetivo principal

O objetivo principal SHALL ser obtido pelo campo:

```txt
UserProfile.primaryGoalId
```

Se existir `primaryGoalId`, o sistema SHALL buscar o objetivo correspondente do usuário autenticado.

O dashboard SHALL retornar:

```txt
id
title
targetAmountInCents
currentAmountInCents
completionPercentage
status
deadlineDate
```

O percentual SHALL ser calculado:

```txt
completionPercentage = currentAmountInCents / targetAmountInCents * 100
```

Se `targetAmountInCents = 0`, o percentual SHALL retornar `0`.

Se não existir objetivo principal, o dashboard SHALL retornar:

```json
{
  "primaryGoal": null,
  "primaryGoalSetupRequired": true
}
```

Se `primaryGoalId` estiver preenchido, mas o objetivo não existir mais ou não pertencer ao usuário, o dashboard SHALL retornar `primaryGoal` como `null` e `primaryGoalSetupRequired` como `true`.

### Alertas financeiros

O dashboard SHALL gerar alertas básicos.

Tipos sugeridos:

```txt
NEGATIVE_SURPLUS
OVERDUE_DEBT
RESERVE_SETUP_REQUIRED
RESERVE_BELOW_TARGET
PRIMARY_GOAL_SETUP_REQUIRED
FIXED_EXPENSES_EXCEED_MONTHLY_INCOME
NO_INCOME_REGISTERED
```

Severidades sugeridas:

```txt
LOW
MEDIUM
HIGH
```

Regras mínimas:

```txt
Se expectedSurplusInCents < 0:
  gerar NEGATIVE_SURPLUS com severity HIGH

Se overdueDebtsCount > 0:
  gerar OVERDUE_DEBT com severity HIGH

Se reserva não existir:
  gerar RESERVE_SETUP_REQUIRED com severity MEDIUM

Se reserva existir e status != PROTECTED:
  gerar RESERVE_BELOW_TARGET com severity MEDIUM

Se primaryGoal não existir:
  gerar PRIMARY_GOAL_SETUP_REQUIRED com severity LOW

Se monthlyIncomeInCents = 0:
  gerar NO_INCOME_REGISTERED com severity MEDIUM

Se fixedExpensesInCents > monthlyIncomeInCents e monthlyIncomeInCents > 0:
  gerar FIXED_EXPENSES_EXCEED_MONTHLY_INCOME com severity HIGH
```

## Arquitetura

Estrutura esperada:

```txt
apps/api/src/modules/dashboard/
├── dashboard.routes.ts
├── dashboard.controller.ts
├── dashboard.service.ts
├── dashboard.repository.ts
├── dashboard.types.ts
├── dashboard.errors.ts
└── dashboard-policy.ts
```

Testes esperados:

```txt
apps/api/tests/unit/dashboard/dashboard-policy.spec.ts
apps/api/tests/unit/dashboard/dashboard.service.spec.ts
apps/api/tests/integration/dashboard/dashboard.spec.ts
```

## Áreas afetadas

- `apps/api/src/modules/dashboard` — novo módulo de dashboard.
- `apps/api/src/app.ts` — registro das rotas.
- `apps/api/src/shared/middlewares/auth` — middleware de autenticação existente.
- `apps/api/src/modules/user-profile` — leitura de perfil.
- `apps/api/src/modules/incomes` — leitura de rendas.
- `apps/api/src/modules/expenses` — leitura de despesas.
- `apps/api/src/modules/debts` — leitura de dívidas.
- `apps/api/src/modules/reserve-tracking` — leitura da reserva.
- `apps/api/src/modules/goals` — leitura do objetivo principal.
- `apps/api/tests/unit/dashboard` — testes unitários.
- `apps/api/tests/integration/dashboard` — testes de integração.

## Contrato de API

Todas as rotas SHALL exigir autenticação.

### GET /dashboard/summary

Consulta resumo financeiro do usuário autenticado.

Query opcional:

```txt
month=YYYY-MM
```

Exemplo:

```txt
GET /dashboard/summary?month=2026-06
```

Success response:

```json
{
  "period": {
    "referenceMonth": "2026-06",
    "startDate": "2026-06-01",
    "endDate": "2026-06-30",
    "timezone": "America/Recife",
    "financialMonthStartDay": 1
  },
  "income": {
    "monthlyIncomeInCents": 750000,
    "extraIncomeInCents": 100000,
    "totalIncomeInCents": 850000
  },
  "expenses": {
    "fixedExpensesInCents": 350000,
    "variableExpensesInCents": 120000,
    "debtPaymentsInCents": 50000,
    "totalExpensesInCents": 470000
  },
  "cashFlow": {
    "expectedSurplusInCents": 380000,
    "recurringSurplusInCents": 400000,
    "fixedCommitmentRate": 41.18,
    "expenseRate": 55.29
  },
  "debts": {
    "openDebtBalanceInCents": 1200000,
    "openDebtsCount": 2,
    "overdueDebtsCount": 1
  },
  "reserve": {
    "currentBalanceInCents": 500000,
    "monthlyFixedExpensesInCents": 350000,
    "targetAmountInCents": 2100000,
    "completionPercentage": 23.81,
    "status": "BUILDING"
  },
  "reserveSetupRequired": false,
  "primaryGoal": {
    "id": "uuid",
    "title": "Comprar notebook",
    "targetAmountInCents": 1500000,
    "currentAmountInCents": 500000,
    "completionPercentage": 33.33,
    "status": "IN_PROGRESS",
    "deadlineDate": "2027-06-30"
  },
  "primaryGoalSetupRequired": false,
  "alerts": [
    {
      "type": "OVERDUE_DEBT",
      "severity": "HIGH",
      "message": "Você possui 1 dívida atrasada."
    },
    {
      "type": "RESERVE_BELOW_TARGET",
      "severity": "MEDIUM",
      "message": "Sua reserva ainda está abaixo da meta de proteção."
    }
  ]
}
```

Resposta quando ainda faltam configurações:

```json
{
  "period": {
    "referenceMonth": "2026-06",
    "startDate": "2026-06-01",
    "endDate": "2026-06-30",
    "timezone": "America/Recife",
    "financialMonthStartDay": 1
  },
  "income": {
    "monthlyIncomeInCents": 0,
    "extraIncomeInCents": 0,
    "totalIncomeInCents": 0
  },
  "expenses": {
    "fixedExpensesInCents": 0,
    "variableExpensesInCents": 0,
    "debtPaymentsInCents": 0,
    "totalExpensesInCents": 0
  },
  "cashFlow": {
    "expectedSurplusInCents": 0,
    "recurringSurplusInCents": 0,
    "fixedCommitmentRate": 0,
    "expenseRate": 0
  },
  "debts": {
    "openDebtBalanceInCents": 0,
    "openDebtsCount": 0,
    "overdueDebtsCount": 0
  },
  "reserve": null,
  "reserveSetupRequired": true,
  "primaryGoal": null,
  "primaryGoalSetupRequired": true,
  "alerts": [
    {
      "type": "NO_INCOME_REGISTERED",
      "severity": "MEDIUM",
      "message": "Cadastre sua renda para visualizar melhor seu resumo financeiro."
    },
    {
      "type": "RESERVE_SETUP_REQUIRED",
      "severity": "MEDIUM",
      "message": "Configure sua reserva de emergência."
    },
    {
      "type": "PRIMARY_GOAL_SETUP_REQUIRED",
      "severity": "LOW",
      "message": "Defina um objetivo principal para acompanhar no dashboard."
    }
  ]
}
```

## Validação

| Campo            | Regra             |
| ---------------- | ----------------- |
| `month`          | opcional          |
| `month`          | formato `YYYY-MM` |
| `month` inválido | retornar erro 400 |

## Mapeamento de erros

| Caso                   | HTTP Status | Código de erro          |
| ---------------------- | ----------: | ----------------------- |
| Não autenticado        |         401 | UNAUTHORIZED            |
| Query `month` inválida |         400 | INVALID_DASHBOARD_MONTH |
| Erro de validação      |         400 | VALIDATION_ERROR        |

## Testes unitários

### dashboard-policy.spec.ts

Deve testar regras puras:

- cálculo de total de renda
- cálculo de total de despesas
- cálculo de sobra prevista positiva
- cálculo de sobra prevista negativa
- cálculo de sobra recorrente
- cálculo de percentuais com renda positiva
- cálculo de percentuais com renda zerada
- cálculo de percentual da reserva
- cálculo de percentual do objetivo principal
- dívidas abertas excluem dívidas quitadas
- pagamentos de dívida não são contados duas vezes
- geração de alerta para sobra negativa
- geração de alerta para dívida atrasada
- geração de alerta para reserva não configurada
- geração de alerta para reserva abaixo da meta
- geração de alerta para objetivo principal não definido
- geração de alerta para renda não cadastrada
- geração de alerta quando despesas fixas superam renda mensal
- cálculo do período com `financialMonthStartDay` igual a 1
- cálculo do período com `financialMonthStartDay` diferente de 1
- rejeição de query `month` inválida

### dashboard.service.spec.ts

Deve testar o service com repository mockado:

- retorna resumo do dashboard para usuário autenticado
- usa mês atual quando query `month` não é informada
- usa query `month` quando informada
- lê perfil do usuário para timezone e dia inicial do mês financeiro
- usa fallback quando perfil não existe
- agrega rendas do usuário autenticado
- agrega despesas do usuário autenticado
- agrega dívidas do usuário autenticado
- retorna reserva com meta calculada
- retorna `reserveSetupRequired` quando reserva não existe
- retorna objetivo principal do perfil
- retorna `primaryGoalSetupRequired` quando objetivo principal não existe
- não retorna objetivo principal de outro usuário
- gera alertas básicos

## Testes de integração

Arquivo sugerido:

```txt
apps/api/tests/integration/dashboard/dashboard.spec.ts
```

Cenários obrigatórios:

- `GET /dashboard/summary` retorna resumo com sucesso
- `GET /dashboard/summary` sem autenticação retorna 401
- `GET /dashboard/summary` retorna apenas dados do usuário autenticado
- `GET /dashboard/summary?month=YYYY-MM` retorna período correto
- `GET /dashboard/summary` com month inválido retorna 400
- dashboard soma rendas mensais e extras corretamente
- dashboard soma despesas fixas e variáveis corretamente
- dashboard inclui pagamento de dívida como despesa variável
- dashboard não duplica pagamento de dívida no total
- dashboard retorna dívidas abertas corretamente
- dashboard ignora dívidas quitadas em `openDebtBalanceInCents`
- dashboard retorna quantidade de dívidas atrasadas
- dashboard retorna reserva configurada com meta calculada
- dashboard retorna `reserveSetupRequired` quando reserva não existe
- dashboard retorna objetivo principal configurado
- dashboard retorna `primaryGoalSetupRequired` quando não há objetivo principal
- dashboard gera alerta para sobra negativa
- dashboard gera alerta para dívida atrasada
- dashboard gera alerta para reserva abaixo da meta
- dashboard respeita `financialMonthStartDay` do perfil

## Estratégia TDD

A implementação SHALL seguir esta ordem:

```txt
1. Criar testes unitários de dashboard-policy
2. Rodar e confirmar falha
3. Implementar cálculos puros
4. Rodar e confirmar sucesso

5. Criar testes unitários do DashboardService
6. Rodar e confirmar falha
7. Implementar DashboardService
8. Rodar e confirmar sucesso

9. Criar testes de integração
10. Rodar e confirmar falha
11. Implementar repository, controller e rotas
12. Rodar e confirmar sucesso

13. Rodar suíte completa
```

## Restrições

- Não implementar frontend.
- Não implementar gráficos.
- Não implementar comparação com mês anterior.
- Não implementar cache.
- Não implementar exportação.
- Não implementar dashboard familiar.
- Não criar model novo.
- Não criar migration, salvo necessidade descoberta durante implementação.
- Não persistir totais calculados.
- Não permitir `userId` no body.
- Não retornar dados de outro usuário.
- Não contar pagamento de dívida duas vezes.
