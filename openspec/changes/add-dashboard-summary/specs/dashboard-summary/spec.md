# Delta for Dashboard Summary

## ADDED Requirements

### Requirement: Consultar resumo do dashboard

O sistema SHALL permitir que usuários autenticados consultem um resumo financeiro consolidado.

#### Scenario: Consulta de dashboard bem-sucedida

- GIVEN existe um usuário autenticado
- WHEN o usuário envia uma requisição `GET /dashboard/summary`
- THEN o sistema SHALL retornar status 200
- AND a resposta SHALL conter resumo de renda
- AND a resposta SHALL conter resumo de despesas
- AND a resposta SHALL conter resumo de fluxo de caixa
- AND a resposta SHALL conter resumo de dívidas
- AND a resposta SHALL conter resumo de reserva
- AND a resposta SHALL conter objetivo principal
- AND a resposta SHALL conter alertas financeiros

#### Scenario: Consulta de dashboard sem autenticação

- GIVEN não existe usuário autenticado
- WHEN uma requisição `GET /dashboard/summary` é enviada
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 401
- AND a resposta SHALL conter o código de erro `UNAUTHORIZED`

#### Scenario: Isolamento de dados por usuário

- GIVEN existem dois usuários cadastrados
- AND ambos possuem dados financeiros cadastrados
- WHEN o primeiro usuário envia uma requisição `GET /dashboard/summary`
- THEN a resposta SHALL conter apenas dados financeiros do primeiro usuário
- AND a resposta SHALL NOT conter dados financeiros do segundo usuário

### Requirement: Determinar período do dashboard

O sistema SHALL calcular o período do dashboard com base no mês de referência, timezone e início do mês financeiro do usuário.

#### Scenario: Consulta com mês informado

- GIVEN existe um usuário autenticado
- AND o usuário informa `month=2026-06`
- WHEN o usuário envia uma requisição `GET /dashboard/summary?month=2026-06`
- THEN o sistema SHALL usar junho de 2026 como mês de referência
- AND a resposta SHALL conter `referenceMonth` igual a `2026-06`

#### Scenario: Consulta sem mês informado

- GIVEN existe um usuário autenticado
- AND o usuário não informa query `month`
- WHEN o usuário envia uma requisição `GET /dashboard/summary`
- THEN o sistema SHALL usar o mês atual como mês de referência
- AND o sistema SHALL considerar a timezone do perfil do usuário

#### Scenario: Consulta com mês inválido

- GIVEN existe um usuário autenticado
- AND o usuário informa `month` em formato inválido
- WHEN o usuário envia uma requisição `GET /dashboard/summary?month=06-2026`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `INVALID_DASHBOARD_MONTH`

#### Scenario: Período com financialMonthStartDay igual a 1

- GIVEN existe um usuário autenticado
- AND o perfil possui `financialMonthStartDay` igual a 1
- AND o mês de referência é `2026-06`
- WHEN o sistema calcula o período
- THEN o período SHALL iniciar em `2026-06-01`
- AND o período SHALL terminar em `2026-06-30`

#### Scenario: Período com financialMonthStartDay diferente de 1

- GIVEN existe um usuário autenticado
- AND o perfil possui `financialMonthStartDay` igual a 5
- AND o mês de referência é `2026-06`
- WHEN o sistema calcula o período
- THEN o período SHALL iniciar em `2026-06-05`
- AND o período SHALL terminar em `2026-07-04`

### Requirement: Agregar rendas

O sistema SHALL agregar as rendas do usuário autenticado no período do dashboard.

#### Scenario: Soma de rendas mensais e extras

- GIVEN existe um usuário autenticado
- AND o usuário possui rendas mensais no período
- AND o usuário possui rendas extras no período
- WHEN o usuário consulta o dashboard
- THEN a resposta SHALL retornar `monthlyIncomeInCents`
- AND a resposta SHALL retornar `extraIncomeInCents`
- AND `totalIncomeInCents` SHALL ser a soma das rendas mensais e extras

#### Scenario: Dashboard sem renda cadastrada

- GIVEN existe um usuário autenticado
- AND o usuário não possui rendas no período
- WHEN o usuário consulta o dashboard
- THEN `monthlyIncomeInCents` SHALL ser zero
- AND `extraIncomeInCents` SHALL ser zero
- AND `totalIncomeInCents` SHALL ser zero

### Requirement: Agregar despesas

O sistema SHALL agregar despesas fixas, despesas variáveis e pagamentos de dívida do usuário autenticado.

#### Scenario: Soma de despesas fixas e variáveis

- GIVEN existe um usuário autenticado
- AND o usuário possui despesas fixas ativas
- AND o usuário possui despesas variáveis no período
- WHEN o usuário consulta o dashboard
- THEN a resposta SHALL retornar `fixedExpensesInCents`
- AND a resposta SHALL retornar `variableExpensesInCents`
- AND `totalExpensesInCents` SHALL ser a soma de despesas fixas e variáveis

#### Scenario: Pagamento de dívida aparece como despesa variável

- GIVEN existe um usuário autenticado
- AND o usuário registrou pagamento de dívida no período
- AND esse pagamento gerou despesa variável com categoria `DEBT_PAYMENT`
- WHEN o usuário consulta o dashboard
- THEN `debtPaymentsInCents` SHALL incluir o valor desse pagamento
- AND `variableExpensesInCents` SHALL incluir o valor desse pagamento

#### Scenario: Pagamento de dívida não é contado duas vezes

- GIVEN existe um usuário autenticado
- AND o usuário possui despesas fixas de R$ 3.500,00
- AND o usuário possui despesas variáveis de R$ 1.200,00
- AND dentro das despesas variáveis existe pagamento de dívida de R$ 500,00
- WHEN o usuário consulta o dashboard
- THEN `totalExpensesInCents` SHALL ser R$ 4.700,00
- AND o sistema SHALL NOT somar R$ 500,00 novamente ao total

### Requirement: Calcular fluxo de caixa

O sistema SHALL calcular indicadores de fluxo de caixa do usuário.

#### Scenario: Cálculo de sobra prevista positiva

- GIVEN existe um usuário autenticado
- AND `totalIncomeInCents` é maior que `totalExpensesInCents`
- WHEN o usuário consulta o dashboard
- THEN `expectedSurplusInCents` SHALL ser positivo

#### Scenario: Cálculo de sobra prevista negativa

- GIVEN existe um usuário autenticado
- AND `totalExpensesInCents` é maior que `totalIncomeInCents`
- WHEN o usuário consulta o dashboard
- THEN `expectedSurplusInCents` SHALL ser negativo

#### Scenario: Cálculo de sobra recorrente

- GIVEN existe um usuário autenticado
- AND o usuário possui renda mensal e despesas fixas
- WHEN o usuário consulta o dashboard
- THEN `recurringSurplusInCents` SHALL ser calculado como renda mensal menos despesas fixas

### Requirement: Resumir dívidas

O sistema SHALL retornar resumo das dívidas do usuário autenticado.

#### Scenario: Cálculo de dívidas abertas

- GIVEN existe um usuário autenticado
- AND o usuário possui dívidas com status diferente de `PAID`
- WHEN o usuário consulta o dashboard
- THEN `openDebtBalanceInCents` SHALL ser a soma dos saldos das dívidas abertas
- AND `openDebtsCount` SHALL ser a quantidade de dívidas abertas

#### Scenario: Dívidas quitadas não entram em dívidas abertas

- GIVEN existe um usuário autenticado
- AND o usuário possui uma dívida com status `PAID`
- WHEN o usuário consulta o dashboard
- THEN a dívida quitada SHALL NOT ser incluída em `openDebtBalanceInCents`
- AND a dívida quitada SHALL NOT ser contada em `openDebtsCount`

#### Scenario: Cálculo de dívidas atrasadas

- GIVEN existe um usuário autenticado
- AND o usuário possui dívida com status `OVERDUE`
- WHEN o usuário consulta o dashboard
- THEN `overdueDebtsCount` SHALL incluir essa dívida

### Requirement: Resumir reserva de emergência

O sistema SHALL retornar resumo da reserva de emergência do usuário autenticado.

#### Scenario: Reserva configurada com meta calculada

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- AND possui despesas fixas ativas
- WHEN o usuário consulta o dashboard
- THEN a resposta SHALL conter `reserve`
- AND `reserve.targetAmountInCents` SHALL ser calculado dinamicamente
- AND `reserve.completionPercentage` SHALL ser calculado com base no saldo atual e na meta

#### Scenario: Reserva não configurada

- GIVEN existe um usuário autenticado
- AND o usuário não possui reserva configurada
- WHEN o usuário consulta o dashboard
- THEN a resposta SHALL conter `reserve` igual a `null`
- AND a resposta SHALL conter `reserveSetupRequired` igual a `true`

#### Scenario: Reserva abaixo da meta

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- AND a reserva está abaixo da meta
- WHEN o usuário consulta o dashboard
- THEN o sistema SHALL gerar alerta `RESERVE_BELOW_TARGET`

### Requirement: Resumir objetivo principal

O sistema SHALL retornar o objetivo principal configurado no perfil do usuário.

#### Scenario: Objetivo principal configurado

- GIVEN existe um usuário autenticado
- AND o perfil do usuário possui `primaryGoalId`
- AND o objetivo pertence ao usuário autenticado
- WHEN o usuário consulta o dashboard
- THEN a resposta SHALL conter `primaryGoal`
- AND `primaryGoal.completionPercentage` SHALL ser calculado

#### Scenario: Objetivo principal não configurado

- GIVEN existe um usuário autenticado
- AND o perfil do usuário não possui `primaryGoalId`
- WHEN o usuário consulta o dashboard
- THEN a resposta SHALL conter `primaryGoal` igual a `null`
- AND a resposta SHALL conter `primaryGoalSetupRequired` igual a `true`

#### Scenario: Objetivo principal inválido ou de outro usuário

- GIVEN existe um usuário autenticado
- AND o perfil possui `primaryGoalId`
- AND o objetivo não existe ou não pertence ao usuário autenticado
- WHEN o usuário consulta o dashboard
- THEN a resposta SHALL conter `primaryGoal` igual a `null`
- AND a resposta SHALL conter `primaryGoalSetupRequired` igual a `true`

### Requirement: Gerar alertas financeiros

O sistema SHALL gerar alertas financeiros básicos com base no resumo do dashboard.

#### Scenario: Alerta de sobra negativa

- GIVEN existe um usuário autenticado
- AND `expectedSurplusInCents` é menor que zero
- WHEN o usuário consulta o dashboard
- THEN o sistema SHALL gerar alerta `NEGATIVE_SURPLUS`
- AND o alerta SHALL ter severidade `HIGH`

#### Scenario: Alerta de dívida atrasada

- GIVEN existe um usuário autenticado
- AND `overdueDebtsCount` é maior que zero
- WHEN o usuário consulta o dashboard
- THEN o sistema SHALL gerar alerta `OVERDUE_DEBT`
- AND o alerta SHALL ter severidade `HIGH`

#### Scenario: Alerta de reserva não configurada

- GIVEN existe um usuário autenticado
- AND o usuário não possui reserva configurada
- WHEN o usuário consulta o dashboard
- THEN o sistema SHALL gerar alerta `RESERVE_SETUP_REQUIRED`
- AND o alerta SHALL ter severidade `MEDIUM`

#### Scenario: Alerta de objetivo principal não configurado

- GIVEN existe um usuário autenticado
- AND o usuário não possui objetivo principal configurado
- WHEN o usuário consulta o dashboard
- THEN o sistema SHALL gerar alerta `PRIMARY_GOAL_SETUP_REQUIRED`
- AND o alerta SHALL ter severidade `LOW`

#### Scenario: Alerta de renda não cadastrada

- GIVEN existe um usuário autenticado
- AND `totalIncomeInCents` é igual a zero
- WHEN o usuário consulta o dashboard
- THEN o sistema SHALL gerar alerta `NO_INCOME_REGISTERED`
- AND o alerta SHALL ter severidade `MEDIUM`

#### Scenario: Alerta de despesas fixas maiores que renda mensal

- GIVEN existe um usuário autenticado
- AND `monthlyIncomeInCents` é maior que zero
- AND `fixedExpensesInCents` é maior que `monthlyIncomeInCents`
- WHEN o usuário consulta o dashboard
- THEN o sistema SHALL gerar alerta `FIXED_EXPENSES_EXCEED_MONTHLY_INCOME`
- AND o alerta SHALL ter severidade `HIGH`
