# Tasks: Adicionar Gerenciamento de Dívidas

## 1. Especificação e planejamento

- [x] 1.1 Revisar `proposal.md`
- [x] 1.2 Revisar `design.md`
- [x] 1.3 Revisar `specs/debts/spec.md`
- [x] 1.4 Confirmar status de dívida
- [x] 1.5 Confirmar tipos de dívida
- [x] 1.6 Confirmar que pagamento gera despesa variável reflexa
- [x] 1.7 Confirmar que conta bancária interna fica fora do escopo
- [x] 1.8 Confirmar estratégia preguiçosa para marcar atraso
- [x] 1.9 Validar a change com OpenSpec

## 2. Testes unitários de regras de dívida antes da implementação

- [x] 2.1 Criar `apps/api/tests/unit/debts/debt-policy.spec.ts`
- [x] 2.2 Testar criação de dívida válida
- [x] 2.3 Testar dívida com valor negativo
- [x] 2.4 Testar dívida com valor zerado
- [x] 2.5 Testar dívida com valor acima do limite
- [x] 2.6 Testar título muito longo
- [x] 2.7 Testar credor muito longo
- [x] 2.8 Testar tipo inválido
- [x] 2.9 Testar vencimento menor que 1
- [x] 2.10 Testar vencimento maior que 28
- [x] 2.11 Testar amortização bem-sucedida
- [x] 2.12 Testar pagamento negativo
- [x] 2.13 Testar pagamento zerado
- [x] 2.14 Testar pagamento maior que saldo devedor
- [x] 2.15 Testar status `PAID` quando saldo chega a zero
- [x] 2.16 Testar status `OVERDUE` quando vencimento passou e não houve pagamento no mês
- [x] 2.17 Testar status `IN_PROGRESS` quando pagamento regular é feito
- [x] 2.18 Rodar os testes e confirmar que falham antes da implementação

## 3. Implementação das regras puras

- [x] 3.1 Criar `debt-policy.ts`
- [x] 3.2 Implementar validação de valor da dívida
- [x] 3.3 Implementar validação de limite máximo
- [x] 3.4 Implementar validação de título
- [x] 3.5 Implementar validação de credor
- [x] 3.6 Implementar validação de tipo
- [x] 3.7 Implementar validação de dia de vencimento
- [x] 3.8 Implementar validação de pagamento
- [x] 3.9 Implementar cálculo de amortização
- [x] 3.10 Implementar cálculo de status após pagamento
- [x] 3.11 Implementar cálculo de atraso mensal
- [x] 3.12 Rodar testes unitários de policy e confirmar que passam

## 4. Modelo de dados

- [x] 4.1 Adicionar enum `DebtStatus` no Prisma
- [x] 4.2 Adicionar enum `DebtType` no Prisma
- [x] 4.3 Adicionar categoria `DEBT_PAYMENT` no enum `ExpenseCategory`
- [x] 4.4 Adicionar model `Debt`
- [x] 4.5 Adicionar model `DebtPayment`
- [x] 4.6 Relacionar `Debt` com `User`
- [x] 4.7 Relacionar `DebtPayment` com `Debt`
- [x] 4.8 Relacionar `DebtPayment` com `User`
- [x] 4.9 Adicionar índices por `userId`
- [x] 4.10 Adicionar índices por `status`
- [x] 4.11 Adicionar índices por `type`
- [x] 4.12 Criar migration
- [x] 4.13 Rodar migration localmente
- [x] 4.14 Gerar Prisma Client

## 5. Testes unitários do DebtService antes da implementação

- [x] 5.1 Criar `apps/api/tests/unit/debts/debt.service.spec.ts`
- [x] 5.2 Mockar `DebtRepository`
- [x] 5.3 Mockar criação de despesa variável reflexa
- [x] 5.4 Testar criação de dívida para usuário autenticado
- [x] 5.5 Testar listagem apenas de dívidas do usuário autenticado
- [x] 5.6 Testar atualização de dívida própria
- [x] 5.7 Testar remoção de dívida própria
- [x] 5.8 Testar rejeição de atualização de dívida de outro usuário
- [x] 5.9 Testar rejeição de remoção de dívida de outro usuário
- [x] 5.10 Testar pagamento em dívida própria
- [x] 5.11 Testar redução de saldo devedor após pagamento
- [x] 5.12 Testar criação de histórico de pagamento
- [x] 5.13 Testar criação de despesa variável reflexa
- [x] 5.14 Testar alteração automática para `PAID`
- [x] 5.15 Testar alteração automática para `OVERDUE`
- [x] 5.16 Testar rejeição de pagamento maior que saldo devedor
- [x] 5.17 Testar rejeição de pagamento em dívida de outro usuário
- [x] 5.18 Testar rejeição de pagamento em dívida quitada
- [x] 5.19 Rodar os testes e confirmar que falham antes da implementação

## 6. Implementação do módulo de dívidas

- [x] 6.1 Criar pasta `apps/api/src/modules/debts`
- [x] 6.2 Criar `debt.errors.ts`
- [x] 6.3 Criar `debt.types.ts`
- [x] 6.4 Criar `debt.schemas.ts`
- [x] 6.5 Criar `debt.repository.ts`
- [x] 6.6 Criar `debt.service.ts`
- [x] 6.7 Implementar criação de dívida
- [x] 6.8 Implementar listagem de dívidas
- [x] 6.9 Implementar busca de dívida
- [x] 6.10 Implementar atualização de dívida
- [x] 6.11 Implementar remoção de dívida
- [x] 6.12 Implementar pagamento de dívida
- [x] 6.13 Implementar redução de saldo devedor
- [x] 6.14 Implementar criação de histórico de pagamento
- [x] 6.15 Implementar criação de despesa variável reflexa
- [x] 6.16 Implementar atualização automática de status
- [x] 6.17 Implementar marcação preguiçosa de atraso
- [x] 6.18 Rodar testes unitários do service e confirmar que passam

## 7. Testes de integração antes da implementação HTTP

- [x] 7.1 Criar `apps/api/tests/integration/debts/debt.spec.ts`
- [x] 7.2 Testar criação de dívida bem-sucedida
- [x] 7.3 Testar tentativa de criar dívida sem autenticação
- [x] 7.4 Testar tentativa de criar dívida com valor negativo
- [x] 7.5 Testar tentativa de criar dívida com valor zerado
- [x] 7.6 Testar tentativa de criar dívida sem campos obrigatórios
- [x] 7.7 Testar tentativa de criar dívida com valor acima do limite
- [x] 7.8 Testar tentativa de criar dívida com título muito longo
- [x] 7.9 Testar listagem retornando apenas dívidas do usuário autenticado
- [x] 7.10 Testar atualização de dívida própria
- [x] 7.11 Testar tentativa de atualizar dívida de outro usuário
- [x] 7.12 Testar remoção de dívida própria
- [x] 7.13 Testar tentativa de remover dívida de outro usuário
- [x] 7.14 Testar pagamento de dívida bem-sucedido
- [x] 7.15 Testar pagamento reduzindo saldo devedor
- [x] 7.16 Testar pagamento criando histórico em `DebtPayment`
- [x] 7.17 Testar pagamento criando despesa variável reflexa
- [x] 7.18 Testar tentativa de pagamento maior que saldo devedor
- [x] 7.19 Testar tentativa de pagamento em dívida de outro usuário
- [x] 7.20 Testar alteração automática para `PAID`
- [x] 7.21 Testar alteração automática para `OVERDUE`
- [x] 7.22 Rodar os testes e confirmar que falham antes da implementação HTTP

## 8. Implementação HTTP

- [x] 8.1 Criar `debt.controller.ts`
- [x] 8.2 Criar `debt.routes.ts`
- [x] 8.3 Proteger rotas com middleware de autenticação
- [x] 8.4 Implementar `POST /debts`
- [x] 8.5 Implementar `GET /debts`
- [x] 8.6 Implementar `GET /debts/:debtId`
- [x] 8.7 Implementar `PATCH /debts/:debtId`
- [x] 8.8 Implementar `DELETE /debts/:debtId`
- [x] 8.9 Implementar `POST /debts/:debtId/payments`
- [x] 8.10 Registrar rotas em `app.ts`
- [x] 8.11 Mapear erros de domínio para HTTP status correto
- [x] 8.12 Garantir que `userId` vem do token e não do body
- [x] 8.13 Garantir que pagamento usa transação
- [x] 8.14 Rodar testes de integração e confirmar que passam

## 9. Verificação

- [x] 9.1 Rodar `openspec validate add-debt-management --strict`
- [x] 9.2 Rodar testes unitários de dívidas
- [x] 9.3 Rodar testes de integração de dívidas
- [x] 9.4 Rodar `pnpm typecheck`
- [x] 9.5 Rodar `pnpm lint`
- [x] 9.6 Rodar `pnpm test`
- [x] 9.7 Rodar `pnpm build`
- [x] 9.8 Testar manualmente criação de dívida
- [x] 9.9 Testar manualmente pagamento de dívida
- [x] 9.10 Testar manualmente quitação automática
- [x] 9.11 Testar manualmente criação de despesa variável reflexa
- [x] 9.12 Testar manualmente tentativa de pagar dívida de outro usuário
- [x] 9.13 Atualizar tasks concluídas
