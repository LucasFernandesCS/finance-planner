# Tasks: Adicionar Gerenciamento de Objetivos Financeiros

## 1. Especificação e planejamento

- [x] 1.1 Revisar `proposal.md`
- [x] 1.2 Revisar `design.md`
- [x] 1.3 Revisar `specs/goals/spec.md`
- [x] 1.4 Confirmar formato monetário em centavos
- [x] 1.5 Confirmar status iniciais do objetivo
- [x] 1.6 Confirmar regra de viabilidade
- [x] 1.7 Confirmar que despesas variáveis ficam fora do cálculo inicial
- [x] 1.8 Confirmar uso do middleware de autenticação existente
- [x] 1.9 Validar a change com OpenSpec

## 2. Testes unitários de cálculo antes da implementação

- [x] 2.1 Criar `apps/api/tests/unit/goals/goal-policy.spec.ts`
- [x] 2.2 Testar cálculo de valor mensal sugerido
- [x] 2.3 Testar cálculo de prazo em meses
- [x] 2.4 Testar cálculo de sobra mensal
- [x] 2.5 Testar validação de viabilidade bem-sucedida
- [x] 2.6 Testar objetivo inviável financeiramente
- [x] 2.7 Testar sugestão de prazo mínimo viável
- [x] 2.8 Testar sugestão de valor máximo possível no prazo atual
- [x] 2.9 Testar valor alvo negativo
- [x] 2.10 Testar valor alvo zerado
- [x] 2.11 Testar valor acima do limite
- [x] 2.12 Testar título muito longo
- [x] 2.13 Testar data limite no passado
- [x] 2.14 Testar data limite hoje
- [x] 2.15 Testar transição inválida para `ACHIEVED`
- [x] 2.16 Rodar os testes e confirmar que falham antes da implementação

## 3. Implementação das regras puras

- [x] 3.1 Criar `goal-policy.ts`
- [x] 3.2 Implementar cálculo de meses até o prazo
- [x] 3.3 Implementar cálculo de valor mensal sugerido
- [x] 3.4 Implementar cálculo de sobra mensal
- [x] 3.5 Implementar cálculo de prazo mínimo viável
- [x] 3.6 Implementar cálculo de valor máximo possível no prazo atual
- [x] 3.7 Implementar validação de valor alvo positivo
- [x] 3.8 Implementar validação de valor mensal positivo
- [x] 3.9 Implementar validação de limite máximo
- [x] 3.10 Implementar validação de título
- [x] 3.11 Implementar validação de data limite
- [x] 3.12 Implementar validação de transição de status
- [x] 3.13 Rodar testes unitários de policy e confirmar que passam

## 4. Modelo de dados

- [x] 4.1 Adicionar enum `GoalStatus` no Prisma
- [x] 4.2 Adicionar model `Goal`
- [x] 4.3 Adicionar model `GoalContribution`
- [x] 4.4 Relacionar `Goal` com `User`
- [x] 4.5 Relacionar `GoalContribution` com `Goal`
- [x] 4.6 Relacionar `GoalContribution` com `User`
- [x] 4.7 Adicionar índices por `userId`
- [x] 4.8 Adicionar índices por `status`
- [x] 4.9 Adicionar índices por `deadlineDate`
- [x] 4.10 Criar migration
- [x] 4.11 Rodar migration localmente
- [x] 4.12 Gerar Prisma Client

## 5. Testes unitários do GoalService antes da implementação

- [x] 5.1 Criar `apps/api/tests/unit/goals/goal.service.spec.ts`
- [x] 5.2 Mockar `GoalRepository`
- [x] 5.3 Testar criação de objetivo viável para usuário autenticado
- [x] 5.4 Testar status inicial `NOT_STARTED`
- [x] 5.5 Testar rejeição de objetivo inviável
- [x] 5.6 Testar rejeição de objetivo para outro usuário
- [x] 5.7 Testar listagem apenas de objetivos do usuário autenticado
- [x] 5.8 Testar cálculo de sobra mensal buscando rendas e despesas fixas no repository
- [x] 5.9 Testar múltiplos objetivos ativos consumindo sobra livre
- [x] 5.10 Testar depósito em objetivo próprio
- [x] 5.11 Testar atualização do valor atual após depósito
- [x] 5.12 Testar criação do histórico de depósito
- [x] 5.13 Testar alteração automática para `IN_PROGRESS`
- [x] 5.14 Testar alteração automática para `ACHIEVED`
- [x] 5.15 Testar rejeição de depósito em objetivo de outro usuário
- [x] 5.16 Testar objetivo não encontrado
- [x] 5.17 Rodar os testes e confirmar que falham antes da implementação

## 6. Implementação do módulo de objetivos

- [x] 6.1 Criar pasta `apps/api/src/modules/goals`
- [x] 6.2 Criar `goal.errors.ts`
- [x] 6.3 Criar `goal.types.ts`
- [x] 6.4 Criar `goal.schemas.ts`
- [x] 6.5 Criar `goal.repository.ts`
- [x] 6.6 Criar `goal.service.ts`
- [x] 6.7 Implementar criação de objetivo
- [x] 6.8 Implementar listagem de objetivos
- [x] 6.9 Implementar busca por objetivo
- [x] 6.10 Implementar atualização de objetivo
- [x] 6.11 Implementar remoção de objetivo
- [x] 6.12 Implementar cálculo de viabilidade usando renda, despesas fixas e objetivos ativos
- [x] 6.13 Implementar depósito em objetivo com transação
- [x] 6.14 Implementar atualização automática de status
- [x] 6.15 Rodar testes unitários do service e confirmar que passam

## 7. Testes de integração antes da implementação HTTP

- [x] 7.1 Criar `apps/api/tests/integration/goals/goal.spec.ts`
- [x] 7.2 Testar criação de objetivo bem-sucedida
- [x] 7.3 Testar cálculo de valor sugerido e prazo
- [x] 7.4 Testar validação de viabilidade bem-sucedida
- [x] 7.5 Testar objetivo inviável financeiramente
- [x] 7.6 Testar valor total negativo
- [x] 7.7 Testar valor total zerado
- [x] 7.8 Testar campos obrigatórios ausentes
- [x] 7.9 Testar data limite no passado
- [x] 7.10 Testar data limite hoje
- [x] 7.11 Testar título muito longo
- [x] 7.12 Testar valor acima do limite
- [x] 7.13 Testar tentativa de adicionar objetivo para outro usuário
- [x] 7.14 Testar listagem de objetivos
- [x] 7.15 Testar listagem apenas de objetivos do usuário autenticado
- [x] 7.16 Testar cálculo dinâmico de sobra mensal usando dados reais do banco
- [x] 7.17 Testar concorrência com múltiplos objetivos ativos
- [x] 7.18 Testar depósito em objetivo
- [x] 7.19 Testar histórico de depósito
- [x] 7.20 Testar atualização do valor atual
- [x] 7.21 Testar mudança automática para `IN_PROGRESS`
- [x] 7.22 Testar mudança automática para `ACHIEVED`
- [x] 7.23 Testar transição inválida de status
- [x] 7.24 Testar depósito em objetivo de outro usuário
- [x] 7.25 Rodar os testes e confirmar que falham antes da implementação HTTP

## 8. Implementação HTTP

- [x] 8.1 Criar `goal.controller.ts`
- [x] 8.2 Criar `goal.routes.ts`
- [x] 8.3 Proteger rotas com middleware de autenticação
- [x] 8.4 Implementar `POST /goals`
- [x] 8.5 Implementar `GET /goals`
- [x] 8.6 Implementar `GET /goals/:goalId`
- [x] 8.7 Implementar `PATCH /goals/:goalId`
- [x] 8.8 Implementar `DELETE /goals/:goalId`
- [x] 8.9 Implementar `POST /goals/:goalId/contributions`
- [x] 8.10 Registrar rotas em `app.ts`
- [x] 8.11 Mapear erros de domínio para HTTP status correto
- [x] 8.12 Garantir que `userId` vem do token e não do body
- [x] 8.13 Rodar testes de integração e confirmar que passam

## 9. Verificação

- [x] 9.1 Rodar `openspec validate add-goal-management --strict`
- [x] 9.2 Rodar testes unitários de objetivos
- [x] 9.3 Rodar testes de integração de objetivos
- [x] 9.4 Rodar `pnpm typecheck`
- [x] 9.5 Rodar `pnpm lint`
- [x] 9.6 Rodar `pnpm test`
- [x] 9.7 Rodar `pnpm build`
- [x] 9.8 Testar manualmente criação de objetivo viável
- [x] 9.9 Testar manualmente objetivo inviável
- [x] 9.10 Testar manualmente listagem de objetivos
- [x] 9.11 Testar manualmente depósito em objetivo
- [x] 9.12 Testar manualmente mudança para `ACHIEVED`
- [x] 9.13 Testar manualmente tentativa de acessar objetivo de outro usuário
- [x] 9.14 Atualizar tasks concluídas
