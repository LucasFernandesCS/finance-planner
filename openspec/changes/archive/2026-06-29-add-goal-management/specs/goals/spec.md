# Delta for Goals

## ADDED Requirements

### Requirement: Calcular viabilidade de objetivo

O sistema SHALL calcular se um objetivo financeiro é viável com base na renda mensal, despesas fixas e objetivos ativos do usuário.

#### Scenario: Cálculo de valor sugerido e prazo bem-sucedido

- GIVEN existe um usuário autenticado
- AND o usuário informa valor alvo e data limite válidos
- WHEN o sistema calcula a viabilidade do objetivo
- THEN o sistema SHALL dividir o valor alvo pelo prazo em meses
- AND o sistema SHALL retornar o valor mensal sugerido

#### Scenario: Validação de viabilidade bem-sucedida

- GIVEN existe um usuário autenticado
- AND o usuário possui renda mensal cadastrada
- AND o usuário possui despesas fixas cadastradas
- AND a parcela mensal sugerida é menor ou igual à sobra mensal livre
- WHEN o usuário cria um objetivo
- THEN o sistema SHALL aprovar a criação do objetivo

#### Scenario: Tentativa de adicionar objetivo inviável financeiramente

- GIVEN existe um usuário autenticado
- AND a parcela mensal necessária ultrapassa a sobra mensal livre
- WHEN o usuário tenta criar o objetivo
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 422
- AND a resposta SHALL conter o código de erro `GOAL_NOT_FINANCIALLY_FEASIBLE`
- AND a resposta SHALL conter mensagem explicando a inviabilidade
- AND a resposta SHALL conter sugestão viável de prazo ou redução de valor

#### Scenario: Cálculo dinâmico de sobra mensal na criação

- GIVEN existe um usuário autenticado
- AND existem rendas mensais e despesas fixas cadastradas no banco
- WHEN o usuário cria um objetivo
- THEN o sistema SHALL buscar os dados financeiros reais do usuário
- AND o sistema SHALL calcular a sobra mensal antes de validar o objetivo

#### Scenario: Concorrência com múltiplos objetivos

- GIVEN existe um usuário autenticado
- AND o usuário já possui objetivo ativo consumindo parte da sobra mensal
- WHEN o usuário tenta criar um novo objetivo
- THEN o sistema SHALL considerar apenas a sobra livre restante
- AND o sistema SHALL validar o novo objetivo com base nessa sobra livre

### Requirement: Adicionar objetivo

O sistema SHALL permitir que usuários autenticados adicionem objetivos financeiros.

#### Scenario: Adição de objetivo bem-sucedida

- GIVEN existe um usuário autenticado
- AND o usuário informa nome, valor alvo, valor mensal e data limite válidos
- AND o objetivo é financeiramente viável
- WHEN o usuário envia uma requisição `POST /goals`
- THEN o sistema SHALL criar um objetivo associado ao usuário autenticado
- AND o sistema SHALL retornar status 201
- AND o objetivo SHALL ser salvo com status `NOT_STARTED`

#### Scenario: Tentativa de adicionar objetivo com valor total negativo

- GIVEN existe um usuário autenticado
- AND o usuário informa valor alvo menor que zero
- WHEN o usuário envia uma requisição `POST /goals`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `GOAL_TARGET_AMOUNT_MUST_BE_POSITIVE`

#### Scenario: Tentativa de adicionar objetivo com valor total zerado

- GIVEN existe um usuário autenticado
- AND o usuário informa valor alvo igual a zero
- WHEN o usuário envia uma requisição `POST /goals`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `GOAL_TARGET_AMOUNT_MUST_BE_POSITIVE`

#### Scenario: Tentativa de adicionar objetivo sem campos obrigatórios

- GIVEN existe um usuário autenticado
- AND a requisição não contém nome, valor alvo ou data limite
- WHEN o usuário envia uma requisição `POST /goals`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `VALIDATION_ERROR`

#### Scenario: Tentativa de adicionar objetivo com data limite no passado

- GIVEN existe um usuário autenticado
- AND o usuário informa data limite no passado
- WHEN o usuário envia uma requisição `POST /goals`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `GOAL_DEADLINE_MUST_BE_FUTURE`

#### Scenario: Tentativa de adicionar objetivo com data limite hoje

- GIVEN existe um usuário autenticado
- AND o usuário informa data limite igual à data atual
- WHEN o usuário envia uma requisição `POST /goals`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `GOAL_DEADLINE_MUST_BE_FUTURE`

#### Scenario: Tentativa de adicionar objetivo com título muito longo

- GIVEN existe um usuário autenticado
- AND o usuário informa título com mais de 100 caracteres
- WHEN o usuário envia uma requisição `POST /goals`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `GOAL_TITLE_TOO_LONG`

#### Scenario: Tentativa de adicionar objetivo com valor acima do limite

- GIVEN existe um usuário autenticado
- AND o usuário informa valor alvo acima do limite permitido
- WHEN o usuário envia uma requisição `POST /goals`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `GOAL_AMOUNT_OVERFLOW`

#### Scenario: Tentativa de adicionar objetivo para outro usuário

- GIVEN existe um usuário autenticado
- AND a requisição tenta informar ou manipular o ID de outro usuário
- WHEN o usuário envia uma requisição `POST /goals`
- THEN o sistema SHALL rejeitar a operação
- AND o objetivo SHALL NOT ser associado ao outro usuário

### Requirement: Listar objetivos

O sistema SHALL permitir que usuários autenticados listem apenas seus próprios objetivos.

#### Scenario: Listagem de objetivos bem-sucedida

- GIVEN existe um usuário autenticado
- AND existem objetivos associados a esse usuário
- WHEN o usuário envia uma requisição `GET /goals`
- THEN o sistema SHALL retornar status 200
- AND a resposta SHALL conter os objetivos do usuário autenticado

#### Scenario: Listagem retorna apenas objetivos do usuário autenticado

- GIVEN existe um usuário autenticado
- AND existe objetivo cadastrado para outro usuário
- WHEN o usuário envia uma requisição `GET /goals`
- THEN o sistema SHALL retornar status 200
- AND a resposta SHALL NOT conter objetivos pertencentes ao outro usuário

### Requirement: Registrar depósito em objetivo

O sistema SHALL permitir que usuários autenticados registrem aportes em seus próprios objetivos.

#### Scenario: Depósito em objetivo bem-sucedido

- GIVEN existe um usuário autenticado
- AND existe um objetivo associado ao usuário
- WHEN o usuário envia uma requisição `POST /goals/:goalId/contributions`
- THEN o sistema SHALL criar um registro no histórico do objetivo
- AND o sistema SHALL aumentar o valor atual do objetivo
- AND a operação SHALL ocorrer de forma transacional

#### Scenario: Alteração automática de status para em andamento

- GIVEN existe um usuário autenticado
- AND existe um objetivo com status `NOT_STARTED`
- WHEN o usuário registra um depósito menor que o valor alvo
- THEN o sistema SHALL atualizar o status para `IN_PROGRESS`

#### Scenario: Alteração automática de status para atingido

- GIVEN existe um usuário autenticado
- AND existe um objetivo financeiro
- WHEN um depósito faz o valor atual igualar ou superar o valor alvo
- THEN o sistema SHALL alterar o status do objetivo para `ACHIEVED`

#### Scenario: Tentativa de depósito em objetivo de outro usuário

- GIVEN existe um usuário autenticado
- AND existe um objetivo pertencente a outro usuário
- WHEN o usuário tenta registrar um depósito nesse objetivo
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 403
- AND a resposta SHALL conter o código de erro `FORBIDDEN`

### Requirement: Atualizar status do objetivo

O sistema SHALL controlar transições inválidas de status.

#### Scenario: Transição de status inválida

- GIVEN existe um usuário autenticado
- AND existe um objetivo com valor atual menor que o valor alvo
- WHEN o usuário tenta alterar o status diretamente para `ACHIEVED`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `INVALID_GOAL_STATUS_TRANSITION`
