# Delta for Incomes

## MODIFIED Requirements

### Requirement: Listar rendas por mês

O sistema SHALL listar rendas do usuário autenticado considerando a natureza recorrente ou pontual da renda.

#### Scenario: Renda mensal aparece no mês de referência

- GIVEN existe um usuário autenticado
- AND o usuário possui uma renda do tipo `MONTHLY` com `referenceMonth` igual a `2026-06`
- WHEN o usuário consulta `GET /incomes?month=2026-06`
- THEN o sistema SHALL retornar essa renda

#### Scenario: Renda mensal aparece em mês futuro

- GIVEN existe um usuário autenticado
- AND o usuário possui uma renda do tipo `MONTHLY` com `referenceMonth` igual a `2026-06`
- WHEN o usuário consulta `GET /incomes?month=2026-07`
- THEN o sistema SHALL retornar essa renda

#### Scenario: Renda extra aparece apenas no mês de referência

- GIVEN existe um usuário autenticado
- AND o usuário possui uma renda do tipo `EXTRA` com `referenceMonth` igual a `2026-06`
- WHEN o usuário consulta `GET /incomes?month=2026-06`
- THEN o sistema SHALL retornar essa renda

#### Scenario: Renda extra não aparece em mês futuro

- GIVEN existe um usuário autenticado
- AND o usuário possui uma renda do tipo `EXTRA` com `referenceMonth` igual a `2026-06`
- WHEN o usuário consulta `GET /incomes?month=2026-07`
- THEN o sistema SHALL NOT retornar essa renda
