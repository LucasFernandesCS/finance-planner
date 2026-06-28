# Tasks: Adicionar Gerenciamento de Rendas

## 1. Especificação e planejamento

- [x] 1.1 Revisar `proposal.md`
- [x] 1.2 Revisar `design.md`
- [x] 1.3 Revisar `specs/incomes/spec.md`
- [x] 1.4 Confirmar formato monetário em centavos
- [x] 1.5 Confirmar limite máximo de renda
- [x] 1.6 Confirmar uso do middleware de autenticação existente
- [x] 1.7 Validar a change com OpenSpec

## 2. Testes unitários de validação antes da implementação

- [x] 2.1 Criar `apps/api/tests/unit/incomes/income-policy.spec.ts`
- [x] 2.2 Testar renda válida
- [x] 2.3 Testar renda com valor negativo
- [x] 2.4 Testar renda com valor zerado
- [x] 2.5 Testar renda com valor acima do limite
- [x] 2.6 Testar renda sem título
- [x] 2.7 Testar renda com título muito longo
- [x] 2.8 Testar renda sem tipo
- [x] 2.9 Testar renda com tipo inválido
- [x] 2.10 Testar renda sem mês de referência
- [x] 2.11 Testar renda com mês de referência inválido
- [x] 2.12 Rodar os testes e confirmar que falham antes da implementação

## 3. Implementação das validações de renda

- [x] 3.1 Criar função ou serviço de validação de renda
- [x] 3.2 Implementar validação de valor positivo
- [x] 3.3 Implementar validação de valor máximo
- [x] 3.4 Implementar validação de título obrigatório
- [x] 3.5 Implementar validação de título máximo
- [x] 3.6 Implementar validação de tipo
- [x] 3.7 Implementar validação de mês de referência
- [x] 3.8 Rodar testes unitários de validação e confirmar que passam

## 4. Modelo de dados

- [x] 4.1 Adicionar enum `IncomeType` no Prisma
- [x] 4.2 Adicionar model `Income`
- [x] 4.3 Relacionar `Income` com `User`
- [x] 4.4 Adicionar índices por `userId`
- [x] 4.5 Adicionar índice por `userId` e `referenceMonth`
- [x] 4.6 Criar migration
- [x] 4.7 Rodar migration localmente
- [x] 4.8 Gerar Prisma Client

## 5. Testes unitários do IncomeService antes da implementação

- [x] 5.1 Criar `apps/api/tests/unit/incomes/income.service.spec.ts`
- [x] 5.2 Mockar `IncomeRepository`
- [x] 5.3 Testar criação de renda para usuário autenticado
- [x] 5.4 Testar listagem de rendas do usuário autenticado
- [x] 5.5 Testar atualização de renda própria
- [x] 5.6 Testar remoção de renda própria
- [x] 5.7 Testar tentativa de atualizar renda de outro usuário
- [x] 5.8 Testar tentativa de remover renda de outro usuário
- [x] 5.9 Testar renda não encontrada
- [x] 5.10 Rodar os testes e confirmar que falham antes da implementação

## 6. Implementação do módulo de renda

- [x] 6.1 Criar pasta `apps/api/src/modules/incomes`
- [x] 6.2 Criar `income.errors.ts`
- [x] 6.3 Criar `income.types.ts`
- [x] 6.4 Criar `income.schemas.ts`
- [x] 6.5 Criar `income.repository.ts`
- [x] 6.6 Criar `income.service.ts`
- [x] 6.7 Implementar criação de renda
- [x] 6.8 Implementar listagem por usuário e mês
- [x] 6.9 Implementar atualização com verificação de ownership
- [x] 6.10 Implementar remoção com verificação de ownership
- [x] 6.11 Rodar testes unitários do service e confirmar que passam

## 7. Testes de integração antes da implementação HTTP

- [x] 7.1 Criar `apps/api/tests/integration/incomes/income.spec.ts`
- [x] 7.2 Testar adição de renda bem-sucedida
- [x] 7.3 Testar tentativa de adicionar renda sem autenticação
- [x] 7.4 Testar tentativa de editar renda de outro usuário
- [x] 7.5 Testar tentativa de remover renda de outro usuário
- [x] 7.6 Testar tentativa de adicionar renda negativa
- [x] 7.7 Testar tentativa de adicionar renda zerada
- [x] 7.8 Testar tentativa de adicionar renda sem campos obrigatórios
- [x] 7.9 Testar tentativa de adicionar renda acima do limite
- [x] 7.10 Testar tentativa de adicionar renda com título muito longo
- [x] 7.11 Testar listagem retornando apenas rendas do usuário autenticado
- [x] 7.12 Testar atualização de renda própria
- [x] 7.13 Testar remoção de renda própria
- [x] 7.14 Rodar os testes e confirmar que falham antes da implementação HTTP

## 8. Implementação HTTP

- [x] 8.1 Criar `income.controller.ts`
- [x] 8.2 Criar `income.routes.ts`
- [x] 8.3 Proteger rotas com middleware de autenticação
- [x] 8.4 Implementar `POST /incomes`
- [x] 8.5 Implementar `GET /incomes?month=YYYY-MM`
- [x] 8.6 Implementar `PATCH /incomes/:incomeId`
- [x] 8.7 Implementar `DELETE /incomes/:incomeId`
- [x] 8.8 Registrar rotas em `app.ts`
- [x] 8.9 Mapear erros de domínio para HTTP status correto
- [x] 8.10 Garantir que `userId` vem do token e não do body
- [x] 8.11 Rodar testes de integração e confirmar que passam

## 9. Verificação

- [x] 9.1 Rodar `openspec validate add-income-management --strict`
- [x] 9.2 Rodar testes unitários de renda
- [x] 9.3 Rodar testes de integração de renda
- [x] 9.4 Rodar `pnpm typecheck`
- [x] 9.5 Rodar `pnpm lint`
- [x] 9.6 Rodar `pnpm test`
- [x] 9.7 Rodar `pnpm build`
- [x] 9.8 Testar manualmente criação de renda mensal
- [x] 9.9 Testar manualmente criação de renda extra
- [x] 9.10 Testar manualmente atualização de renda
- [x] 9.11 Testar manualmente remoção de renda
- [x] 9.12 Testar manualmente tentativa de alterar renda de outro usuário
- [x] 9.13 Atualizar tasks concluídas
