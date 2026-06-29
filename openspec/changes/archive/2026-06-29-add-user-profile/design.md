# Design: Adicionar Perfil do Usuário

## Visão geral

Esta mudança adiciona uma camada de perfil do usuário para o MVP.

O objetivo é permitir que o usuário autenticado visualize seus dados básicos e configure preferências mínimas que serão usadas pelo dashboard.

O perfil será composto por dados que já existem no `User` e por dados novos no `UserProfile`.

O backend seguirá a arquitetura em camadas:

```txt
Route → Controller → Service → Repository → Prisma
```

O domínio será implementado em:

```txt
apps/api/src/modules/user-profile/
```

## Decisões técnicas

### Separação entre User e UserProfile

O model `User` continuará guardando dados essenciais de autenticação e identificação.

Exemplos:

```txt
firstName
lastName
email
passwordHash
cpfHash
```

O novo model `UserProfile` guardará dados de apresentação e preferências financeiras.

Exemplos:

```txt
displayName
avatarUrl
currencyCode
locale
timezone
financialMonthStartDay
primaryGoalId
onboardingCompleted
```

Essa separação evita misturar autenticação com preferências de uso do sistema.

### Criação automática do perfil

O sistema SHALL garantir que todo usuário autenticado tenha um perfil.

Se o perfil ainda não existir, ele poderá ser criado automaticamente no primeiro `GET /me`.

Essa decisão evita necessidade de alterar o fluxo de cadastro já implementado.

### Dados editáveis no MVP

O usuário SHALL poder atualizar:

```txt
firstName
lastName
displayName
avatarUrl
currencyCode
locale
timezone
financialMonthStartDay
```

O usuário SHALL NOT poder atualizar nesta change:

```txt
email
cpf
password
```

Esses campos exigem regras específicas de segurança e ficam fora do MVP.

### Preferências financeiras

#### currencyCode

Para o MVP, o sistema SHALL aceitar apenas:

```txt
BRL
```

#### locale

Para o MVP, o sistema SHALL aceitar apenas:

```txt
pt-BR
```

#### timezone

O sistema SHALL aceitar uma timezone válida.

Valor padrão:

```txt
America/Recife
```

#### financialMonthStartDay

Define em qual dia começa o mês financeiro do usuário.

O sistema SHALL aceitar valores entre:

```txt
1 e 28
```

O limite em 28 evita problemas com meses de tamanhos diferentes.

Valor padrão:

```txt
1
```

### Objetivo principal

O usuário SHALL poder definir um objetivo financeiro principal através de `primaryGoalId`.

Esse campo será usado futuramente pelo dashboard para destacar o objetivo mais importante do usuário.

Regras:

```txt
primaryGoalId pode ser null
primaryGoalId deve pertencer ao usuário autenticado
primaryGoalId deve existir
```

### Dados sensíveis

O endpoint `GET /me` SHALL NOT retornar:

```txt
passwordHash
cpfHash
refreshTokenHash
```

Também não deve retornar CPF em texto puro, pois o CPF não é armazenado diretamente.

## Arquitetura

Estrutura esperada:

```txt
apps/api/src/modules/user-profile/
├── user-profile.routes.ts
├── user-profile.controller.ts
├── user-profile.service.ts
├── user-profile.repository.ts
├── user-profile.schemas.ts
├── user-profile.types.ts
└── user-profile.errors.ts
```

Testes esperados:

```txt
apps/api/tests/unit/user-profile/user-profile-policy.spec.ts
apps/api/tests/unit/user-profile/user-profile.service.spec.ts
apps/api/tests/integration/user-profile/user-profile.spec.ts
```

## Áreas afetadas

- `apps/api/src/modules/user-profile` — novo módulo de perfil.
- `apps/api/src/app.ts` — registro das rotas.
- `apps/api/src/shared/middlewares/auth` — middleware de autenticação existente.
- `apps/api/prisma/schema.prisma` — model `UserProfile`.
- `apps/api/tests/unit/user-profile` — testes unitários.
- `apps/api/tests/integration/user-profile` — testes de integração.

## Modelo de dados

### UserProfile

```prisma
model UserProfile {
  id                     String   @id @default(uuid())
  userId                 String   @unique
  displayName            String?
  avatarUrl              String?
  currencyCode           String   @default("BRL")
  locale                 String   @default("pt-BR")
  timezone               String   @default("America/Recife")
  financialMonthStartDay Int      @default(1)
  primaryGoalId          String?
  onboardingCompleted    Boolean  @default(false)
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

O model `User` deverá receber:

```prisma
profile UserProfile?
```

## Contrato de API

Todas as rotas SHALL exigir autenticação.

### GET /me

Retorna dados seguros do usuário autenticado e seu perfil.

Success response:

```json
{
  "user": {
    "id": "uuid",
    "firstName": "Lucas",
    "lastName": "Fernandes",
    "email": "lucas@email.com"
  },
  "profile": {
    "displayName": "Lucas",
    "avatarUrl": null,
    "currencyCode": "BRL",
    "locale": "pt-BR",
    "timezone": "America/Recife",
    "financialMonthStartDay": 1,
    "primaryGoalId": null,
    "onboardingCompleted": false
  }
}
```

### PATCH /me/profile

Atualiza dados editáveis do usuário e do perfil.

Request:

```json
{
  "firstName": "Lucas",
  "lastName": "Fernandes",
  "displayName": "Lucas",
  "avatarUrl": "https://example.com/avatar.png",
  "currencyCode": "BRL",
  "locale": "pt-BR",
  "timezone": "America/Recife",
  "financialMonthStartDay": 1
}
```

Success response:

```json
{
  "user": {
    "id": "uuid",
    "firstName": "Lucas",
    "lastName": "Fernandes",
    "email": "lucas@email.com"
  },
  "profile": {
    "displayName": "Lucas",
    "avatarUrl": "https://example.com/avatar.png",
    "currencyCode": "BRL",
    "locale": "pt-BR",
    "timezone": "America/Recife",
    "financialMonthStartDay": 1,
    "primaryGoalId": null,
    "onboardingCompleted": false
  }
}
```

### PATCH /me/primary-goal

Define ou remove o objetivo principal.

Request para definir:

```json
{
  "primaryGoalId": "goal-uuid"
}
```

Request para remover:

```json
{
  "primaryGoalId": null
}
```

Success response:

```json
{
  "profile": {
    "primaryGoalId": "goal-uuid"
  }
}
```

## Regras de validação

| Campo                    | Regra                                                  |
| ------------------------ | ------------------------------------------------------ |
| `firstName`              | opcional                                               |
| `firstName`              | máximo 100 caracteres                                  |
| `lastName`               | opcional                                               |
| `lastName`               | máximo 100 caracteres                                  |
| `displayName`            | opcional                                               |
| `displayName`            | máximo 100 caracteres                                  |
| `avatarUrl`              | opcional                                               |
| `avatarUrl`              | deve ser URL válida quando informado                   |
| `currencyCode`           | opcional                                               |
| `currencyCode`           | deve ser `BRL`                                         |
| `locale`                 | opcional                                               |
| `locale`                 | deve ser `pt-BR`                                       |
| `timezone`               | opcional                                               |
| `timezone`               | deve ser timezone válida                               |
| `financialMonthStartDay` | opcional                                               |
| `financialMonthStartDay` | inteiro entre 1 e 28                                   |
| `primaryGoalId`          | pode ser `string` ou `null`                            |
| `primaryGoalId`          | deve pertencer ao usuário autenticado quando informado |

## Mapeamento de erros

| Caso                                        | HTTP Status | Código de erro                    |
| ------------------------------------------- | ----------: | --------------------------------- |
| Não autenticado                             |         401 | UNAUTHORIZED                      |
| Campos inválidos                            |         400 | VALIDATION_ERROR                  |
| Nome muito longo                            |         400 | USER_NAME_TOO_LONG                |
| Display name muito longo                    |         400 | DISPLAY_NAME_TOO_LONG             |
| Avatar URL inválida                         |         400 | INVALID_AVATAR_URL                |
| Currency inválida                           |         400 | INVALID_CURRENCY_CODE             |
| Locale inválido                             |         400 | INVALID_LOCALE                    |
| Timezone inválida                           |         400 | INVALID_TIMEZONE                  |
| Dia inicial do mês financeiro inválido      |         400 | INVALID_FINANCIAL_MONTH_START_DAY |
| Objetivo principal inexistente              |         404 | GOAL_NOT_FOUND                    |
| Objetivo principal pertence a outro usuário |         403 | FORBIDDEN                         |

## Testes unitários

### user-profile-policy.spec.ts

Deve testar regras puras:

- perfil válido
- `displayName` válido
- `displayName` muito longo
- `firstName` muito longo
- `lastName` muito longo
- `avatarUrl` válida
- `avatarUrl` inválida
- `currencyCode` válido
- `currencyCode` inválido
- `locale` válido
- `locale` inválido
- `timezone` válida
- `timezone` inválida
- `financialMonthStartDay` menor que 1
- `financialMonthStartDay` maior que 28

### user-profile.service.spec.ts

Deve testar o service com repository mockado:

- retorna perfil do usuário autenticado
- cria perfil automaticamente caso não exista
- atualiza dados básicos do usuário
- atualiza dados do perfil
- não retorna dados sensíveis
- define objetivo principal pertencente ao usuário
- remove objetivo principal com `null`
- rejeita objetivo principal inexistente
- rejeita objetivo principal pertencente a outro usuário

## Testes de integração

Arquivo sugerido:

```txt
apps/api/tests/integration/user-profile/user-profile.spec.ts
```

Cenários obrigatórios:

- `GET /me` retorna dados do usuário autenticado
- `GET /me` cria perfil automaticamente caso não exista
- `GET /me` não retorna dados sensíveis
- `GET /me` sem autenticação retorna 401
- `PATCH /me/profile` atualiza perfil com sucesso
- `PATCH /me/profile` rejeita `displayName` muito longo
- `PATCH /me/profile` rejeita `avatarUrl` inválida
- `PATCH /me/profile` rejeita `financialMonthStartDay` inválido
- `PATCH /me/profile` sem autenticação retorna 401
- `PATCH /me/primary-goal` define objetivo principal com sucesso
- `PATCH /me/primary-goal` remove objetivo principal com `null`
- `PATCH /me/primary-goal` rejeita objetivo inexistente
- `PATCH /me/primary-goal` rejeita objetivo de outro usuário

## Estratégia TDD

A implementação SHALL seguir esta ordem:

```txt
1. Criar testes unitários de user-profile-policy
2. Rodar e confirmar falha
3. Implementar validações puras
4. Rodar e confirmar sucesso

5. Criar testes unitários do UserProfileService
6. Rodar e confirmar falha
7. Implementar UserProfileService
8. Rodar e confirmar sucesso

9. Criar testes de integração
10. Rodar e confirmar falha
11. Implementar Prisma, repository, controller e rotas
12. Rodar e confirmar sucesso

13. Rodar suíte completa
```

## Restrições

- Não implementar frontend.
- Não implementar alteração de e-mail.
- Não implementar alteração de senha.
- Não implementar alteração de CPF.
- Não implementar upload real de imagem.
- Não implementar exclusão de conta.
- Não permitir acesso ao perfil de outro usuário.
- Não retornar dados sensíveis.
- Não alterar autenticação existente além do uso do middleware.
