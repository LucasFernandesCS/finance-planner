# Tasks: Adicionar Resumo do Dashboard

## 1. Especificação e planejamento

- [x] 1.1 Revisar `proposal.md`
- [x] 1.2 Revisar `design.md`
- [x] 1.3 Revisar `specs/dashboard-summary/spec.md`
- [x] 1.4 Confirmar que dashboard será read-only
- [x] 1.5 Confirmar que não haverá model novo no Prisma
- [x] 1.6 Confirmar que não haverá migration, salvo necessidade descoberta
- [x] 1.7 Confirmar regra de não duplicar pagamentos de dívida
- [x] 1.8 Confirmar uso de `timezone` e `financialMonthStartDay`
- [x] 1.9 Confirmar resposta esperada do endpoint
- [x] 1.10 Validar a change com OpenSpec

## 2. Testes unitários de regras do dashboard antes da implementação

- [x] 2.1 Criar `apps/api/tests/unit/dashboard/dashboard-policy.spec.ts`
- [x] 2.2 Testar cálculo de total de renda
- [x] 2.3 Testar cálculo de total de despesas
- [x] 2.4 Testar cálculo de sobra prevista positiva
- [x] 2.5 Testar cálculo de sobra prevista negativa
- [x] 2.6 Testar cálculo de sobra recorrente
- [x] 2.7 Testar cálculo de percentuais com renda positiva
- [x] 2.8 Testar cálculo de percentuais com renda zerada
- [x] 2.9 Testar cálculo de percentual da reserva
- [x] 2.10 Testar cálculo de percentual do objetivo principal
- [x] 2.11 Testar dívidas abertas excluindo dívidas quitadas
- [x] 2.12 Testar pagamentos de dívida sem contagem duplicada
- [x] 2.13 Testar alerta para sobra negativa
- [x] 2.14 Testar alerta para dívida atrasada
- [x] 2.15 Testar alerta para reserva não configurada
- [x] 2.16 Testar alerta para reserva abaixo da meta
- [x] 2.17 Testar alerta para objetivo principal não definido
- [x] 2.18 Testar alerta para renda não cadastrada
- [x] 2.19 Testar alerta quando despesas fixas superam renda mensal
- [x] 2.20 Testar cálculo do período com `financialMonthStartDay` igual a 1
- [x] 2.21 Testar cálculo do período com `financialMonthStartDay` diferente de 1
- [x] 2.22 Testar rejeição de query `month` inválida
- [x] 2.23 Rodar os testes e confirmar que falham antes da implementação

## 3. Implementação das regras puras

- [x] 3.1 Criar `dashboard-policy.ts`
- [x] 3.2 Implementar cálculo de período
- [x] 3.3 Implementar validação de `month=YYYY-MM`
- [x] 3.4 Implementar cálculo de total de renda
- [x] 3.5 Implementar cálculo de total de despesas
- [x] 3.6 Implementar cálculo de sobra prevista
- [x] 3.7 Implementar cálculo de sobra recorrente
- [x] 3.8 Implementar cálculo de percentuais
- [x] 3.9 Implementar cálculo de resumo de dívidas
- [x] 3.10 Implementar cálculo de percentual da reserva
- [x] 3.11 Implementar cálculo de percentual do objetivo principal
- [x] 3.12 Implementar geração de alertas
- [x] 3.13 Garantir que pagamentos de dívida não sejam duplicados
- [x] 3.14 Rodar testes unitários de policy e confirmar que passam

## 4. Testes unitários do DashboardService antes da implementação

- [x] 4.1 Criar `apps/api/tests/unit/dashboard/dashboard.service.spec.ts`
- [x] 4.2 Mockar `DashboardRepository`
- [x] 4.3 Testar retorno do resumo para usuário autenticado
- [x] 4.4 Testar uso do mês atual quando query `month` não é informada
- [x] 4.5 Testar uso da query `month` quando informada
- [x] 4.6 Testar leitura do perfil para timezone e dia inicial do mês financeiro
- [x] 4.7 Testar fallback quando perfil não existe
- [x] 4.8 Testar agregação de rendas do usuário autenticado
- [x] 4.9 Testar agregação de despesas do usuário autenticado
- [x] 4.10 Testar agregação de dívidas do usuário autenticado
- [x] 4.11 Testar retorno de reserva com meta calculada
- [x] 4.12 Testar `reserveSetupRequired` quando reserva não existe
- [x] 4.13 Testar retorno do objetivo principal do perfil
- [x] 4.14 Testar `primaryGoalSetupRequired` quando objetivo principal não existe
- [x] 4.15 Testar que objetivo principal de outro usuário não é retornado
- [x] 4.16 Testar geração de alertas básicos
- [x] 4.17 Rodar os testes e confirmar que falham antes da implementação

## 5. Implementação do módulo de dashboard

- [x] 5.1 Criar pasta `apps/api/src/modules/dashboard`
- [x] 5.2 Criar `dashboard.errors.ts`
- [x] 5.3 Criar `dashboard.types.ts`
- [x] 5.4 Criar `dashboard.repository.ts`
- [x] 5.5 Criar `dashboard.service.ts`
- [x] 5.6 Implementar leitura do perfil do usuário
- [x] 5.7 Implementar fallback de perfil quando necessário
- [x] 5.8 Implementar agregação de rendas
- [x] 5.9 Implementar agregação de despesas fixas
- [x] 5.10 Implementar agregação de despesas variáveis
- [x] 5.11 Implementar cálculo de pagamentos de dívida
- [x] 5.12 Implementar agregação de dívidas
- [x] 5.13 Implementar leitura da reserva
- [x] 5.14 Implementar meta dinâmica da reserva
- [x] 5.15 Implementar leitura do objetivo principal
- [x] 5.16 Implementar flags de setup
- [x] 5.17 Implementar alertas financeiros
- [x] 5.18 Garantir isolamento por usuário
- [x] 5.19 Rodar testes unitários do service e confirmar que passam

## 6. Testes de integração antes da implementação HTTP

- [x] 6.1 Criar `apps/api/tests/integration/dashboard/dashboard.spec.ts`
- [x] 6.2 Testar `GET /dashboard/summary` com sucesso
- [x] 6.3 Testar `GET /dashboard/summary` sem autenticação retornando 401
- [x] 6.4 Testar retorno apenas de dados do usuário autenticado
- [x] 6.5 Testar `GET /dashboard/summary?month=YYYY-MM`
- [x] 6.6 Testar query `month` inválida retornando 400
- [x] 6.7 Testar soma de rendas mensais e extras
- [x] 6.8 Testar soma de despesas fixas e variáveis
- [x] 6.9 Testar inclusão de pagamento de dívida como despesa variável
- [x] 6.10 Testar que pagamento de dívida não é duplicado no total
- [x] 6.11 Testar retorno de dívidas abertas
- [x] 6.12 Testar que dívidas quitadas não entram em `openDebtBalanceInCents`
- [x] 6.13 Testar quantidade de dívidas atrasadas
- [x] 6.14 Testar reserva configurada com meta calculada
- [x] 6.15 Testar `reserveSetupRequired` quando reserva não existe
- [x] 6.16 Testar objetivo principal configurado
- [x] 6.17 Testar `primaryGoalSetupRequired` quando não há objetivo principal
- [x] 6.18 Testar alerta de sobra negativa
- [x] 6.19 Testar alerta de dívida atrasada
- [x] 6.20 Testar alerta de reserva abaixo da meta
- [x] 6.21 Testar respeito ao `financialMonthStartDay`
- [x] 6.22 Rodar os testes e confirmar que falham antes da implementação HTTP

## 7. Implementação HTTP

- [x] 7.1 Criar `dashboard.controller.ts`
- [x] 7.2 Criar `dashboard.routes.ts`
- [x] 7.3 Proteger rota com middleware de autenticação
- [x] 7.4 Implementar `GET /dashboard/summary`
- [x] 7.5 Validar query `month`
- [x] 7.6 Registrar rotas em `app.ts`
- [x] 7.7 Mapear erros de domínio para HTTP status correto
- [x] 7.8 Garantir que `userId` vem do token e não do body
- [x] 7.9 Garantir que dados de outros usuários não são retornados
- [x] 7.10 Rodar testes de integração e confirmar que passam

## 8. Verificação

- [x] 8.1 Rodar `openspec validate add-dashboard-summary --strict`
- [x] 8.2 Rodar testes unitários de dashboard
- [x] 8.3 Rodar testes de integração de dashboard
- [x] 8.4 Rodar `pnpm typecheck`
- [x] 8.5 Rodar `pnpm lint`
- [x] 8.6 Rodar `pnpm test`
- [x] 8.7 Rodar `pnpm build`
- [x] 8.8 Testar manualmente `GET /dashboard/summary`
- [x] 8.9 Testar manualmente `GET /dashboard/summary?month=YYYY-MM`
- [x] 8.10 Testar manualmente usuário sem reserva
- [x] 8.11 Testar manualmente usuário sem objetivo principal
- [x] 8.12 Testar manualmente usuário com dívida atrasada
- [x] 8.13 Testar manualmente usuário com sobra negativa
- [x] 8.14 Atualizar tasks concluídas
