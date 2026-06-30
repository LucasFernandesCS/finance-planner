# Delta for Goals

## MODIFIED Requirements

### Requirement: Calcular viabilidade de objetivo

O sistema SHALL validar se o aporte mensal informado é suficiente para atingir o objetivo dentro do prazo.

#### Scenario: Tentativa de criar objetivo com aporte mensal abaixo do necessário

- GIVEN existe um usuário autenticado
- AND o usuário informa um objetivo com valor alvo de R$ 15.000,00
- AND o prazo informado é de 6 meses
- AND o aporte mensal informado é de R$ 1.250,00
- WHEN o usuário envia uma requisição `POST /goals`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `GOAL_MONTHLY_AMOUNT_TOO_LOW`
- AND a resposta SHALL conter o valor mensal sugerido de R$ 2.500,00

#### Scenario: Criação de objetivo com aporte mensal igual ao necessário

- GIVEN existe um usuário autenticado
- AND o usuário informa um objetivo com valor alvo de R$ 15.000,00
- AND o prazo informado é de 6 meses
- AND o aporte mensal informado é de R$ 2.500,00
- AND a sobra mensal livre do usuário é maior ou igual a R$ 2.500,00
- WHEN o usuário envia uma requisição `POST /goals`
- THEN o sistema SHALL criar o objetivo
- AND o sistema SHALL retornar status 201

#### Scenario: Criação de objetivo com aporte mensal maior que o necessário

- GIVEN existe um usuário autenticado
- AND o usuário informa um aporte mensal maior que o valor mensal sugerido
- AND o aporte mensal cabe na sobra mensal livre
- WHEN o usuário envia uma requisição `POST /goals`
- THEN o sistema SHALL criar o objetivo
- AND o sistema SHALL retornar status 201

#### Scenario: Tentativa de criar objetivo com aporte suficiente, mas acima da sobra livre

- GIVEN existe um usuário autenticado
- AND o usuário informa um aporte mensal igual ou maior que o valor mensal sugerido
- AND o aporte mensal ultrapassa a sobra mensal livre
- WHEN o usuário envia uma requisição `POST /goals`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 422
- AND a resposta SHALL conter o código de erro `GOAL_NOT_FINANCIALLY_FEASIBLE`
