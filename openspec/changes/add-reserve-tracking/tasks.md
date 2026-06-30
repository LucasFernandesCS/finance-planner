# Tasks: Adicionar Acompanhamento de Reserva de Emergência

## 1. Especificação e planejamento

- [x] 1.1 Revisar `proposal.md`
- [x] 1.2 Revisar `design.md`
- [x] 1.3 Revisar `specs/reserve-tracking/spec.md`
- [x] 1.4 Confirmar reserva única por usuário
- [x] 1.5 Confirmar que meta é calculada dinamicamente
- [x] 1.6 Confirmar que despesas variáveis não entram no cálculo
- [x] 1.7 Confirmar que dívidas não entram diretamente no cálculo da reserva
- [x] 1.8 Confirmar que depósito na reserva não vira despesa variável
- [x] 1.9 Confirmar que conta bancária interna fica fora do escopo
- [x] 1.10 Validar a change com OpenSpec

## 2. Testes unitários de regras de reserva antes da implementação

- [x] 2.1 Criar `apps/api/tests/unit/reserve-tracking/reserve-policy.spec.ts`
- [x] 2.2 Testar cálculo da meta da reserva
- [x] 2.3 Testar cálculo do percentual de conclusão
- [x] 2.4 Testar percentual acima de 100%
- [x] 2.5 Testar meses de proteção válidos
- [x] 2.6 Testar meses de proteção zerados
- [x] 2.7 Testar meses de proteção negativos
- [x] 2.8 Testar despesas fixas zeradas
- [x] 2.9 Testar depósito bem-sucedido
- [x] 2.10 Testar saque bem-sucedido
- [x] 2.11 Testar depósito negativo
- [x] 2.12 Testar depósito zerado
- [x] 2.13 Testar saque negativo
- [x] 2.14 Testar saque zerado
- [x] 2.15 Testar saque maior que saldo atual
- [x] 2.16 Testar transição para `PROTECTED`
- [x] 2.17 Testar transição para `REPLENISHING` após saque
- [x] 2.18 Testar transição para `REPLENISHING` após aumento da meta
- [x] 2.19 Testar transição para `PROTECTED` após redução da meta
- [x] 2.20 Testar permanência em `BUILDING` quando reserva nunca foi protegida
- [x] 2.21 Rodar os testes e confirmar que falham antes da implementação

## 3. Implementação das regras puras

- [x] 3.1 Criar `reserve-policy.ts`
- [x] 3.2 Implementar validação de meses de proteção
- [x] 3.3 Implementar validação de despesas fixas
- [x] 3.4 Implementar cálculo da meta da reserva
- [x] 3.5 Implementar cálculo do percentual de conclusão
- [x] 3.6 Implementar validação de depósito
- [x] 3.7 Implementar validação de saque
- [x] 3.8 Implementar cálculo de novo saldo após depósito
- [x] 3.9 Implementar cálculo de novo saldo após saque
- [x] 3.10 Implementar cálculo de status da reserva
- [x] 3.11 Implementar limite máximo de movimentação
- [x] 3.12 Rodar testes unitários de policy e confirmar que passam

## 4. Modelo de dados

- [x] 4.1 Adicionar enum `ReserveStatus` no Prisma
- [x] 4.2 Adicionar enum `ReserveTransactionType` no Prisma
- [x] 4.3 Adicionar model `EmergencyReserve`
- [x] 4.4 Adicionar model `ReserveTransaction`
- [x] 4.5 Relacionar `EmergencyReserve` com `User`
- [x] 4.6 Relacionar `ReserveTransaction` com `EmergencyReserve`
- [x] 4.7 Relacionar `ReserveTransaction` com `User`
- [x] 4.8 Adicionar `userId` único em `EmergencyReserve`
- [x] 4.9 Adicionar índices por `userId`
- [x] 4.10 Adicionar índices por `status`
- [x] 4.11 Criar migration
- [x] 4.12 Rodar migration localmente
- [x] 4.13 Gerar Prisma Client

## 5. Testes unitários do ReserveTrackingService antes da implementação

- [x] 5.1 Criar `apps/api/tests/unit/reserve-tracking/reserve-tracking.service.spec.ts`
- [x] 5.2 Mockar `ReserveTrackingRepository`
- [x] 5.3 Mockar leitura de despesas fixas
- [x] 5.4 Testar configuração de reserva para usuário autenticado
- [x] 5.5 Testar rejeição de configuração com meses zerados
- [x] 5.6 Testar rejeição de configuração com meses negativos
- [x] 5.7 Testar rejeição de configuração sem despesas fixas
- [x] 5.8 Testar rejeição de configuração duplicada
- [x] 5.9 Testar consulta de reserva com meta calculada
- [x] 5.10 Testar recálculo de meta após aumento de despesas fixas
- [x] 5.11 Testar recálculo de meta após redução de despesas fixas
- [x] 5.12 Testar atualização de meses de proteção
- [x] 5.13 Testar depósito na reserva
- [x] 5.14 Testar soma do depósito ao saldo atual
- [x] 5.15 Testar saque da reserva
- [x] 5.16 Testar subtração do saque do saldo atual
- [x] 5.17 Testar rejeição de saque maior que saldo atual
- [x] 5.18 Testar criação de histórico de movimentação
- [x] 5.19 Testar mudança de status para `PROTECTED`
- [x] 5.20 Testar mudança de status para `REPLENISHING`
- [x] 5.21 Testar isolamento por usuário
- [x] 5.22 Rodar os testes e confirmar que falham antes da implementação

## 6. Implementação do módulo de reserva

- [x] 6.1 Criar pasta `apps/api/src/modules/reserve-tracking`
- [x] 6.2 Criar `reserve-tracking.errors.ts`
- [x] 6.3 Criar `reserve-tracking.types.ts`
- [x] 6.4 Criar `reserve-tracking.schemas.ts`
- [x] 6.5 Criar `reserve-tracking.repository.ts`
- [x] 6.6 Criar `reserve-tracking.service.ts`
- [x] 6.7 Implementar configuração de reserva
- [x] 6.8 Implementar consulta de reserva
- [x] 6.9 Implementar atualização de meses de proteção
- [x] 6.10 Implementar cálculo dinâmico da meta
- [x] 6.11 Implementar cálculo dinâmico do percentual
- [x] 6.12 Implementar depósito na reserva
- [x] 6.13 Implementar saque da reserva
- [x] 6.14 Implementar histórico de movimentações
- [x] 6.15 Implementar atualização automática de status
- [x] 6.16 Implementar recálculo preguiçoso ao consultar reserva
- [x] 6.17 Garantir transação em depósito e saque
- [x] 6.18 Rodar testes unitários do service e confirmar que passam

## 7. Testes de integração antes da implementação HTTP

- [x] 7.1 Criar `apps/api/tests/integration/reserve-tracking/reserve-tracking.spec.ts`
- [x] 7.2 Testar configuração de reserva bem-sucedida
- [x] 7.3 Testar tentativa de configurar reserva sem autenticação
- [x] 7.4 Testar tentativa de configurar reserva com meses zerados
- [x] 7.5 Testar tentativa de configurar reserva com meses negativos
- [x] 7.6 Testar tentativa de configurar reserva sem despesas fixas
- [x] 7.7 Testar consulta de reserva com cálculo de meta
- [x] 7.8 Testar recálculo dinâmico após adicionar nova despesa fixa
- [x] 7.9 Testar recálculo dinâmico após reduzir despesa fixa
- [x] 7.10 Testar recálculo dinâmico após remover despesa fixa
- [x] 7.11 Testar depósito bem-sucedido
- [x] 7.12 Testar depósito somando ao saldo atual
- [x] 7.13 Testar saque bem-sucedido
- [x] 7.14 Testar saque reduzindo saldo atual
- [x] 7.15 Testar tentativa de saque maior que saldo atual
- [x] 7.16 Testar alteração automática para `PROTECTED`
- [x] 7.17 Testar alteração automática para `REPLENISHING` após saque
- [x] 7.18 Testar alteração automática para `REPLENISHING` após aumento de despesas fixas
- [x] 7.19 Testar alteração automática para `PROTECTED` após redução de despesas fixas
- [x] 7.20 Testar listagem de movimentações
- [x] 7.21 Testar isolamento de dados entre usuários
- [x] 7.22 Rodar os testes e confirmar que falham antes da implementação HTTP

## 8. Implementação HTTP

- [x] 8.1 Criar `reserve-tracking.controller.ts`
- [x] 8.2 Criar `reserve-tracking.routes.ts`
- [x] 8.3 Proteger rotas com middleware de autenticação
- [x] 8.4 Implementar `GET /reserve`
- [x] 8.5 Implementar `POST /reserve`
- [x] 8.6 Implementar `PATCH /reserve`
- [x] 8.7 Implementar `POST /reserve/deposits`
- [x] 8.8 Implementar `POST /reserve/withdrawals`
- [x] 8.9 Implementar `GET /reserve/transactions`
- [x] 8.10 Registrar rotas em `app.ts`
- [x] 8.11 Mapear erros de domínio para HTTP status correto
- [x] 8.12 Garantir que `userId` vem do token e não do body
- [x] 8.13 Garantir que depósito e saque usam transação
- [x] 8.14 Rodar testes de integração e confirmar que passam

## 9. Verificação

- [x] 9.1 Rodar `openspec validate add-reserve-tracking --strict`
- [x] 9.2 Rodar testes unitários de reserva
- [x] 9.3 Rodar testes de integração de reserva
- [x] 9.4 Rodar `pnpm typecheck`
- [x] 9.5 Rodar `pnpm lint`
- [x] 9.6 Rodar `pnpm test`
- [x] 9.7 Rodar `pnpm build`
- [x] 9.8 Testar manualmente configuração de reserva
- [x] 9.9 Testar manualmente depósito na reserva
- [x] 9.10 Testar manualmente saque da reserva
- [x] 9.11 Testar manualmente recálculo após alteração de despesa fixa
- [x] 9.12 Testar manualmente tentativa de sacar mais que o saldo
- [x] 9.13 Testar manualmente isolamento entre usuários
- [x] 9.14 Atualizar tasks concluídas
