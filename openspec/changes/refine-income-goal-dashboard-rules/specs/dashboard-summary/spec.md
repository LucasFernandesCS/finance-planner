# Delta for Dashboard Summary

## MODIFIED Requirements

### Requirement: Agregar rendas

O sistema SHALL agregar rendas mensais recorrentes e rendas extras pontuais no período do dashboard.

#### Scenario: Dashboard considera renda mensal recorrente em mês futuro

- GIVEN existe um usuário autenticado
- AND o usuário possui uma renda do tipo `MONTHLY` com `referenceMonth` igual a `2026-06`
- AND o valor da renda é R$ 12.000,00
- WHEN o usuário consulta `GET /dashboard/summary?month=2026-07`
- THEN `monthlyIncomeInCents` SHALL ser `1200000`
- AND `totalIncomeInCents` SHALL incluir essa renda

#### Scenario: Dashboard não considera renda extra em mês futuro

- GIVEN existe um usuário autenticado
- AND o usuário possui uma renda do tipo `EXTRA` com `referenceMonth` igual a `2026-06`
- AND o valor da renda é R$ 1.000,00
- WHEN o usuário consulta `GET /dashboard/summary?month=2026-07`
- THEN `extraIncomeInCents` SHALL ser `0`

#### Scenario: Dashboard calcula sobra prevista com renda recorrente

- GIVEN existe um usuário autenticado
- AND o usuário possui renda mensal recorrente de R$ 12.000,00 criada em `2026-06`
- AND o usuário possui despesas totais de R$ 6.405,75 em `2026-07`
- WHEN o usuário consulta `GET /dashboard/summary?month=2026-07`
- THEN `totalIncomeInCents` SHALL ser `1200000`
- AND `expectedSurplusInCents` SHALL ser `559425`
