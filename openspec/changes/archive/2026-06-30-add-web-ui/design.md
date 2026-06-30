# Design: Adicionar Interface Web do MVP

## Visão geral

Esta mudança adiciona a interface web funcional do MVP.

A interface deverá ser simples, clara e integrada à API existente.

O objetivo é permitir que o usuário utilize o sistema financeiro de ponta a ponta pelo navegador.

O frontend deverá consumir os módulos já implementados no backend:

- autenticação
- perfil
- dashboard
- rendas
- despesas
- objetivos
- dívidas
- reserva

A UI deverá priorizar funcionalidade e integração.

## Decisões técnicas

### Stack

O frontend SHALL usar a stack já prevista no projeto:

```txt
React
Vite
TypeScript
```

A estilização poderá usar a solução já configurada no projeto.

Caso o projeto já tenha Tailwind CSS configurado, a UI SHALL usar Tailwind CSS.

### Configuração da API

A URL da API SHALL ser configurada via variável de ambiente:

```txt
VITE_API_URL
```

Exemplo local:

```env
VITE_API_URL=http://localhost:3333
```

Exemplo futuro em produção:

```env
VITE_API_URL=https://sua-api.onrender.com
```

### Client HTTP

O frontend SHALL centralizar chamadas HTTP em um client reutilizável.

Arquivo sugerido:

```txt
apps/web/src/lib/api.ts
```

Responsabilidades:

- adicionar `Content-Type: application/json`
- adicionar token JWT quando existir
- tratar respostas de erro
- retornar JSON parseado
- redirecionar ou limpar sessão quando receber 401

### Token de autenticação

Para o MVP, o token SHALL ser armazenado em:

```txt
localStorage
```

Chave sugerida:

```txt
accessToken
```

O refresh token automático avançado fica fora do escopo.

### Rotas

O frontend SHALL possuir rotas públicas e privadas.

Rotas públicas:

```txt
/login
/register
```

Rotas privadas:

```txt
/dashboard
/incomes
/expenses
/goals
/debts
/reserve
/profile
```

A rota `/` SHALL redirecionar de acordo com o estado de autenticação.

### Proteção de rotas

O frontend SHALL possuir um componente de rota protegida.

Comportamento:

```txt
Se existe accessToken:
  renderizar rota privada

Se não existe accessToken:
  redirecionar para /login
```

### Layout autenticado

As rotas privadas SHALL usar um layout comum.

O layout SHALL conter:

- nome do sistema
- navegação principal
- nome ou displayName do usuário quando disponível
- botão de logout
- área principal de conteúdo

### Navegação principal

A navegação SHALL conter links para:

```txt
Dashboard
Rendas
Despesas
Objetivos
Dívidas
Reserva
Perfil
```

### Tratamento de erro

A UI SHALL exibir mensagens de erro quando a API retornar erro.

Para o MVP, a mensagem pode ser genérica quando não houver mensagem amigável.

Exemplo:

```txt
Não foi possível carregar os dados. Tente novamente.
```

Quando a API retornar `error.code`, a UI MAY mapear códigos conhecidos para mensagens amigáveis.

### Estados de carregamento

A UI SHALL exibir estado de carregamento em telas que dependem da API.

Exemplo:

```txt
Carregando...
```

### Estados vazios

A UI SHALL exibir estados vazios quando não houver dados.

Exemplos:

```txt
Nenhuma renda cadastrada.
Nenhuma despesa cadastrada.
Nenhum objetivo cadastrado.
Nenhuma dívida cadastrada.
Reserva ainda não configurada.
```

## Arquitetura sugerida

Estrutura sugerida:

```txt
apps/web/src/
├── app/
│   ├── App.tsx
│   └── router.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   └── feedback/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── incomes/
│   ├── expenses/
│   ├── goals/
│   ├── debts/
│   ├── reserve/
│   └── profile/
├── lib/
│   ├── api.ts
│   ├── auth-token.ts
│   ├── money.ts
│   └── date.ts
└── main.tsx
```

## Módulos da UI

### Auth

Rotas:

```txt
/login
/register
```

Funcionalidades:

- cadastrar usuário
- fazer login
- salvar token
- redirecionar para dashboard
- exibir erros de autenticação

Endpoints consumidos:

```txt
POST /auth/register
POST /auth/login
```

### Dashboard

Rota:

```txt
/dashboard
```

Endpoint consumido:

```txt
GET /dashboard/summary
```

A tela SHALL exibir cards para:

- renda total
- despesas totais
- sobra prevista
- dívidas abertas
- reserva atual
- objetivo principal
- alertas financeiros

A tela MAY permitir selecionar mês usando query `month=YYYY-MM`.

### Rendas

Rota:

```txt
/incomes
```

Funcionalidades:

- listar rendas
- criar renda
- editar renda
- excluir renda
- filtrar por mês

Endpoints esperados:

```txt
GET /incomes?month=YYYY-MM
POST /incomes
PATCH /incomes/:incomeId
DELETE /incomes/:incomeId
```

Campos principais:

```txt
title
amountInCents
type
referenceMonth
description
```

### Despesas

Rota:

```txt
/expenses
```

A tela SHALL conter duas seções ou abas:

```txt
Despesas fixas
Despesas variáveis
```

Funcionalidades para despesas fixas:

- listar
- criar
- editar
- excluir

Endpoints esperados:

```txt
GET /fixed-expenses
POST /fixed-expenses
PATCH /fixed-expenses/:fixedExpenseId
DELETE /fixed-expenses/:fixedExpenseId
```

Funcionalidades para despesas variáveis:

- listar por mês
- criar
- editar
- excluir

Endpoints esperados:

```txt
GET /variable-expenses?month=YYYY-MM
POST /variable-expenses
PATCH /variable-expenses/:variableExpenseId
DELETE /variable-expenses/:variableExpenseId
```

Campos principais:

```txt
title
amountInCents
category
startMonth
referenceMonth
description
```

### Objetivos

Rota:

```txt
/goals
```

Funcionalidades:

- listar objetivos
- criar objetivo
- editar objetivo
- excluir objetivo
- registrar aporte
- exibir progresso
- exibir status
- definir como objetivo principal

Endpoints esperados:

```txt
GET /goals
POST /goals
GET /goals/:goalId
PATCH /goals/:goalId
DELETE /goals/:goalId
POST /goals/:goalId/contributions
PATCH /me/primary-goal
```

Campos principais:

```txt
title
targetAmountInCents
monthlyAmountInCents
currentAmountInCents
deadlineDate
status
description
```

### Dívidas

Rota:

```txt
/debts
```

Funcionalidades:

- listar dívidas
- criar dívida
- editar dívida
- excluir dívida
- registrar pagamento
- exibir saldo devedor
- exibir status
- exibir credor
- exibir vencimento mensal

Endpoints esperados:

```txt
GET /debts
POST /debts
GET /debts/:debtId
PATCH /debts/:debtId
DELETE /debts/:debtId
POST /debts/:debtId/payments
```

Campos principais:

```txt
title
creditorName
type
status
originalAmountInCents
currentBalanceInCents
installmentAmountInCents
monthlyDueDay
description
```

### Reserva

Rota:

```txt
/reserve
```

Funcionalidades:

- consultar reserva
- configurar reserva
- atualizar meses de proteção
- registrar depósito
- registrar saque
- listar movimentações
- exibir meta calculada
- exibir percentual de conclusão
- exibir status

Endpoints esperados:

```txt
GET /reserve
POST /reserve
PATCH /reserve
POST /reserve/deposits
POST /reserve/withdrawals
GET /reserve/transactions
```

Campos principais:

```txt
protectionMonths
currentBalanceInCents
monthlyFixedExpensesInCents
targetAmountInCents
completionPercentage
status
amountInCents
occurredAt
note
```

### Perfil

Rota:

```txt
/profile
```

Funcionalidades:

- consultar dados do usuário
- atualizar dados básicos
- atualizar preferências financeiras básicas
- visualizar objetivo principal atual

Endpoints esperados:

```txt
GET /me
PATCH /me/profile
PATCH /me/primary-goal
```

Campos principais:

```txt
firstName
lastName
displayName
avatarUrl
currencyCode
locale
timezone
financialMonthStartDay
primaryGoalId
```

## Componentes básicos

A UI SHALL possuir componentes reutilizáveis simples.

Sugestões:

```txt
Button
Input
Select
Textarea
Card
PageHeader
LoadingState
ErrorState
EmptyState
Modal ou Dialog simples
ConfirmDialog
MoneyInput
MonthInput
StatusBadge
```

## Formatação de dinheiro

Valores monetários SHALL ser exibidos em reais.

Internamente, a API trabalha com centavos.

A UI SHALL converter:

```txt
amountInCents / 100
```

Para exibição em formato brasileiro:

```txt
R$ 1.500,00
```

Arquivo sugerido:

```txt
apps/web/src/lib/money.ts
```

## Envio de valores monetários

O frontend SHALL enviar valores monetários para a API em centavos.

Exemplo:

```txt
R$ 1.500,00 → 150000
```

## Datas e meses

O frontend SHALL usar campos adequados para mês e data.

Exemplos:

```txt
month input para YYYY-MM
date input para YYYY-MM-DD
```

A UI SHALL enviar para a API os formatos esperados pelos endpoints existentes.

## Tratamento de status

A UI SHALL exibir status de forma amigável.

Exemplos:

```txt
IN_PROGRESS → Em andamento
OVERDUE → Atrasada
PAID → Quitada
BUILDING → Em construção
PROTECTED → Protegida
REPLENISHING → Em reposição
NOT_STARTED → Não iniciado
ACHIEVED → Atingido
```

## Testes

A change SHALL incluir testes básicos quando a infraestrutura de testes do frontend estiver disponível.

Prioridades de teste:

- renderização de login
- renderização de dashboard
- proteção de rota privada
- client HTTP adiciona token
- logout remove token
- formatação de dinheiro
- conversão de reais para centavos

Se ainda não houver setup de testes no frontend, esta change MAY adicionar setup mínimo ou registrar essa pendência nas tasks.

## Restrições

- Não implementar gráficos avançados.
- Não implementar responsividade refinada.
- Não implementar deploy nesta change.
- Não implementar auditoria.
- Não implementar dashboard familiar.
- Não implementar cookies HTTP-only.
- Não duplicar regras de negócio complexas do backend.
- Não criar mocks permanentes que substituam integração real com API.
