# user-profile Specification

## Purpose
TBD - created by archiving change add-user-profile. Update Purpose after archive.
## Requirements
### Requirement: Consultar perfil do usuário autenticado

O sistema SHALL permitir que usuários autenticados consultem seus próprios dados básicos e perfil.

#### Scenario: Consulta de perfil bem-sucedida

- GIVEN existe um usuário autenticado
- WHEN o usuário envia uma requisição `GET /me`
- THEN o sistema SHALL retornar status 200
- AND a resposta SHALL conter dados seguros do usuário autenticado
- AND a resposta SHALL conter o perfil do usuário

#### Scenario: Criação automática de perfil

- GIVEN existe um usuário autenticado
- AND o usuário ainda não possui perfil
- WHEN o usuário envia uma requisição `GET /me`
- THEN o sistema SHALL criar um perfil com valores padrão
- AND o sistema SHALL retornar o perfil criado

#### Scenario: Consulta de perfil sem autenticação

- GIVEN não existe usuário autenticado
- WHEN uma requisição `GET /me` é enviada
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 401
- AND a resposta SHALL conter o código de erro `UNAUTHORIZED`

#### Scenario: Dados sensíveis não são retornados

- GIVEN existe um usuário autenticado
- WHEN o usuário envia uma requisição `GET /me`
- THEN a resposta SHALL NOT conter `passwordHash`
- AND a resposta SHALL NOT conter `cpfHash`
- AND a resposta SHALL NOT conter `refreshTokenHash`

### Requirement: Atualizar perfil do usuário autenticado

O sistema SHALL permitir que usuários autenticados atualizem dados editáveis do próprio perfil.

#### Scenario: Atualização de perfil bem-sucedida

- GIVEN existe um usuário autenticado
- AND o usuário informa dados válidos
- WHEN o usuário envia uma requisição `PATCH /me/profile`
- THEN o sistema SHALL atualizar os dados editáveis do usuário
- AND o sistema SHALL atualizar os dados editáveis do perfil
- AND o sistema SHALL retornar status 200
- AND a resposta SHALL conter os dados atualizados

#### Scenario: Tentativa de atualizar perfil sem autenticação

- GIVEN não existe usuário autenticado
- WHEN uma requisição `PATCH /me/profile` é enviada
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 401
- AND a resposta SHALL conter o código de erro `UNAUTHORIZED`

#### Scenario: Tentativa de atualizar displayName muito longo

- GIVEN existe um usuário autenticado
- AND o usuário informa `displayName` com mais de 100 caracteres
- WHEN o usuário envia uma requisição `PATCH /me/profile`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `DISPLAY_NAME_TOO_LONG`

#### Scenario: Tentativa de atualizar avatarUrl inválida

- GIVEN existe um usuário autenticado
- AND o usuário informa uma `avatarUrl` inválida
- WHEN o usuário envia uma requisição `PATCH /me/profile`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `INVALID_AVATAR_URL`

#### Scenario: Tentativa de atualizar moeda inválida

- GIVEN existe um usuário autenticado
- AND o usuário informa `currencyCode` diferente de `BRL`
- WHEN o usuário envia uma requisição `PATCH /me/profile`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `INVALID_CURRENCY_CODE`

#### Scenario: Tentativa de atualizar locale inválido

- GIVEN existe um usuário autenticado
- AND o usuário informa `locale` diferente de `pt-BR`
- WHEN o usuário envia uma requisição `PATCH /me/profile`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `INVALID_LOCALE`

#### Scenario: Tentativa de atualizar timezone inválida

- GIVEN existe um usuário autenticado
- AND o usuário informa uma `timezone` inválida
- WHEN o usuário envia uma requisição `PATCH /me/profile`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `INVALID_TIMEZONE`

#### Scenario: Tentativa de atualizar dia inicial do mês financeiro inválido

- GIVEN existe um usuário autenticado
- AND o usuário informa `financialMonthStartDay` menor que 1 ou maior que 28
- WHEN o usuário envia uma requisição `PATCH /me/profile`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `INVALID_FINANCIAL_MONTH_START_DAY`

### Requirement: Definir objetivo principal

O sistema SHALL permitir que usuários autenticados definam um objetivo financeiro principal para uso no dashboard.

#### Scenario: Definição de objetivo principal bem-sucedida

- GIVEN existe um usuário autenticado
- AND existe um objetivo financeiro associado ao usuário autenticado
- WHEN o usuário envia uma requisição `PATCH /me/primary-goal` com o ID desse objetivo
- THEN o sistema SHALL definir esse objetivo como objetivo principal
- AND o sistema SHALL retornar status 200

#### Scenario: Remoção de objetivo principal

- GIVEN existe um usuário autenticado
- AND o usuário possui um objetivo principal definido
- WHEN o usuário envia uma requisição `PATCH /me/primary-goal` com `primaryGoalId` igual a `null`
- THEN o sistema SHALL remover o objetivo principal
- AND o sistema SHALL retornar status 200

#### Scenario: Tentativa de definir objetivo principal inexistente

- GIVEN existe um usuário autenticado
- AND o usuário informa um `primaryGoalId` inexistente
- WHEN o usuário envia uma requisição `PATCH /me/primary-goal`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 404
- AND a resposta SHALL conter o código de erro `GOAL_NOT_FOUND`

#### Scenario: Tentativa de definir objetivo principal de outro usuário

- GIVEN existe um usuário autenticado
- AND existe um objetivo financeiro pertencente a outro usuário
- WHEN o usuário envia uma requisição `PATCH /me/primary-goal` com o ID desse objetivo
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 403
- AND a resposta SHALL conter o código de erro `FORBIDDEN`

### Requirement: Isolamento do perfil por usuário

O sistema SHALL garantir que cada usuário autenticado acesse e altere apenas seu próprio perfil.

#### Scenario: Usuário acessa apenas o próprio perfil

- GIVEN existem dois usuários cadastrados
- AND ambos possuem perfis
- WHEN o primeiro usuário envia uma requisição `GET /me`
- THEN o sistema SHALL retornar apenas os dados do primeiro usuário
- AND a resposta SHALL NOT conter dados do segundo usuário

#### Scenario: Usuário atualiza apenas o próprio perfil

- GIVEN existem dois usuários cadastrados
- AND ambos possuem perfis
- WHEN o primeiro usuário envia uma requisição `PATCH /me/profile`
- THEN o sistema SHALL atualizar apenas o perfil do primeiro usuário
- AND o perfil do segundo usuário SHALL permanecer inalterado

