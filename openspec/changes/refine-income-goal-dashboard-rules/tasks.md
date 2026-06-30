# Tasks: Refinar Regras de Renda, Objetivos e Dashboard

## 1. Especificação e planejamento

- [x] 1.1 Revisar `proposal.md`
- [x] 1.2 Revisar `design.md`
- [x] 1.3 Revisar specs de incomes
- [x] 1.4 Revisar specs de goals
- [x] 1.5 Revisar specs de dashboard-summary
- [x] 1.6 Revisar impacto na interface web
- [x] 1.7 Confirmar que não haverá migration
- [x] 1.8 Validar a change com OpenSpec

## 2. Renda mensal recorrente

- [x] 2.1 Adicionar teste unitário para renda mensal no mês de referência
- [x] 2.2 Adicionar teste unitário para renda mensal em mês futuro
- [x] 2.3 Adicionar teste unitário para renda extra no mês de referência
- [x] 2.4 Adicionar teste unitário para renda extra não aparecer em mês futuro
- [x] 2.5 Ajustar regra de consulta de rendas por mês
- [x] 2.6 Ajustar repository/service de rendas
- [x] 2.7 Rodar testes de renda

## 3. Dashboard com renda recorrente

- [x] 3.1 Adicionar teste unitário para dashboard com renda mensal recorrente
- [x] 3.2 Adicionar teste unitário para dashboard de mês futuro
- [x] 3.3 Adicionar teste unitário para renda extra não recorrente
- [x] 3.4 Ajustar agregação de rendas do dashboard
- [x] 3.5 Garantir que `monthlyIncomeInCents` considera rendas `MONTHLY` anteriores ou iguais ao mês consultado
- [x] 3.6 Garantir que `extraIncomeInCents` considera apenas rendas `EXTRA` do mês consultado
- [x] 3.7 Rodar testes de dashboard

## 4. Validação de aporte mensal em objetivos

- [x] 4.1 Adicionar teste unitário para aporte mensal sugerido
- [x] 4.2 Adicionar teste unitário rejeitando aporte abaixo do sugerido
- [x] 4.3 Adicionar teste unitário aceitando aporte igual ao sugerido
- [x] 4.4 Adicionar teste unitário aceitando aporte maior que sugerido quando couber na sobra
- [x] 4.5 Adicionar teste unitário rejeitando aporte acima da sobra disponível
- [x] 4.6 Ajustar policy de objetivos
- [x] 4.7 Ajustar service de objetivos
- [x] 4.8 Garantir erro `GOAL_MONTHLY_AMOUNT_TOO_LOW`
- [x] 4.9 Garantir resposta com `suggestedMonthlyAmountInCents`
- [x] 4.10 Rodar testes de objetivos

## 5. Testes de integração de backend

- [x] 5.1 Testar renda mensal criada em junho aparecendo no dashboard de julho
- [x] 5.2 Testar renda extra criada em junho não aparecendo no dashboard de julho
- [x] 5.3 Testar `/incomes?month=2026-07` retornando renda mensal recorrente
- [x] 5.4 Testar objetivo de R$ 15.000 em 6 meses com aporte de R$ 1.250 retornando erro
- [x] 5.5 Testar objetivo de R$ 15.000 em 6 meses com aporte de R$ 2.500 sendo aceito se houver sobra
- [x] 5.6 Testar objetivo com aporte suficiente, mas acima da sobra livre, retornando inviabilidade
- [x] 5.7 Rodar testes de integração

## 6. Ajustes na interface web

- [x] 6.1 Ajustar alertas do dashboard para não exibir códigos técnicos como `RESERVE_BELOW_TARGET`
- [x] 6.2 Exibir apenas mensagem amigável e badge de severidade nos alertas
- [x] 6.3 Ajustar card de dívidas abertas para exibir `Dívidas totais - {quantidade}`
- [x] 6.4 Ajustar card de dívidas abertas para exibir o valor total em aberto abaixo da quantidade
- [x] 6.5 Ajustar formulário de objetivos para calcular aporte mensal sugerido
- [x] 6.6 Exibir aporte mensal sugerido ao usuário ao informar valor alvo e prazo
- [x] 6.7 Bloquear ou destacar aporte mensal abaixo do sugerido no frontend
- [x] 6.8 Exibir erro amigável quando a API retornar `GOAL_MONTHLY_AMOUNT_TOO_LOW`
- [ ] 6.9 Testar manualmente dashboard de junho
- [ ] 6.10 Testar manualmente dashboard de julho
- [ ] 6.11 Testar manualmente criação de objetivo com aporte insuficiente

## 7. Verificação

- [x] 7.1 Rodar `openspec validate refine-income-goal-dashboard-rules --strict`
- [x] 7.2 Rodar testes unitários de renda
- [x] 7.3 Rodar testes unitários de dashboard
- [x] 7.4 Rodar testes unitários de objetivos
- [x] 7.5 Rodar testes de integração relacionados
- [x] 7.6 Rodar `pnpm typecheck`
- [x] 7.7 Rodar `pnpm lint`
- [x] 7.8 Rodar `pnpm test`
- [x] 7.9 Rodar `pnpm build`
- [ ] 7.10 Testar manualmente dashboard de mês futuro
- [ ] 7.11 Testar manualmente criação de objetivo inválido
- [ ] 7.12 Testar manualmente alertas do dashboard
- [ ] 7.13 Testar manualmente card de dívidas abertas
- [x] 7.14 Atualizar tasks concluídas
