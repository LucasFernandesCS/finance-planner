# Tasks: Adicionar Gerenciamento de Despesas

## 1. Especificação e planejamento

- [x] 1.1 Revisar `proposal.md`
- [x] 1.2 Revisar `design.md`
- [x] 1.3 Revisar `specs/expenses/spec.md`
- [x] 1.4 Confirmar formato monetário em centavos
- [x] 1.5 Confirmar limite máximo de despesa
- [x] 1.6 Confirmar categorias iniciais
- [x] 1.7 Confirmar uso do middleware de autenticação existente
- [x] 1.8 Validar a change com OpenSpec

## 2. Testes unitários de validação antes da implementação

- [x] 2.1 Criar `apps/api/tests/unit/expenses/expense-policy.spec.ts`
- [x] 2.2 Testar despesa válida
- [x] 2.3 Testar despesa com valor negativo
- [x] 2.4 Testar despesa com valor zerado
- [x] 2.5 Testar despesa com valor acima do limite
- [x] 2.6 Testar despesa sem título
- [x] 2.7 Testar despesa com título muito longo
- [x] 2.8 Testar despesa sem categoria
- [x] 2.9 Testar despesa com categoria inválida
- [x] 2.10 Testar despesa sem mês de referência
- [x] 2.11 Testar despesa com mês de referência inválido
- [x] 2.12 Rodar os testes e confirmar que falham antes da implementação

## 3. Implementação das validações de despesa

- [x] 3.1 Criar função ou serviço de validação de despesa
- [x] 3.2 Implementar validação de valor positivo
- [x] 3.3 Implementar validação de valor máximo
- [x] 3.4 Implementar validação de título obrigatório
- [x] 3.5 Implementar validação de título máximo
- [x] 3.6 Implementar validação de categoria
- [x] 3.7 Implementar validação de mês de referência
- [x] 3.8 Rodar testes unitários de validação e confirmar que passam

## 4. Modelo de dados

- [x] 4.1 Adicionar enum `ExpenseCategory` no Prisma
- [x] 4.2 Adicionar model `FixedExpense`
- [x] 4.3 Adicionar model `VariableExpense`
- [x] 4.4 Relacionar `FixedExpense` com `User`
- [x] 4.5 Relacionar `VariableExpense` com `User`
- [x] 4.6 Adicionar índices por `userId`
- [x] 4.7 Adicionar índices por mês
- [x] 4.8 Adicionar índices por categoria
- [x] 4.9 Criar migration
- [x] 4.10 Rodar migration localmente
- [x] 4.11 Gerar Prisma Client

## 5. Testes unitários do FixedExpenseService antes da implementação

- [x] 5.1 Criar `apps/api/tests/unit/expenses/fixed-expense.service.spec.ts`
- [x] 5.2 Mockar `ExpenseRepository`
- [x] 5.3 Testar criação de despesa fixa para usuário autenticado
- [x] 5.4 Testar listagem de despesas fixas do usuário autenticado
- [x] 5.5 Testar atualização de despesa fixa própria
- [x] 5.6 Testar remoção de despesa fixa própria
- [x] 5.7 Testar tentativa de atualizar despesa fixa de outro usuário
- [x] 5.8 Testar tentativa de remover despesa fixa de outro usuário
- [x] 5.9 Testar despesa fixa não encontrada
- [x] 5.10 Rodar os testes e confirmar que falham antes da implementação

## 6. Implementação do FixedExpenseService

- [x] 6.1 Criar pasta `apps/api/src/modules/expenses`
- [x] 6.2 Criar `expense.errors.ts`
- [x] 6.3 Criar `expense.types.ts`
- [x] 6.4 Criar `expense.schemas.ts`
- [x] 6.5 Criar `expense.repository.ts`
- [x] 6.6 Criar `fixed-expense.service.ts`
- [x] 6.7 Implementar criação de despesa fixa
- [x] 6.8 Implementar listagem de despesas fixas por usuário
- [x] 6.9 Implementar atualização com verificação de ownership
- [x] 6.10 Implementar remoção com verificação de ownership
- [x] 6.11 Rodar testes unitários do service e confirmar que passam

## 7. Testes unitários do VariableExpenseService antes da implementação

- [x] 7.1 Criar `apps/api/tests/unit/expenses/variable-expense.service.spec.ts`
- [x] 7.2 Mockar `ExpenseRepository`
- [x] 7.3 Testar criação de despesa variável para usuário autenticado
- [x] 7.4 Testar listagem de despesas variáveis do usuário autenticado por mês
- [x] 7.5 Testar atualização de despesa variável própria
- [x] 7.6 Testar remoção de despesa variável própria
- [x] 7.7 Testar tentativa de atualizar despesa variável de outro usuário
- [x] 7.8 Testar tentativa de remover despesa variável de outro usuário
- [x] 7.9 Testar despesa variável não encontrada
- [x] 7.10 Rodar os testes e confirmar que falham antes da implementação

## 8. Implementação do VariableExpenseService

- [x] 8.1 Criar `variable-expense.service.ts`
- [x] 8.2 Implementar criação de despesa variável
- [x] 8.3 Implementar listagem de despesas variáveis por usuário e mês
- [x] 8.4 Implementar atualização com verificação de ownership
- [x] 8.5 Implementar remoção com verificação de ownership
- [x] 8.6 Rodar testes unitários do service e confirmar que passam

## 9. Testes de integração de despesas fixas antes da implementação HTTP

- [x] 9.1 Criar `apps/api/tests/integration/expenses/fixed-expense.spec.ts`
- [x] 9.2 Testar adição de despesa fixa bem-sucedida
- [x] 9.3 Testar tentativa de adicionar despesa fixa sem autenticação
- [x] 9.4 Testar tentativa de editar despesa fixa de outro usuário
- [x] 9.5 Testar tentativa de remover despesa fixa de outro usuário
- [x] 9.6 Testar tentativa de adicionar despesa fixa negativa
- [x] 9.7 Testar tentativa de adicionar despesa fixa zerada
- [x] 9.8 Testar tentativa de adicionar despesa fixa sem campos obrigatórios
- [x] 9.9 Testar tentativa de adicionar despesa fixa acima do limite
- [x] 9.10 Testar tentativa de adicionar despesa fixa com título muito longo
- [x] 9.11 Testar listagem retornando apenas despesas fixas do usuário autenticado
- [x] 9.12 Testar atualização de despesa fixa própria
- [x] 9.13 Testar remoção de despesa fixa própria
- [x] 9.14 Rodar os testes e confirmar que falham antes da implementação HTTP

## 10. Implementação HTTP de despesas fixas

- [x] 10.1 Criar `fixed-expense.controller.ts`
- [x] 10.2 Criar rotas de despesas fixas
- [x] 10.3 Proteger rotas com middleware de autenticação
- [x] 10.4 Implementar `POST /fixed-expenses`
- [x] 10.5 Implementar `GET /fixed-expenses`
- [x] 10.6 Implementar `PATCH /fixed-expenses/:fixedExpenseId`
- [x] 10.7 Implementar `DELETE /fixed-expenses/:fixedExpenseId`
- [x] 10.8 Registrar rotas em `app.ts`
- [x] 10.9 Mapear erros de domínio para HTTP status correto
- [x] 10.10 Garantir que `userId` vem do token e não do body
- [x] 10.11 Rodar testes de integração de despesas fixas e confirmar que passam

## 11. Testes de integração de despesas variáveis antes da implementação HTTP

- [x] 11.1 Criar `apps/api/tests/integration/expenses/variable-expense.spec.ts`
- [x] 11.2 Testar adição de despesa variável bem-sucedida
- [x] 11.3 Testar tentativa de adicionar despesa variável sem autenticação
- [x] 11.4 Testar tentativa de editar despesa variável de outro usuário
- [x] 11.5 Testar tentativa de remover despesa variável de outro usuário
- [x] 11.6 Testar tentativa de adicionar despesa variável negativa
- [x] 11.7 Testar tentativa de adicionar despesa variável zerada
- [x] 11.8 Testar tentativa de adicionar despesa variável sem campos obrigatórios
- [x] 11.9 Testar tentativa de adicionar despesa variável acima do limite
- [x] 11.10 Testar tentativa de adicionar despesa variável com título muito longo
- [x] 11.11 Testar listagem retornando apenas despesas variáveis do usuário autenticado
- [x] 11.12 Testar atualização de despesa variável própria
- [x] 11.13 Testar remoção de despesa variável própria
- [x] 11.14 Rodar os testes e confirmar que falham antes da implementação HTTP

## 12. Implementação HTTP de despesas variáveis

- [x] 12.1 Criar `variable-expense.controller.ts`
- [x] 12.2 Criar rotas de despesas variáveis
- [x] 12.3 Proteger rotas com middleware de autenticação
- [x] 12.4 Implementar `POST /variable-expenses`
- [x] 12.5 Implementar `GET /variable-expenses?month=YYYY-MM`
- [x] 12.6 Implementar `PATCH /variable-expenses/:variableExpenseId`
- [x] 12.7 Implementar `DELETE /variable-expenses/:variableExpenseId`
- [x] 12.8 Registrar rotas em `app.ts`
- [x] 12.9 Mapear erros de domínio para HTTP status correto
- [x] 12.10 Garantir que `userId` vem do token e não do body
- [x] 12.11 Rodar testes de integração de despesas variáveis e confirmar que passam

## 13. Verificação

- [x] 13.1 Rodar `openspec validate add-expense-management --strict`
- [x] 13.2 Rodar testes unitários de despesas
- [x] 13.3 Rodar testes de integração de despesas
- [x] 13.4 Rodar `pnpm typecheck`
- [x] 13.5 Rodar `pnpm lint`
- [x] 13.6 Rodar `pnpm test`
- [x] 13.7 Rodar `pnpm build`
- [x] 13.8 Testar manualmente criação de despesa fixa
- [x] 13.9 Testar manualmente criação de despesa variável
- [x] 13.10 Testar manualmente atualização de despesa fixa
- [x] 13.11 Testar manualmente atualização de despesa variável
- [x] 13.12 Testar manualmente remoção de despesa fixa
- [x] 13.13 Testar manualmente remoção de despesa variável
- [x] 13.14 Testar manualmente tentativa de alterar despesa de outro usuário
- [x] 13.15 Atualizar tasks concluídas
