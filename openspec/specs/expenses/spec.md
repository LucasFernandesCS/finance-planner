# expenses Specification

## Purpose
TBD - created by archiving change add-expense-management. Update Purpose after archive.
## Requirements
### Requirement: Adicionar despesa fixa

O sistema SHALL permitir que usuários autenticados adicionem despesas fixas.

#### Scenario: Adição de despesa fixa bem-sucedida

- GIVEN existe um usuário autenticado
- AND o usuário informa título, valor, categoria e mês inicial válidos
- WHEN o usuário envia uma requisição `POST /fixed-expenses`
- THEN o sistema SHALL criar uma despesa fixa associada ao usuário autenticado
- AND o sistema SHALL retornar status 201
- AND a resposta SHALL conter os dados da despesa fixa criada

#### Scenario: Tentativa de adicionar despesa fixa sem autenticação

- GIVEN não existe usuário autenticado
- WHEN uma requisição `POST /fixed-expenses` é enviada
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 401
- AND a resposta SHALL conter o código de erro `UNAUTHORIZED`

#### Scenario: Tentativa de adicionar despesa fixa negativa

- GIVEN existe um usuário autenticado
- AND o usuário informa uma despesa fixa com valor menor que zero
- WHEN o usuário envia uma requisição `POST /fixed-expenses`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `EXPENSE_AMOUNT_MUST_BE_POSITIVE`

#### Scenario: Tentativa de adicionar despesa fixa com valor zerado

- GIVEN existe um usuário autenticado
- AND o usuário informa uma despesa fixa com valor igual a zero
- WHEN o usuário envia uma requisição `POST /fixed-expenses`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `EXPENSE_AMOUNT_MUST_BE_POSITIVE`

#### Scenario: Tentativa de adicionar despesa fixa sem campos obrigatórios

- GIVEN existe um usuário autenticado
- AND a requisição não contém todos os campos obrigatórios
- WHEN o usuário envia uma requisição `POST /fixed-expenses`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `VALIDATION_ERROR`

#### Scenario: Tentativa de adicionar despesa fixa acima do limite

- GIVEN existe um usuário autenticado
- AND o usuário informa uma despesa fixa acima do limite permitido
- WHEN o usuário envia uma requisição `POST /fixed-expenses`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `EXPENSE_AMOUNT_OVERFLOW`

#### Scenario: Tentativa de adicionar despesa fixa com título muito longo

- GIVEN existe um usuário autenticado
- AND o usuário informa um título com mais de 100 caracteres
- WHEN o usuário envia uma requisição `POST /fixed-expenses`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `EXPENSE_TITLE_TOO_LONG`

### Requirement: Listar despesas fixas

O sistema SHALL permitir que usuários autenticados listem apenas suas próprias despesas fixas.

#### Scenario: Listagem de despesas fixas

- GIVEN existe um usuário autenticado
- AND existem despesas fixas associadas a esse usuário
- WHEN o usuário envia uma requisição `GET /fixed-expenses`
- THEN o sistema SHALL retornar status 200
- AND a resposta SHALL conter apenas despesas fixas do usuário autenticado

#### Scenario: Listagem não retorna despesa fixa de outro usuário

- GIVEN existe um usuário autenticado
- AND existe despesa fixa cadastrada para outro usuário
- WHEN o usuário envia uma requisição `GET /fixed-expenses`
- THEN o sistema SHALL retornar status 200
- AND a resposta SHALL NOT conter despesas fixas pertencentes ao outro usuário

### Requirement: Atualizar despesa fixa

O sistema SHALL permitir que usuários autenticados atualizem suas próprias despesas fixas.

#### Scenario: Atualização de despesa fixa própria

- GIVEN existe um usuário autenticado
- AND existe uma despesa fixa associada a esse usuário
- WHEN o usuário envia uma requisição `PATCH /fixed-expenses/:fixedExpenseId` com dados válidos
- THEN o sistema SHALL atualizar a despesa fixa
- AND o sistema SHALL retornar status 200
- AND a resposta SHALL conter a despesa fixa atualizada

#### Scenario: Tentativa de atualizar despesa fixa de outro usuário

- GIVEN existe um usuário autenticado
- AND existe uma despesa fixa associada a outro usuário
- WHEN o usuário envia uma requisição `PATCH /fixed-expenses/:fixedExpenseId` para a despesa do outro usuário
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 403
- AND a resposta SHALL conter o código de erro `FORBIDDEN`

#### Scenario: Tentativa de atualizar despesa fixa inexistente

- GIVEN existe um usuário autenticado
- WHEN o usuário envia uma requisição `PATCH /fixed-expenses/:fixedExpenseId` com identificador inexistente
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 404
- AND a resposta SHALL conter o código de erro `FIXED_EXPENSE_NOT_FOUND`

### Requirement: Remover despesa fixa

O sistema SHALL permitir que usuários autenticados removam suas próprias despesas fixas.

#### Scenario: Remoção de despesa fixa própria

- GIVEN existe um usuário autenticado
- AND existe uma despesa fixa associada a esse usuário
- WHEN o usuário envia uma requisição `DELETE /fixed-expenses/:fixedExpenseId`
- THEN o sistema SHALL remover a despesa fixa
- AND o sistema SHALL retornar status 200

#### Scenario: Tentativa de remover despesa fixa de outro usuário

- GIVEN existe um usuário autenticado
- AND existe uma despesa fixa associada a outro usuário
- WHEN o usuário envia uma requisição `DELETE /fixed-expenses/:fixedExpenseId` para a despesa do outro usuário
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 403
- AND a resposta SHALL conter o código de erro `FORBIDDEN`

#### Scenario: Tentativa de remover despesa fixa inexistente

- GIVEN existe um usuário autenticado
- WHEN o usuário envia uma requisição `DELETE /fixed-expenses/:fixedExpenseId` com identificador inexistente
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 404
- AND a resposta SHALL conter o código de erro `FIXED_EXPENSE_NOT_FOUND`

### Requirement: Adicionar despesa variável

O sistema SHALL permitir que usuários autenticados adicionem despesas variáveis a um mês de referência.

#### Scenario: Adição de despesa variável bem-sucedida

- GIVEN existe um usuário autenticado
- AND o usuário informa título, valor, categoria e mês de referência válidos
- WHEN o usuário envia uma requisição `POST /variable-expenses`
- THEN o sistema SHALL criar uma despesa variável associada ao usuário autenticado
- AND o sistema SHALL retornar status 201
- AND a resposta SHALL conter os dados da despesa variável criada

#### Scenario: Tentativa de adicionar despesa variável sem autenticação

- GIVEN não existe usuário autenticado
- WHEN uma requisição `POST /variable-expenses` é enviada
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 401
- AND a resposta SHALL conter o código de erro `UNAUTHORIZED`

#### Scenario: Tentativa de adicionar despesa variável negativa

- GIVEN existe um usuário autenticado
- AND o usuário informa uma despesa variável com valor menor que zero
- WHEN o usuário envia uma requisição `POST /variable-expenses`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `EXPENSE_AMOUNT_MUST_BE_POSITIVE`

#### Scenario: Tentativa de adicionar despesa variável com valor zerado

- GIVEN existe um usuário autenticado
- AND o usuário informa uma despesa variável com valor igual a zero
- WHEN o usuário envia uma requisição `POST /variable-expenses`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `EXPENSE_AMOUNT_MUST_BE_POSITIVE`

#### Scenario: Tentativa de adicionar despesa variável sem campos obrigatórios

- GIVEN existe um usuário autenticado
- AND a requisição não contém todos os campos obrigatórios
- WHEN o usuário envia uma requisição `POST /variable-expenses`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `VALIDATION_ERROR`

#### Scenario: Tentativa de adicionar despesa variável acima do limite

- GIVEN existe um usuário autenticado
- AND o usuário informa uma despesa variável acima do limite permitido
- WHEN o usuário envia uma requisição `POST /variable-expenses`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `EXPENSE_AMOUNT_OVERFLOW`

#### Scenario: Tentativa de adicionar despesa variável com título muito longo

- GIVEN existe um usuário autenticado
- AND o usuário informa um título com mais de 100 caracteres
- WHEN o usuário envia uma requisição `POST /variable-expenses`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `EXPENSE_TITLE_TOO_LONG`

### Requirement: Listar despesas variáveis

O sistema SHALL permitir que usuários autenticados listem apenas suas próprias despesas variáveis.

#### Scenario: Listagem de despesas variáveis por mês

- GIVEN existe um usuário autenticado
- AND existem despesas variáveis associadas ao usuário no mês informado
- WHEN o usuário envia uma requisição `GET /variable-expenses?month=YYYY-MM`
- THEN o sistema SHALL retornar status 200
- AND a resposta SHALL conter apenas despesas variáveis do usuário autenticado naquele mês

#### Scenario: Listagem não retorna despesa variável de outro usuário

- GIVEN existe um usuário autenticado
- AND existe despesa variável cadastrada para outro usuário
- WHEN o usuário envia uma requisição `GET /variable-expenses?month=YYYY-MM`
- THEN o sistema SHALL retornar status 200
- AND a resposta SHALL NOT conter despesas variáveis pertencentes ao outro usuário

### Requirement: Atualizar despesa variável

O sistema SHALL permitir que usuários autenticados atualizem suas próprias despesas variáveis.

#### Scenario: Atualização de despesa variável própria

- GIVEN existe um usuário autenticado
- AND existe uma despesa variável associada a esse usuário
- WHEN o usuário envia uma requisição `PATCH /variable-expenses/:variableExpenseId` com dados válidos
- THEN o sistema SHALL atualizar a despesa variável
- AND o sistema SHALL retornar status 200
- AND a resposta SHALL conter a despesa variável atualizada

#### Scenario: Tentativa de atualizar despesa variável de outro usuário

- GIVEN existe um usuário autenticado
- AND existe uma despesa variável associada a outro usuário
- WHEN o usuário envia uma requisição `PATCH /variable-expenses/:variableExpenseId` para a despesa do outro usuário
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 403
- AND a resposta SHALL conter o código de erro `FORBIDDEN`

#### Scenario: Tentativa de atualizar despesa variável inexistente

- GIVEN existe um usuário autenticado
- WHEN o usuário envia uma requisição `PATCH /variable-expenses/:variableExpenseId` com identificador inexistente
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 404
- AND a resposta SHALL conter o código de erro `VARIABLE_EXPENSE_NOT_FOUND`

### Requirement: Remover despesa variável

O sistema SHALL permitir que usuários autenticados removam suas próprias despesas variáveis.

#### Scenario: Remoção de despesa variável própria

- GIVEN existe um usuário autenticado
- AND existe uma despesa variável associada a esse usuário
- WHEN o usuário envia uma requisição `DELETE /variable-expenses/:variableExpenseId`
- THEN o sistema SHALL remover a despesa variável
- AND o sistema SHALL retornar status 200

#### Scenario: Tentativa de remover despesa variável de outro usuário

- GIVEN existe um usuário autenticado
- AND existe uma despesa variável associada a outro usuário
- WHEN o usuário envia uma requisição `DELETE /variable-expenses/:variableExpenseId` para a despesa do outro usuário
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 403
- AND a resposta SHALL conter o código de erro `FORBIDDEN`

#### Scenario: Tentativa de remover despesa variável inexistente

- GIVEN existe um usuário autenticado
- WHEN o usuário envia uma requisição `DELETE /variable-expenses/:variableExpenseId` com identificador inexistente
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 404
- AND a resposta SHALL conter o código de erro `VARIABLE_EXPENSE_NOT_FOUND`

