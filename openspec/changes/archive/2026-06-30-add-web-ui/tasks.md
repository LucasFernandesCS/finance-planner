# Tasks: Adicionar Interface Web do MVP

## 1. Especificação e planejamento

- [x] 1.1 Revisar `proposal.md`
- [x] 1.2 Revisar `design.md`
- [x] 1.3 Revisar `specs/web-ui/spec.md`
- [x] 1.4 Confirmar escopo funcional do MVP
- [x] 1.5 Confirmar que responsividade refinada fica fora desta change
- [x] 1.6 Confirmar que deploy fica fora desta change
- [x] 1.7 Confirmar rotas públicas e privadas
- [x] 1.8 Confirmar endpoints existentes no backend
- [x] 1.9 Validar a change com OpenSpec

## 2. Base do frontend

- [x] 2.1 Revisar estrutura atual de `apps/web`
- [x] 2.2 Confirmar Vite + React + TypeScript
- [x] 2.3 Confirmar configuração de estilos
- [x] 2.4 Criar ou ajustar `VITE_API_URL`
- [x] 2.5 Criar `apps/web/src/lib/api.ts`
- [x] 2.6 Criar `apps/web/src/lib/auth-token.ts`
- [x] 2.7 Criar `apps/web/src/lib/money.ts`
- [x] 2.8 Criar `apps/web/src/lib/date.ts`
- [x] 2.9 Garantir build inicial do frontend

## 3. Roteamento e autenticação

- [x] 3.1 Criar configuração de rotas
- [x] 3.2 Criar rotas públicas `/login` e `/register`
- [x] 3.3 Criar rotas privadas
- [x] 3.4 Criar componente de rota protegida
- [x] 3.5 Criar fluxo de redirecionamento para usuário não autenticado
- [x] 3.6 Criar fluxo de redirecionamento para usuário autenticado
- [x] 3.7 Implementar logout
- [x] 3.8 Garantir que logout remove token do frontend

## 4. Layout autenticado

- [x] 4.1 Criar layout principal autenticado
- [x] 4.2 Criar navegação principal
- [x] 4.3 Adicionar link para Dashboard
- [x] 4.4 Adicionar link para Rendas
- [x] 4.5 Adicionar link para Despesas
- [x] 4.6 Adicionar link para Objetivos
- [x] 4.7 Adicionar link para Dívidas
- [x] 4.8 Adicionar link para Reserva
- [x] 4.9 Adicionar link para Perfil
- [x] 4.10 Adicionar botão de sair
- [x] 4.11 Criar área principal de conteúdo

## 5. Componentes básicos

- [x] 5.1 Criar componente `Button`
- [x] 5.2 Criar componente `Input`
- [x] 5.3 Criar componente `Select`
- [x] 5.4 Criar componente `Textarea`
- [x] 5.5 Criar componente `Card`
- [x] 5.6 Criar componente `PageHeader`
- [x] 5.7 Criar componente `LoadingState`
- [x] 5.8 Criar componente `ErrorState`
- [x] 5.9 Criar componente `EmptyState`
- [x] 5.10 Criar componente `StatusBadge`
- [x] 5.11 Criar componente simples de confirmação de exclusão

## 6. Tela de cadastro

- [x] 6.1 Criar página `/register`
- [x] 6.2 Criar formulário de cadastro
- [x] 6.3 Integrar com `POST /auth/register`
- [x] 6.4 Exibir erros de validação
- [x] 6.5 Redirecionar para login ou dashboard após sucesso
- [ ] 6.6 Testar cadastro manualmente

## 7. Tela de login

- [x] 7.1 Criar página `/login`
- [x] 7.2 Criar formulário de login
- [x] 7.3 Integrar com `POST /auth/login`
- [x] 7.4 Salvar `accessToken`
- [x] 7.5 Redirecionar para `/dashboard` após sucesso
- [x] 7.6 Exibir erro de credenciais inválidas
- [ ] 7.7 Testar login manualmente

## 8. Dashboard

- [x] 8.1 Criar página `/dashboard`
- [x] 8.2 Integrar com `GET /dashboard/summary`
- [x] 8.3 Exibir card de renda total
- [x] 8.4 Exibir card de despesas totais
- [x] 8.5 Exibir card de sobra prevista
- [x] 8.6 Exibir card de dívidas abertas
- [x] 8.7 Exibir card de reserva
- [x] 8.8 Exibir card de objetivo principal
- [x] 8.9 Exibir alertas financeiros
- [x] 8.10 Exibir estado de loading
- [x] 8.11 Exibir estado de erro
- [x] 8.12 Exibir estado quando reserva não estiver configurada
- [x] 8.13 Exibir estado quando objetivo principal não estiver definido

## 9. Rendas

- [x] 9.1 Criar página `/incomes`
- [x] 9.2 Integrar listagem com `GET /incomes?month=YYYY-MM`
- [x] 9.3 Criar formulário de renda
- [x] 9.4 Integrar criação com `POST /incomes`
- [x] 9.5 Integrar edição com `PATCH /incomes/:incomeId`
- [x] 9.6 Integrar exclusão com `DELETE /incomes/:incomeId`
- [x] 9.7 Permitir selecionar tipo `MONTHLY` ou `EXTRA`
- [x] 9.8 Permitir filtrar por mês
- [x] 9.9 Exibir estado vazio
- [x] 9.10 Exibir erros da API

## 10. Despesas

- [x] 10.1 Criar página `/expenses`
- [x] 10.2 Criar seção ou aba de despesas fixas
- [x] 10.3 Criar seção ou aba de despesas variáveis
- [x] 10.4 Integrar listagem de despesas fixas
- [x] 10.5 Integrar criação de despesa fixa
- [x] 10.6 Integrar edição de despesa fixa
- [x] 10.7 Integrar exclusão de despesa fixa
- [x] 10.8 Integrar listagem de despesas variáveis por mês
- [x] 10.9 Integrar criação de despesa variável
- [x] 10.10 Integrar edição de despesa variável
- [x] 10.11 Integrar exclusão de despesa variável
- [x] 10.12 Exibir categorias disponíveis
- [x] 10.13 Exibir estados vazios
- [x] 10.14 Exibir erros da API

## 11. Objetivos

- [x] 11.1 Criar página `/goals`
- [x] 11.2 Integrar listagem com `GET /goals`
- [x] 11.3 Criar formulário de objetivo
- [x] 11.4 Integrar criação com `POST /goals`
- [x] 11.5 Integrar edição com `PATCH /goals/:goalId`
- [x] 11.6 Integrar exclusão com `DELETE /goals/:goalId`
- [x] 11.7 Criar formulário de aporte
- [x] 11.8 Integrar aporte com `POST /goals/:goalId/contributions`
- [x] 11.9 Exibir progresso do objetivo
- [x] 11.10 Exibir status do objetivo
- [x] 11.11 Integrar botão de definir objetivo principal com `PATCH /me/primary-goal`
- [x] 11.12 Exibir erros de objetivo inviável
- [x] 11.13 Exibir estado vazio

## 12. Dívidas

- [x] 12.1 Criar página `/debts`
- [x] 12.2 Integrar listagem com `GET /debts`
- [x] 12.3 Criar formulário de dívida
- [x] 12.4 Integrar criação com `POST /debts`
- [x] 12.5 Integrar edição com `PATCH /debts/:debtId`
- [x] 12.6 Integrar exclusão com `DELETE /debts/:debtId`
- [x] 12.7 Criar formulário de pagamento
- [x] 12.8 Integrar pagamento com `POST /debts/:debtId/payments`
- [x] 12.9 Exibir saldo devedor
- [x] 12.10 Exibir valor original
- [x] 12.11 Exibir credor
- [x] 12.12 Exibir vencimento mensal
- [x] 12.13 Exibir status da dívida
- [x] 12.14 Exibir erro de pagamento maior que saldo
- [x] 12.15 Exibir estado vazio

## 13. Reserva

- [x] 13.1 Criar página `/reserve`
- [x] 13.2 Integrar consulta com `GET /reserve`
- [x] 13.3 Exibir estado de reserva não configurada
- [x] 13.4 Criar formulário de configuração
- [x] 13.5 Integrar configuração com `POST /reserve`
- [x] 13.6 Integrar atualização de meses com `PATCH /reserve`
- [x] 13.7 Criar formulário de depósito
- [x] 13.8 Integrar depósito com `POST /reserve/deposits`
- [x] 13.9 Criar formulário de saque
- [x] 13.10 Integrar saque com `POST /reserve/withdrawals`
- [x] 13.11 Integrar movimentações com `GET /reserve/transactions`
- [x] 13.12 Exibir saldo atual
- [x] 13.13 Exibir meta calculada
- [x] 13.14 Exibir percentual de conclusão
- [x] 13.15 Exibir status da reserva
- [x] 13.16 Exibir erro de saque maior que saldo

## 14. Perfil

- [x] 14.1 Criar página `/profile`
- [x] 14.2 Integrar consulta com `GET /me`
- [x] 14.3 Criar formulário de atualização de perfil
- [x] 14.4 Integrar atualização com `PATCH /me/profile`
- [x] 14.5 Exibir dados do usuário
- [x] 14.6 Exibir preferências financeiras
- [x] 14.7 Exibir objetivo principal atual quando existir
- [x] 14.8 Exibir erros de validação

## 15. Tratamento de erros e feedback

- [x] 15.1 Padronizar mensagens de erro
- [x] 15.2 Padronizar estados de loading
- [x] 15.3 Padronizar estados vazios
- [x] 15.4 Tratar 401 limpando sessão
- [x] 15.5 Tratar falha de conexão com API
- [x] 15.6 Exibir confirmação em ações destrutivas
- [x] 15.7 Exibir feedback após criação, edição e exclusão

## 16. Testes e validações

- [x] 16.1 Rodar `pnpm typecheck`
- [x] 16.2 Rodar `pnpm lint`
- [x] 16.3 Rodar `pnpm test`
- [x] 16.4 Rodar `pnpm build`
- [ ] 16.5 Testar cadastro manualmente
- [ ] 16.6 Testar login manualmente
- [ ] 16.7 Testar dashboard manualmente
- [ ] 16.8 Testar CRUD de rendas manualmente
- [ ] 16.9 Testar CRUD de despesas manualmente
- [ ] 16.10 Testar objetivos e aportes manualmente
- [ ] 16.11 Testar dívidas e pagamentos manualmente
- [ ] 16.12 Testar reserva manualmente
- [ ] 16.13 Testar perfil manualmente
- [x] 16.14 Validar OpenSpec

## 17. Verificação final

- [x] 17.1 Rodar `openspec validate add-web-ui --strict`
- [x] 17.2 Rodar `pnpm typecheck`
- [x] 17.3 Rodar `pnpm lint`
- [x] 17.4 Rodar `pnpm test`
- [x] 17.5 Rodar `pnpm build`
- [x] 17.6 Conferir que `.env` não será commitado
- [x] 17.7 Conferir que `VITE_API_URL` está documentado em `.env.example`
- [x] 17.8 Atualizar tasks concluídas

## Ajustes de usabilidade identificados após teste visual

- [ ] Ajustar alertas do dashboard para não exibir códigos técnicos como `RESERVE_BELOW_TARGET`
- [ ] Exibir apenas mensagem amigável e badge de severidade nos alertas
- [ ] Ajustar card de dívidas abertas para exibir `Dívidas totais - {quantidade}`
- [ ] Ajustar card de dívidas abertas para exibir o valor total em aberto abaixo da quantidade
- [ ] Ajustar formulário de objetivos para calcular aporte mensal sugerido
- [ ] Exibir aporte mensal sugerido ao usuário ao informar valor alvo e prazo
- [ ] Bloquear ou destacar aporte mensal abaixo do sugerido no frontend
- [ ] Exibir erro amigável quando a API retornar `GOAL_MONTHLY_AMOUNT_TOO_LOW`
