# Tasks: Adicionar Perfil do Usuário

## 1. Especificação e planejamento

- [x] 1.1 Revisar `proposal.md`
- [x] 1.2 Revisar `design.md`
- [x] 1.3 Revisar `specs/user-profile/spec.md`
- [x] 1.4 Confirmar escopo reduzido para MVP
- [x] 1.5 Confirmar que alteração de e-mail, senha e CPF ficam fora do escopo
- [x] 1.6 Confirmar preferências financeiras mínimas
- [x] 1.7 Confirmar uso de objetivo principal para o dashboard
- [x] 1.8 Validar a change com OpenSpec

## 2. Testes unitários de validação antes da implementação

- [x] 2.1 Criar `apps/api/tests/unit/user-profile/user-profile-policy.spec.ts`
- [x] 2.2 Testar perfil válido
- [x] 2.3 Testar `displayName` válido
- [x] 2.4 Testar `displayName` muito longo
- [x] 2.5 Testar `firstName` muito longo
- [x] 2.6 Testar `lastName` muito longo
- [x] 2.7 Testar `avatarUrl` válida
- [x] 2.8 Testar `avatarUrl` inválida
- [x] 2.9 Testar `currencyCode` válido
- [x] 2.10 Testar `currencyCode` inválido
- [x] 2.11 Testar `locale` válido
- [x] 2.12 Testar `locale` inválido
- [x] 2.13 Testar `timezone` válida
- [x] 2.14 Testar `timezone` inválida
- [x] 2.15 Testar `financialMonthStartDay` menor que 1
- [x] 2.16 Testar `financialMonthStartDay` maior que 28
- [x] 2.17 Rodar os testes e confirmar que falham antes da implementação

## 3. Implementação das validações puras

- [x] 3.1 Criar `user-profile-policy.ts`
- [x] 3.2 Implementar validação de tamanho de nome
- [x] 3.3 Implementar validação de `displayName`
- [x] 3.4 Implementar validação de `avatarUrl`
- [x] 3.5 Implementar validação de `currencyCode`
- [x] 3.6 Implementar validação de `locale`
- [x] 3.7 Implementar validação de `timezone`
- [x] 3.8 Implementar validação de `financialMonthStartDay`
- [x] 3.9 Rodar testes unitários de policy e confirmar que passam

## 4. Modelo de dados

- [x] 4.1 Adicionar model `UserProfile` no Prisma
- [x] 4.2 Relacionar `UserProfile` com `User`
- [x] 4.3 Adicionar relação `profile UserProfile?` no model `User`
- [x] 4.4 Adicionar campo `primaryGoalId`
- [x] 4.5 Criar migration
- [x] 4.6 Rodar migration localmente
- [x] 4.7 Gerar Prisma Client

## 5. Testes unitários do UserProfileService antes da implementação

- [x] 5.1 Criar `apps/api/tests/unit/user-profile/user-profile.service.spec.ts`
- [x] 5.2 Mockar `UserProfileRepository`
- [x] 5.3 Testar retorno do perfil do usuário autenticado
- [x] 5.4 Testar criação automática do perfil caso não exista
- [x] 5.5 Testar atualização dos dados básicos do usuário
- [x] 5.6 Testar atualização dos dados do perfil
- [x] 5.7 Testar que dados sensíveis não são retornados
- [x] 5.8 Testar definição de objetivo principal pertencente ao usuário
- [x] 5.9 Testar remoção do objetivo principal com `null`
- [x] 5.10 Testar rejeição de objetivo principal inexistente
- [x] 5.11 Testar rejeição de objetivo principal pertencente a outro usuário
- [x] 5.12 Rodar os testes e confirmar que falham antes da implementação

## 6. Implementação do módulo de perfil

- [x] 6.1 Criar pasta `apps/api/src/modules/user-profile`
- [x] 6.2 Criar `user-profile.errors.ts`
- [x] 6.3 Criar `user-profile.types.ts`
- [x] 6.4 Criar `user-profile.schemas.ts`
- [x] 6.5 Criar `user-profile.repository.ts`
- [x] 6.6 Criar `user-profile.service.ts`
- [x] 6.7 Implementar busca do usuário autenticado
- [x] 6.8 Implementar criação automática de perfil caso não exista
- [x] 6.9 Implementar atualização de dados básicos do usuário
- [x] 6.10 Implementar atualização de dados do perfil
- [x] 6.11 Implementar definição de objetivo principal
- [x] 6.12 Implementar remoção de objetivo principal
- [x] 6.13 Garantir que dados sensíveis não são retornados
- [x] 6.14 Rodar testes unitários do service e confirmar que passam

## 7. Testes de integração antes da implementação HTTP

- [x] 7.1 Criar `apps/api/tests/integration/user-profile/user-profile.spec.ts`
- [x] 7.2 Testar `GET /me` retornando dados do usuário autenticado
- [x] 7.3 Testar `GET /me` criando perfil automaticamente caso não exista
- [x] 7.4 Testar `GET /me` sem retornar dados sensíveis
- [x] 7.5 Testar `GET /me` sem autenticação retornando 401
- [x] 7.6 Testar `PATCH /me/profile` atualizando perfil com sucesso
- [x] 7.7 Testar `PATCH /me/profile` rejeitando `displayName` muito longo
- [x] 7.8 Testar `PATCH /me/profile` rejeitando `avatarUrl` inválida
- [x] 7.9 Testar `PATCH /me/profile` rejeitando `financialMonthStartDay` inválido
- [x] 7.10 Testar `PATCH /me/profile` sem autenticação retornando 401
- [x] 7.11 Testar `PATCH /me/primary-goal` definindo objetivo principal com sucesso
- [x] 7.12 Testar `PATCH /me/primary-goal` removendo objetivo principal com `null`
- [x] 7.13 Testar `PATCH /me/primary-goal` rejeitando objetivo inexistente
- [x] 7.14 Testar `PATCH /me/primary-goal` rejeitando objetivo de outro usuário
- [x] 7.15 Rodar os testes e confirmar que falham antes da implementação HTTP

## 8. Implementação HTTP

- [x] 8.1 Criar `user-profile.controller.ts`
- [x] 8.2 Criar `user-profile.routes.ts`
- [x] 8.3 Proteger rotas com middleware de autenticação
- [x] 8.4 Implementar `GET /me`
- [x] 8.5 Implementar `PATCH /me/profile`
- [x] 8.6 Implementar `PATCH /me/primary-goal`
- [x] 8.7 Registrar rotas em `app.ts`
- [x] 8.8 Mapear erros de domínio para HTTP status correto
- [x] 8.9 Garantir que `userId` vem do token e não do body
- [x] 8.10 Garantir que dados sensíveis não são retornados
- [x] 8.11 Rodar testes de integração e confirmar que passam

## 9. Verificação

- [x] 9.1 Rodar `openspec validate add-user-profile --strict`
- [x] 9.2 Rodar testes unitários de perfil
- [x] 9.3 Rodar testes de integração de perfil
- [x] 9.4 Rodar `pnpm typecheck`
- [x] 9.5 Rodar `pnpm lint`
- [x] 9.6 Rodar `pnpm test`
- [x] 9.7 Rodar `pnpm build`
- [x] 9.8 Testar manualmente `GET /me`
- [x] 9.9 Testar manualmente `PATCH /me/profile`
- [x] 9.10 Testar manualmente `PATCH /me/primary-goal`
- [x] 9.11 Testar manualmente tentativa de definir objetivo de outro usuário
- [x] 9.12 Atualizar tasks concluídas
