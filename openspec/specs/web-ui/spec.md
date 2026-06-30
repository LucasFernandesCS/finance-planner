# web-ui Specification

## Purpose
TBD - created by archiving change add-web-ui. Update Purpose after archive.
## Requirements
### Requirement: Autenticar usuário pela interface

A interface web SHALL permitir que usuários façam cadastro, login e logout.

#### Scenario: Cadastro bem-sucedido

- GIVEN o usuário acessa a rota `/register`
- AND informa dados válidos
- WHEN o usuário envia o formulário de cadastro
- THEN a interface SHALL enviar uma requisição `POST /auth/register`
- AND a interface SHALL exibir feedback de sucesso ou redirecionar o usuário conforme o fluxo definido

#### Scenario: Login bem-sucedido

- GIVEN o usuário acessa a rota `/login`
- AND informa credenciais válidas
- WHEN o usuário envia o formulário de login
- THEN a interface SHALL enviar uma requisição `POST /auth/login`
- AND a interface SHALL armazenar o `accessToken`
- AND a interface SHALL redirecionar o usuário para `/dashboard`

#### Scenario: Login com credenciais inválidas

- GIVEN o usuário acessa a rota `/login`
- AND informa credenciais inválidas
- WHEN o usuário envia o formulário de login
- THEN a interface SHALL exibir uma mensagem de erro
- AND o usuário SHALL permanecer na tela de login

#### Scenario: Logout

- GIVEN existe um usuário autenticado
- WHEN o usuário clica em sair
- THEN a interface SHALL remover o token salvo
- AND a interface SHALL redirecionar o usuário para `/login`

### Requirement: Proteger rotas privadas

A interface web SHALL impedir o acesso de usuários não autenticados às rotas privadas.

#### Scenario: Usuário autenticado acessa rota privada

- GIVEN existe um `accessToken` salvo
- WHEN o usuário acessa `/dashboard`
- THEN a interface SHALL renderizar a página solicitada

#### Scenario: Usuário não autenticado acessa rota privada

- GIVEN não existe `accessToken` salvo
- WHEN o usuário acessa `/dashboard`
- THEN a interface SHALL redirecionar o usuário para `/login`

#### Scenario: Rota inicial com usuário autenticado

- GIVEN existe um `accessToken` salvo
- WHEN o usuário acessa `/`
- THEN a interface SHALL redirecionar para `/dashboard`

#### Scenario: Rota inicial sem usuário autenticado

- GIVEN não existe `accessToken` salvo
- WHEN o usuário acessa `/`
- THEN a interface SHALL redirecionar para `/login`

### Requirement: Exibir layout autenticado

A interface web SHALL exibir um layout comum para rotas privadas.

#### Scenario: Layout autenticado

- GIVEN existe um usuário autenticado
- WHEN o usuário acessa uma rota privada
- THEN a interface SHALL exibir navegação principal
- AND a interface SHALL exibir área principal de conteúdo
- AND a interface SHALL exibir opção de logout

#### Scenario: Navegação principal

- GIVEN existe um usuário autenticado
- WHEN o layout autenticado é exibido
- THEN a navegação SHALL conter links para Dashboard, Rendas, Despesas, Objetivos, Dívidas, Reserva e Perfil

### Requirement: Exibir dashboard

A interface web SHALL exibir o resumo financeiro do usuário autenticado.

#### Scenario: Dashboard carregado com sucesso

- GIVEN existe um usuário autenticado
- WHEN o usuário acessa `/dashboard`
- THEN a interface SHALL chamar `GET /dashboard/summary`
- AND a interface SHALL exibir renda total
- AND a interface SHALL exibir despesas totais
- AND a interface SHALL exibir sobra prevista
- AND a interface SHALL exibir dívidas abertas
- AND a interface SHALL exibir reserva
- AND a interface SHALL exibir objetivo principal
- AND a interface SHALL exibir alertas financeiros

#### Scenario: Dashboard em carregamento

- GIVEN existe um usuário autenticado
- AND a requisição do dashboard ainda está em andamento
- WHEN o usuário acessa `/dashboard`
- THEN a interface SHALL exibir estado de carregamento

#### Scenario: Erro ao carregar dashboard

- GIVEN existe um usuário autenticado
- AND a API retorna erro ao carregar o dashboard
- WHEN o usuário acessa `/dashboard`
- THEN a interface SHALL exibir estado de erro

### Requirement: Gerenciar rendas

A interface web SHALL permitir que usuários autenticados gerenciem rendas.

#### Scenario: Listagem de rendas

- GIVEN existe um usuário autenticado
- WHEN o usuário acessa `/incomes`
- THEN a interface SHALL chamar `GET /incomes`
- AND a interface SHALL exibir as rendas retornadas

#### Scenario: Criação de renda

- GIVEN existe um usuário autenticado
- AND o usuário informa dados válidos de renda
- WHEN o usuário envia o formulário
- THEN a interface SHALL chamar `POST /incomes`
- AND a lista de rendas SHALL ser atualizada

#### Scenario: Edição de renda

- GIVEN existe um usuário autenticado
- AND existe uma renda cadastrada
- WHEN o usuário edita a renda
- THEN a interface SHALL chamar `PATCH /incomes/:incomeId`
- AND a lista de rendas SHALL refletir a alteração

#### Scenario: Exclusão de renda

- GIVEN existe um usuário autenticado
- AND existe uma renda cadastrada
- WHEN o usuário confirma a exclusão
- THEN a interface SHALL chamar `DELETE /incomes/:incomeId`
- AND a renda SHALL deixar de aparecer na lista

### Requirement: Gerenciar despesas

A interface web SHALL permitir que usuários autenticados gerenciem despesas fixas e variáveis.

#### Scenario: Listagem de despesas fixas

- GIVEN existe um usuário autenticado
- WHEN o usuário acessa `/expenses`
- THEN a interface SHALL exibir a seção de despesas fixas
- AND a interface SHALL listar despesas fixas do usuário

#### Scenario: Criação de despesa fixa

- GIVEN existe um usuário autenticado
- AND o usuário informa dados válidos de despesa fixa
- WHEN o usuário envia o formulário
- THEN a interface SHALL chamar `POST /fixed-expenses`
- AND a lista SHALL ser atualizada

#### Scenario: Listagem de despesas variáveis

- GIVEN existe um usuário autenticado
- WHEN o usuário acessa `/expenses`
- THEN a interface SHALL exibir a seção de despesas variáveis
- AND a interface SHALL listar despesas variáveis do mês selecionado

#### Scenario: Criação de despesa variável

- GIVEN existe um usuário autenticado
- AND o usuário informa dados válidos de despesa variável
- WHEN o usuário envia o formulário
- THEN a interface SHALL chamar `POST /variable-expenses`
- AND a lista SHALL ser atualizada

#### Scenario: Edição de despesa

- GIVEN existe um usuário autenticado
- AND existe uma despesa cadastrada
- WHEN o usuário edita a despesa
- THEN a interface SHALL chamar o endpoint de atualização correspondente
- AND a lista SHALL refletir a alteração

#### Scenario: Exclusão de despesa

- GIVEN existe um usuário autenticado
- AND existe uma despesa cadastrada
- WHEN o usuário confirma a exclusão
- THEN a interface SHALL chamar o endpoint de remoção correspondente
- AND a despesa SHALL deixar de aparecer na lista

### Requirement: Gerenciar objetivos

A interface web SHALL permitir que usuários autenticados gerenciem objetivos financeiros.

#### Scenario: Listagem de objetivos

- GIVEN existe um usuário autenticado
- WHEN o usuário acessa `/goals`
- THEN a interface SHALL chamar `GET /goals`
- AND a interface SHALL exibir os objetivos do usuário

#### Scenario: Criação de objetivo

- GIVEN existe um usuário autenticado
- AND o usuário informa dados válidos de objetivo
- WHEN o usuário envia o formulário
- THEN a interface SHALL chamar `POST /goals`
- AND a lista de objetivos SHALL ser atualizada

#### Scenario: Registro de aporte em objetivo

- GIVEN existe um usuário autenticado
- AND existe um objetivo cadastrado
- WHEN o usuário registra um aporte
- THEN a interface SHALL chamar `POST /goals/:goalId/contributions`
- AND o progresso do objetivo SHALL ser atualizado

#### Scenario: Definir objetivo principal

- GIVEN existe um usuário autenticado
- AND existe um objetivo cadastrado
- WHEN o usuário escolhe definir esse objetivo como principal
- THEN a interface SHALL chamar `PATCH /me/primary-goal`
- AND a interface SHALL exibir feedback de sucesso

### Requirement: Gerenciar dívidas

A interface web SHALL permitir que usuários autenticados gerenciem dívidas.

#### Scenario: Listagem de dívidas

- GIVEN existe um usuário autenticado
- WHEN o usuário acessa `/debts`
- THEN a interface SHALL chamar `GET /debts`
- AND a interface SHALL exibir as dívidas do usuário

#### Scenario: Criação de dívida

- GIVEN existe um usuário autenticado
- AND o usuário informa dados válidos de dívida
- WHEN o usuário envia o formulário
- THEN a interface SHALL chamar `POST /debts`
- AND a lista de dívidas SHALL ser atualizada

#### Scenario: Registro de pagamento de dívida

- GIVEN existe um usuário autenticado
- AND existe uma dívida cadastrada
- WHEN o usuário registra um pagamento
- THEN a interface SHALL chamar `POST /debts/:debtId/payments`
- AND o saldo devedor SHALL ser atualizado na interface

#### Scenario: Erro ao pagar valor maior que saldo

- GIVEN existe um usuário autenticado
- AND existe uma dívida cadastrada
- WHEN o usuário tenta pagar valor maior que o saldo devedor
- THEN a interface SHALL exibir mensagem de erro retornada pela API

### Requirement: Gerenciar reserva de emergência

A interface web SHALL permitir que usuários autenticados configurem e movimentem a reserva de emergência.

#### Scenario: Consulta de reserva configurada

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- WHEN o usuário acessa `/reserve`
- THEN a interface SHALL chamar `GET /reserve`
- AND a interface SHALL exibir saldo atual
- AND a interface SHALL exibir meta calculada
- AND a interface SHALL exibir percentual de conclusão
- AND a interface SHALL exibir status

#### Scenario: Reserva não configurada

- GIVEN existe um usuário autenticado
- AND o usuário ainda não possui reserva configurada
- WHEN o usuário acessa `/reserve`
- THEN a interface SHALL exibir estado de configuração necessária
- AND a interface SHALL permitir configurar meses de proteção

#### Scenario: Configuração de reserva

- GIVEN existe um usuário autenticado
- AND o usuário informa meses de proteção válidos
- WHEN o usuário envia o formulário
- THEN a interface SHALL chamar `POST /reserve`
- AND a interface SHALL exibir a reserva configurada

#### Scenario: Depósito na reserva

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- WHEN o usuário registra um depósito
- THEN a interface SHALL chamar `POST /reserve/deposits`
- AND o saldo atual SHALL ser atualizado

#### Scenario: Saque da reserva

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- WHEN o usuário registra um saque válido
- THEN a interface SHALL chamar `POST /reserve/withdrawals`
- AND o saldo atual SHALL ser atualizado

#### Scenario: Saque maior que saldo

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- WHEN o usuário tenta sacar valor maior que o saldo
- THEN a interface SHALL exibir erro retornado pela API

#### Scenario: Listagem de movimentações

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- WHEN o usuário acessa `/reserve`
- THEN a interface SHALL chamar `GET /reserve/transactions`
- AND a interface SHALL exibir as movimentações da reserva

### Requirement: Gerenciar perfil

A interface web SHALL permitir que usuários autenticados visualizem e atualizem dados básicos do perfil.

#### Scenario: Consulta de perfil

- GIVEN existe um usuário autenticado
- WHEN o usuário acessa `/profile`
- THEN a interface SHALL chamar `GET /me`
- AND a interface SHALL exibir dados do usuário e do perfil

#### Scenario: Atualização de perfil

- GIVEN existe um usuário autenticado
- AND o usuário informa dados válidos de perfil
- WHEN o usuário envia o formulário
- THEN a interface SHALL chamar `PATCH /me/profile`
- AND a interface SHALL exibir os dados atualizados

### Requirement: Tratar estados de interface

A interface web SHALL tratar carregamento, erro e ausência de dados.

#### Scenario: Estado de carregamento

- GIVEN uma tela depende de dados da API
- AND a requisição está em andamento
- WHEN a tela é renderizada
- THEN a interface SHALL exibir estado de carregamento

#### Scenario: Estado de erro

- GIVEN uma tela depende de dados da API
- AND a API retorna erro
- WHEN a tela é renderizada
- THEN a interface SHALL exibir mensagem de erro

#### Scenario: Estado vazio

- GIVEN uma tela lista dados do usuário
- AND a API retorna lista vazia
- WHEN a tela é renderizada
- THEN a interface SHALL exibir mensagem de estado vazio

### Requirement: Formatar valores monetários

A interface web SHALL exibir valores monetários em formato amigável.

#### Scenario: Exibição de valor em reais

- GIVEN a API retorna um valor em centavos
- WHEN a interface exibe esse valor
- THEN o valor SHALL ser formatado como moeda brasileira

#### Scenario: Envio de valor para API

- GIVEN o usuário informa um valor em reais
- WHEN a interface envia o formulário para a API
- THEN o valor SHALL ser convertido para centavos

### Requirement: Exibir alertas do dashboard de forma amigável

A interface web SHALL exibir alertas financeiros de forma amigável, sem expor códigos técnicos ao usuário final.

#### Scenario: Alerta exibido sem código técnico

- GIVEN existe um usuário autenticado
- AND o dashboard retorna um alerta com `type`, `severity` e `message`
- WHEN a interface exibe o alerta
- THEN a interface SHALL exibir a mensagem amigável
- AND a interface SHALL exibir a severidade
- AND a interface SHALL NOT exibir o código técnico do alerta como texto principal ou secundário

### Requirement: Exibir card de dívidas abertas no dashboard

A interface web SHALL exibir o card de dívidas abertas de forma clara.

#### Scenario: Card de dívidas abertas

- GIVEN existe um usuário autenticado
- AND o dashboard retorna `openDebtsCount` igual a `1`
- AND o dashboard retorna `openDebtBalanceInCents` igual a `760000`
- WHEN a interface exibe o card de dívidas abertas
- THEN o card SHALL exibir `Dívidas totais - 1`
- AND o card SHALL exibir `R$ 7.600,00`

### Requirement: Sugerir aporte mensal em objetivos

A interface web SHALL orientar o usuário sobre o aporte mensal mínimo necessário para atingir um objetivo dentro do prazo.

#### Scenario: Formulário exibe aporte mensal sugerido

- GIVEN existe um usuário autenticado
- AND o usuário informa valor alvo e prazo do objetivo
- WHEN a interface calcula o prazo em meses
- THEN a interface SHALL exibir o aporte mensal mínimo sugerido

#### Scenario: Formulário alerta aporte abaixo do sugerido

- GIVEN existe um usuário autenticado
- AND o usuário informa aporte mensal menor que o sugerido
- WHEN o usuário tenta criar o objetivo
- THEN a interface SHALL exibir mensagem indicando que o aporte mensal é insuficiente para o prazo informado

