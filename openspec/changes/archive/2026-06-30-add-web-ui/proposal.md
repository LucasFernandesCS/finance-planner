# Proposta: Adicionar Interface Web do MVP

## Intenção

Adicionar a interface web funcional do MVP para o sistema financeiro.

A interface web deverá permitir que o usuário utilize as principais funcionalidades já implementadas no backend através de telas simples, integradas à API e protegidas por autenticação.

O objetivo desta change não é entregar uma interface visualmente finalizada ou altamente refinada. O foco é entregar uma UI funcional para validar o fluxo completo do produto de ponta a ponta.

## Estado atual

O sistema já possui backend para:

- autenticação
- perfil do usuário
- rendas
- despesas fixas
- despesas variáveis
- objetivos financeiros
- dívidas
- reserva de emergência
- resumo do dashboard

Ainda não existe uma interface web funcional para o usuário final interagir com essas funcionalidades.

## Estado desejado

O sistema SHALL permitir que um usuário:

- crie uma conta
- faça login
- acesse uma área autenticada
- visualize o dashboard financeiro
- gerencie rendas
- gerencie despesas fixas
- gerencie despesas variáveis
- gerencie objetivos financeiros
- defina objetivo principal
- registre aportes em objetivos
- gerencie dívidas
- registre pagamentos de dívidas
- configure e acompanhe a reserva de emergência
- registre depósitos e saques da reserva
- visualize e atualize dados básicos do perfil
- faça logout

A interface SHALL consumir a API existente.

A interface SHALL proteger rotas privadas e redirecionar usuários não autenticados para a tela de login.

## Escopo

### Dentro do escopo

- Criar tela de login.
- Criar tela de cadastro.
- Criar layout autenticado.
- Criar navegação principal.
- Criar proteção de rotas autenticadas.
- Criar logout.
- Criar client HTTP para integração com API.
- Criar gerenciamento simples de token no frontend.
- Criar tela de dashboard.
- Criar tela de rendas.
- Criar tela de despesas.
- Criar tela de objetivos.
- Criar tela de dívidas.
- Criar tela de reserva de emergência.
- Criar tela de perfil.
- Criar componentes básicos de formulário.
- Criar componentes básicos de cards.
- Criar componentes básicos de feedback.
- Exibir estados de carregamento.
- Exibir estados de erro.
- Exibir estados vazios.
- Utilizar `VITE_API_URL` para configurar a URL da API.
- Criar testes básicos do frontend quando aplicável.
- Garantir build do frontend.

### Fora do escopo

- Design visual final.
- Tema escuro.
- Animações complexas.
- Responsividade refinada.
- PWA.
- Upload real de imagem.
- Gráficos avançados.
- Exportação CSV.
- Exportação PDF.
- Testes E2E.
- Refresh token automático avançado.
- Cookies HTTP-only.
- Internacionalização completa.
- Acessibilidade avançada.
- Dashboard familiar.
- Permissões avançadas.
- Auditoria visual.
- Deploy de produção.

## Regras principais

A interface SHALL consumir a API existente.

A URL da API SHALL ser configurada por variável de ambiente:

```txt
VITE_API_URL
```

O usuário não autenticado SHALL ser redirecionado para:

```txt
/login
```

O usuário autenticado SHALL acessar as rotas privadas.

O token de acesso SHALL ser armazenado no frontend de forma simples para o MVP.

Para o MVP, o armazenamento poderá ser feito em:

```txt
localStorage
```

A melhoria para cookies HTTP-only SHALL ficar fora desta change.

## Rotas esperadas

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

Rota padrão:

```txt
/
```

A rota `/` SHALL redirecionar para `/dashboard` quando o usuário estiver autenticado.

A rota `/` SHALL redirecionar para `/login` quando o usuário não estiver autenticado.

## Critérios de sucesso

- Usuário consegue se cadastrar pela interface.
- Usuário consegue fazer login pela interface.
- Usuário autenticado é redirecionado para o dashboard.
- Usuário não autenticado não acessa rotas privadas.
- Usuário consegue fazer logout.
- Dashboard consome `GET /dashboard/summary`.
- Tela de rendas permite listar, criar, editar e remover rendas.
- Tela de despesas permite listar, criar, editar e remover despesas fixas e variáveis.
- Tela de objetivos permite listar, criar, editar, remover e aportar em objetivos.
- Tela de objetivos permite definir objetivo principal.
- Tela de dívidas permite listar, criar, editar, remover e pagar dívidas.
- Tela de reserva permite configurar reserva, depositar, sacar e listar movimentações.
- Tela de perfil permite visualizar e atualizar dados básicos.
- Erros da API são exibidos ao usuário.
- Estados de loading são exibidos ao usuário.
- Estados vazios são tratados.
- Build do frontend passa.
- CI continua passando.

## Riscos

- Criar uma UI grande demais e atrasar o MVP.
- Misturar regra de negócio no frontend que já existe no backend.
- Esquecer de proteger rotas privadas.
- Expor dados sensíveis no frontend.
- Não centralizar chamadas HTTP e duplicar lógica.
- Não tratar erro de token expirado.
- Criar formulários complexos demais para a primeira versão.
- Tentar resolver responsividade refinada antes de validar a UI funcional.

## Plano de rollback

Se a funcionalidade causar problemas, reverter a change.

Como a funcionalidade está concentrada no frontend e não deve alterar o banco de dados, o rollback é de baixo risco.
