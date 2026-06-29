# Design: Adicionar Gerenciamento de Objetivos Financeiros

## Visão geral

Esta mudança adiciona objetivos financeiros para usuários autenticados.

O usuário poderá criar um objetivo com:

- título
- valor alvo
- valor mensal planejado
- data limite
- status
- valor atual acumulado

O sistema calculará se o objetivo é viável usando:

```txt
sobra livre = renda mensal - despesas fixas ativas - parcelas de objetivos ativos
```

A implementação seguirá TDD:

```txt
1. Criar testes unitários de cálculo de viabilidade
2. Implementar cálculos puros
3. Criar testes unitários do GoalService
4. Implementar GoalService
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
apps/api/src/modules/goals/
```

## Decisões técnicas

### Representação monetária

O sistema SHALL representar valores monetários como inteiro em centavos.

Exemplo:

```txt
R$ 15.000,00 → 1500000
R$ 1.875,00 → 187500
```

Campos monetários:

```txt
targetAmountInCents
monthlyAmountInCents
currentAmountInCents
amountInCents
```

### Status do objetivo

O sistema SHALL aceitar os seguintes status:

```txt
NOT_STARTED
IN_PROGRESS
ACHIEVED
```

Significados:

- `NOT_STARTED`: objetivo criado, mas ainda sem aporte.
- `IN_PROGRESS`: objetivo recebeu ao menos um aporte, mas ainda não atingiu o valor alvo.
- `ACHIEVED`: valor atual igualou ou superou o valor alvo.

### Status inicial

Todo objetivo criado SHALL iniciar com status:

```txt
NOT_STARTED
```

### Transição automática

Quando um depósito faz o valor atual atingir ou superar o valor alvo, o sistema SHALL alterar o status automaticamente para:

```txt
ACHIEVED
```

Quando um depósito é feito em objetivo ainda não atingido, o sistema SHALL alterar o status para:

```txt
IN_PROGRESS
```

### Transições inválidas

O sistema SHALL rejeitar tentativa de alterar manualmente o status para `ACHIEVED` se:

```txt
currentAmountInCents < targetAmountInCents
```

### Cálculo de meses até o prazo

O sistema SHALL calcular a quantidade de meses entre a data atual e a data limite.

A data limite SHALL estar no futuro.

Para testes, o cálculo deve ser isolado em função pura ou receber uma abstração de relógio.

Exemplo:

```txt
targetAmountInCents = 1500000
monthsUntilDeadline = 8
suggestedMonthlyAmountInCents = 187500
```

### Arredondamento

O valor mensal sugerido SHALL usar arredondamento para cima.

Exemplo:

```txt
100000 / 3 = 33334
```

Isso evita que o usuário guarde menos que o necessário para atingir o objetivo no prazo.

### Sobra mensal

O sistema SHALL calcular:

```txt
monthlyIncomeInCents = soma das rendas mensais do usuário no mês atual
fixedExpensesInCents = soma das despesas fixas ativas do usuário
activeGoalCommitmentsInCents = soma dos monthlyAmountInCents dos objetivos ativos
availableForNewGoalInCents = monthlyIncomeInCents - fixedExpensesInCents - activeGoalCommitmentsInCents
```

Objetivos ativos são objetivos com status:

```txt
NOT_STARTED
IN_PROGRESS
```

Objetivos com status `ACHIEVED` não devem consumir sobra mensal futura.

### Despesas consideradas

Nesta change, o cálculo de viabilidade SHALL considerar apenas despesas fixas.

Despesas variáveis não entram no cálculo inicial porque são pontuais e podem mudar mês a mês.

### Rendas consideradas

Nesta change, o cálculo de viabilidade SHALL considerar rendas mensais do mês atual.

Rendas extras não devem ser usadas como base fixa para compromissos mensais futuros.

### Concorrência com múltiplos objetivos

Ao criar um novo objetivo, o sistema SHALL descontar da sobra mensal os valores mensais já comprometidos em outros objetivos ativos.

Exemplo:

```txt
Renda mensal: R$ 5.000,00
Despesas fixas: R$ 3.500,00
Sobra mensal: R$ 1.500,00
Objetivo ativo A: R$ 500,00/mês
Sobra livre para novo objetivo: R$ 1.000,00
```

### Mensagem de viabilidade

Quando o objetivo for inviável, o sistema SHALL retornar um objeto de viabilidade com:

```txt
requiredMonthlyAmountInCents
availableMonthlyAmountInCents
minimumViableMonths
maxTargetAmountForCurrentDeadlineInCents
message
suggestion
```

Exemplo:

```json
{
  "error": {
    "code": "GOAL_NOT_FINANCIALLY_FEASIBLE",
    "message": "Para atingir este objetivo em 8 meses, você precisaria guardar R$ 1.875,00/mês, mas sua sobra atual é de R$ 1.500,00.",
    "suggestion": "Aumente o prazo para pelo menos 10 meses ou reduza o valor do objetivo para até R$ 12.000,00 nesse prazo."
  }
}
```

### Ownership

O usuário autenticado SHALL ser identificado pelo token JWT.

O client não deve enviar `userId` para criar objetivos.

O `userId` do objetivo SHALL ser sempre derivado do usuário autenticado.

Um usuário SHALL NOT conseguir listar, atualizar, remover ou depositar em objetivos pertencentes a outro usuário.

### Depósitos no objetivo

O usuário SHALL poder registrar depósitos/aportes em um objetivo.

Cada depósito SHALL criar um registro em `GoalContribution`.

Cada depósito SHALL incrementar `Goal.currentAmountInCents`.

A criação do depósito e a atualização do objetivo SHALL ocorrer na mesma transação.

### Limites

Valores de objetivo SHALL respeitar:

```txt
targetAmountInCents > 0
targetAmountInCents <= 99999999999
monthlyAmountInCents > 0
monthlyAmountInCents <= 99999999999
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
apps/api/src/modules/goals/
├── goal.routes.ts
├── goal.controller.ts
├── goal.service.ts
├── goal.repository.ts
├── goal.schemas.ts
├── goal.types.ts
├── goal.errors.ts
└── goal-policy.ts
```

Testes esperados:

```txt
apps/api/tests/unit/goals/goal-policy.spec.ts
apps/api/tests/unit/goals/goal.service.spec.ts
apps/api/tests/integration/goals/goal.spec.ts
```

## Áreas afetadas

- `apps/api/src/modules/goals` — novo módulo de objetivos.
- `apps/api/src/app.ts` — registro das rotas de objetivos.
- `apps/api/src/shared/middlewares/auth` — middleware de autenticação existente.
- `apps/api/prisma/schema.prisma` — models de objetivos.
- `apps/api/tests/unit/goals` — testes unitários.
- `apps/api/tests/integration/goals` — testes de integração.

## Modelo de dados

### GoalStatus

```prisma
enum GoalStatus {
  NOT_STARTED
  IN_PROGRESS
  ACHIEVED
}
```

### Goal

```prisma
model Goal {
  id                    String     @id @default(uuid())
  userId                String
  title                 String
  targetAmountInCents   BigInt
  monthlyAmountInCents  BigInt
  currentAmountInCents  BigInt     @default(0)
  deadlineDate          DateTime
  status                GoalStatus @default(NOT_STARTED)
  description           String?
  createdAt             DateTime   @default(now())
  updatedAt             DateTime   @updatedAt

  user          User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  contributions GoalContribution[]

  @@index([userId])
  @@index([userId, status])
  @@index([userId, deadlineDate])
}
```

### GoalContribution

```prisma
model GoalContribution {
  id            String   @id @default(uuid())
  goalId        String
  userId        String
  amountInCents BigInt
  contributedAt DateTime @default(now())
  note          String?
  createdAt     DateTime @default(now())

  goal Goal @relation(fields: [goalId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([goalId])
  @@index([userId])
  @@index([userId, contributedAt])
}
```

O model `User` deverá receber:

```prisma
goals Goal[]
goalContributions GoalContribution[]
```

## Contrato de API

Todas as rotas SHALL exigir autenticação.

### POST /goals

Cria um objetivo financeiro para o usuário autenticado.

Request:

```json
{
  "title": "Comprar notebook",
  "targetAmountInCents": 1500000,
  "monthlyAmountInCents": 125000,
  "deadlineDate": "2027-06-30",
  "description": "Notebook para trabalho e estudos"
}
```

Success response:

```json
{
  "goal": {
    "id": "uuid",
    "title": "Comprar notebook",
    "targetAmountInCents": 1500000,
    "monthlyAmountInCents": 125000,
    "currentAmountInCents": 0,
    "deadlineDate": "2027-06-30",
    "status": "NOT_STARTED",
    "description": "Notebook para trabalho e estudos"
  },
  "feasibility": {
    "monthsUntilDeadline": 12,
    "suggestedMonthlyAmountInCents": 125000,
    "availableMonthlyAmountInCents": 150000,
    "isFeasible": true
  }
}
```

### GET /goals

Lista objetivos do usuário autenticado.

Success response:

```json
{
  "goals": [
    {
      "id": "uuid",
      "title": "Comprar notebook",
      "targetAmountInCents": 1500000,
      "monthlyAmountInCents": 125000,
      "currentAmountInCents": 0,
      "deadlineDate": "2027-06-30",
      "status": "NOT_STARTED"
    }
  ]
}
```

### GET /goals/:goalId

Busca um objetivo específico do usuário autenticado.

### PATCH /goals/:goalId

Atualiza um objetivo próprio.

Campos atualizáveis:

```txt
title
targetAmountInCents
monthlyAmountInCents
deadlineDate
description
```

### DELETE /goals/:goalId

Remove um objetivo próprio.

### POST /goals/:goalId/contributions

Registra um aporte no objetivo.

Request:

```json
{
  "amountInCents": 50000,
  "note": "Reserva do mês"
}
```

Success response:

```json
{
  "goal": {
    "id": "uuid",
    "currentAmountInCents": 50000,
    "targetAmountInCents": 1500000,
    "status": "IN_PROGRESS"
  },
  "contribution": {
    "id": "uuid",
    "amountInCents": 50000,
    "note": "Reserva do mês"
  }
}
```

Se o depósito atingir o objetivo:

```json
{
  "goal": {
    "id": "uuid",
    "currentAmountInCents": 1500000,
    "targetAmountInCents": 1500000,
    "status": "ACHIEVED"
  }
}
```

## Mapeamento de erros

| Caso                                           | HTTP Status | Código de erro                            |
| ---------------------------------------------- | ----------: | ----------------------------------------- |
| Não autenticado                                |         401 | UNAUTHORIZED                              |
| Objetivo não encontrado                        |         404 | GOAL_NOT_FOUND                            |
| Tentativa de acessar objetivo de outro usuário |         403 | FORBIDDEN                                 |
| Campos obrigatórios ausentes                   |         400 | VALIDATION_ERROR                          |
| Valor alvo negativo ou zerado                  |         400 | GOAL_TARGET_AMOUNT_MUST_BE_POSITIVE       |
| Valor mensal negativo ou zerado                |         400 | GOAL_MONTHLY_AMOUNT_MUST_BE_POSITIVE      |
| Valor acima do limite                          |         400 | GOAL_AMOUNT_OVERFLOW                      |
| Título muito longo                             |         400 | GOAL_TITLE_TOO_LONG                       |
| Data limite no passado ou hoje                 |         400 | GOAL_DEADLINE_MUST_BE_FUTURE              |
| Parcela mensal menor que o mínimo sugerido     |         400 | GOAL_MONTHLY_AMOUNT_TOO_LOW               |
| Objetivo financeiramente inviável              |         422 | GOAL_NOT_FINANCIALLY_FEASIBLE             |
| Transição de status inválida                   |         400 | INVALID_GOAL_STATUS_TRANSITION            |
| Depósito negativo ou zerado                    |         400 | GOAL_CONTRIBUTION_AMOUNT_MUST_BE_POSITIVE |

## Testes unitários

### goal-policy.spec.ts

Deve testar regras puras:

- cálculo de valor mensal sugerido
- cálculo de prazo em meses
- cálculo de sobra mensal
- validação de viabilidade bem-sucedida
- objetivo inviável financeiramente
- sugestão de prazo mínimo viável
- sugestão de valor máximo possível no prazo atual
- rejeição de valor alvo negativo
- rejeição de valor alvo zerado
- rejeição de valor acima do limite
- rejeição de título muito longo
- rejeição de data limite no passado
- rejeição de data limite hoje
- rejeição de transição inválida para `ACHIEVED`

### goal.service.spec.ts

Deve testar o service com repository mockado:

- cria objetivo viável para usuário autenticado
- cria objetivo com status inicial `NOT_STARTED`
- rejeita objetivo inviável
- rejeita objetivo para outro usuário
- lista apenas objetivos do usuário autenticado
- calcula sobra mensal buscando rendas e despesas fixas no repository
- considera objetivos ativos no cálculo da sobra livre
- registra depósito em objetivo próprio
- atualiza valor atual após depósito
- cria histórico de depósito
- altera status automaticamente para `IN_PROGRESS`
- altera status automaticamente para `ACHIEVED`
- rejeita depósito em objetivo de outro usuário
- rejeita objetivo não encontrado

## Testes de integração

Arquivo sugerido:

```txt
apps/api/tests/integration/goals/goal.spec.ts
```

Cenários obrigatórios:

- criação de objetivo bem-sucedida
- cálculo de valor sugerido e prazo bem-sucedido
- validação de viabilidade bem-sucedida
- tentativa de adicionar objetivo inviável financeiramente
- tentativa de adicionar objetivo com valor total negativo
- tentativa de adicionar objetivo com valor total zerado
- tentativa de adicionar objetivo sem campos obrigatórios
- tentativa de adicionar objetivo com data limite no passado
- tentativa de adicionar objetivo com data limite hoje
- tentativa de adicionar objetivo com título muito longo
- tentativa de adicionar objetivo com valor acima do limite
- tentativa de adicionar objetivo para outro usuário
- listagem de objetivos bem-sucedida
- listagem retorna apenas objetivos do usuário autenticado
- cálculo dinâmico de sobra mensal usando dados reais do banco
- concorrência com múltiplos objetivos ativos
- depósito em objetivo bem-sucedido
- depósito alimenta histórico do objetivo
- depósito atualiza valor atual do objetivo
- depósito altera status para `IN_PROGRESS`
- depósito altera status para `ACHIEVED`
- tentativa de transição inválida de status
- tentativa de depósito em objetivo de outro usuário

## Estratégia TDD

A implementação SHALL seguir esta ordem:

```txt
1. Criar testes unitários de goal-policy
2. Rodar e confirmar falha
3. Implementar cálculos puros
4. Rodar e confirmar sucesso

5. Criar testes unitários do GoalService
6. Rodar e confirmar falha
7. Implementar GoalService
8. Rodar e confirmar sucesso

9. Criar testes de integração de criação/listagem
10. Rodar e confirmar falha
11. Implementar Prisma, repository, controller e rotas de criação/listagem
12. Rodar e confirmar sucesso

13. Criar testes de integração de depósitos
14. Rodar e confirmar falha
15. Implementar depósito com transação
16. Rodar e confirmar sucesso

17. Rodar suíte completa
```

## Restrições

- Não implementar frontend.
- Não implementar dashboard.
- Não implementar conta bancária interna.
- Não permitir `userId` no body.
- Não permitir acesso a objetivos de outro usuário.
- Não usar valores monetários em ponto flutuante.
- Não alterar autenticação existente além do uso do middleware.
- Não considerar despesas variáveis no cálculo inicial de viabilidade.
