# incomes Specification

## Purpose
TBD - created by archiving change add-income-management. Update Purpose after archive.
## Requirements
### Requirement: Adicionar renda

O sistema SHALL permitir que usuários autenticados adicionem rendas ao mês de referência.

#### Scenario: Adição de renda bem-sucedida

- GIVEN existe um usuário autenticado
- AND o usuário informa título, valor, tipo e mês de referência válidos
- WHEN o usuário envia uma requisição `POST /incomes`
- THEN o sistema SHALL criar uma renda associada ao usuário autenticado
- AND o sistema SHALL retornar status 201
- AND a resposta SHALL conter os dados da renda criada

#### Scenario: Tentativa de adicionar renda sem autenticação

- GIVEN não existe usuário autenticado
- WHEN uma requisição `POST /incomes` é enviada
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 401
- AND a resposta SHALL conter o código de erro `UNAUTHORIZED`

#### Scenario: Tentativa de adicionar renda negativa

- GIVEN existe um usuário autenticado
- AND o usuário informa uma renda com valor menor que zero
- WHEN o usuário envia uma requisição `POST /incomes`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `INCOME_AMOUNT_MUST_BE_POSITIVE`

#### Scenario: Tentativa de adicionar renda com valor zerado

- GIVEN existe um usuário autenticado
- AND o usuário informa uma renda com valor igual a zero
- WHEN o usuário envia uma requisição `POST /incomes`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `INCOME_AMOUNT_MUST_BE_POSITIVE`

#### Scenario: Tentativa de adicionar renda sem campos obrigatórios

- GIVEN existe um usuário autenticado
- AND a requisição não contém todos os campos obrigatórios
- WHEN o usuário envia uma requisição `POST /incomes`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `VALIDATION_ERROR`

#### Scenario: Tentativa de adicionar renda acima do limite

- GIVEN existe um usuário autenticado
- AND o usuário informa uma renda acima do limite permitido
- WHEN o usuário envia uma requisição `POST /incomes`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `INCOME_AMOUNT_OVERFLOW`

#### Scenario: Tentativa de adicionar renda com título muito longo

- GIVEN existe um usuário autenticado
- AND o usuário informa um título com mais de 100 caracteres
- WHEN o usuário envia uma requisição `POST /incomes`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `INCOME_TITLE_TOO_LONG`

### Requirement: Listar rendas do usuário

O sistema SHALL permitir que usuários autenticados listem apenas suas próprias rendas.

#### Scenario: Listagem de rendas por mês

- GIVEN existe um usuário autenticado
- AND existem rendas associadas ao usuário no mês informado
- WHEN o usuário envia uma requisição `GET /incomes?month=YYYY-MM`
- THEN o sistema SHALL retornar status 200
- AND a resposta SHALL conter apenas as rendas do usuário autenticado naquele mês

#### Scenario: Listagem não retorna renda de outro usuário

- GIVEN existe um usuário autenticado
- AND existe renda cadastrada para outro usuário
- WHEN o usuário envia uma requisição `GET /incomes?month=YYYY-MM`
- THEN o sistema SHALL retornar status 200
- AND a resposta SHALL NOT conter rendas pertencentes ao outro usuário

### Requirement: Atualizar renda

O sistema SHALL permitir que usuários autenticados atualizem suas próprias rendas.

#### Scenario: Atualização de renda própria

- GIVEN existe um usuário autenticado
- AND existe uma renda associada a esse usuário
- WHEN o usuário envia uma requisição `PATCH /incomes/:incomeId` com dados válidos
- THEN o sistema SHALL atualizar a renda
- AND o sistema SHALL retornar status 200
- AND a resposta SHALL conter a renda atualizada

#### Scenario: Tentativa de atualizar renda de outro usuário

- GIVEN existe um usuário autenticado
- AND existe uma renda associada a outro usuário
- WHEN o usuário envia uma requisição `PATCH /incomes/:incomeId` para a renda do outro usuário
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 403
- AND a resposta SHALL conter o código de erro `FORBIDDEN`

#### Scenario: Tentativa de atualizar renda inexistente

- GIVEN existe um usuário autenticado
- WHEN o usuário envia uma requisição `PATCH /incomes/:incomeId` com identificador inexistente
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 404
- AND a resposta SHALL conter o código de erro `INCOME_NOT_FOUND`

### Requirement: Remover renda

O sistema SHALL permitir que usuários autenticados removam suas próprias rendas.

#### Scenario: Remoção de renda própria

- GIVEN existe um usuário autenticado
- AND existe uma renda associada a esse usuário
- WHEN o usuário envia uma requisição `DELETE /incomes/:incomeId`
- THEN o sistema SHALL remover a renda
- AND o sistema SHALL retornar status 200

#### Scenario: Tentativa de remover renda de outro usuário

- GIVEN existe um usuário autenticado
- AND existe uma renda associada a outro usuário
- WHEN o usuário envia uma requisição `DELETE /incomes/:incomeId` para a renda do outro usuário
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 403
- AND a resposta SHALL conter o código de erro `FORBIDDEN`

#### Scenario: Tentativa de remover renda inexistente

- GIVEN existe um usuário autenticado
- WHEN o usuário envia uma requisição `DELETE /incomes/:incomeId` com identificador inexistente
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 404
- AND a resposta SHALL conter o código de erro `INCOME_NOT_FOUND`

### Requirement: Histórico mensal de renda

O sistema SHALL preservar rendas por mês de referência para permitir análise histórica futura.

#### Scenario: Rendas em meses diferentes

- GIVEN existe um usuário autenticado
- WHEN o usuário cadastra uma renda para janeiro
- AND o usuário cadastra outra renda para junho
- THEN o sistema SHALL manter os dois registros associados aos seus respectivos meses de referência

#### Scenario: Atualização de renda de um mês específico

- GIVEN existe um usuário autenticado
- AND existe uma renda cadastrada em um mês de referência
- WHEN o usuário atualiza essa renda
- THEN o sistema SHALL alterar apenas o registro selecionado
- AND o sistema SHALL preservar rendas de outros meses

