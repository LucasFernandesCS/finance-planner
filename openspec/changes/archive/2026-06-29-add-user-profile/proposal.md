# Proposta: Adicionar Perfil do Usuário

## Intenção

Adicionar a funcionalidade de perfil do usuário para o MVP.

O perfil deverá permitir que o usuário autenticado visualize seus dados básicos, atualize informações simples de apresentação e configure preferências financeiras mínimas que serão usadas futuramente no dashboard.

Essa change não tem como objetivo implementar todas as configurações possíveis de uma conta. O foco é entregar somente o necessário para o MVP e preparar a base para o dashboard funcional.

## Estado atual

O sistema já possui:

- autenticação
- cadastro e login
- gerenciamento de rendas
- gerenciamento de despesas
- gerenciamento de objetivos financeiros

O usuário já possui dados básicos no model `User`, como nome, sobrenome e e-mail.

Ainda não existe uma camada específica de perfil com preferências financeiras do usuário.

## Estado desejado

O sistema SHALL permitir que um usuário autenticado:

- visualize seus próprios dados através de `GET /me`
- atualize dados básicos editáveis do perfil
- configure preferências financeiras mínimas
- defina um objetivo financeiro principal
- remova o objetivo financeiro principal
- acesse apenas o próprio perfil

O sistema SHALL impedir que um usuário acesse ou altere dados de outro usuário.

## Escopo

### Dentro do escopo

- Criar model `UserProfile`.
- Relacionar `UserProfile` com `User`.
- Criar perfil automaticamente quando necessário.
- Criar endpoint `GET /me`.
- Criar endpoint `PATCH /me/profile`.
- Criar endpoint `PATCH /me/primary-goal`.
- Permitir atualização de `firstName` e `lastName`.
- Permitir atualização de `displayName`.
- Permitir atualização de `avatarUrl`.
- Permitir configuração de `currencyCode`.
- Permitir configuração de `locale`.
- Permitir configuração de `timezone`.
- Permitir configuração de `financialMonthStartDay`.
- Permitir definição de `primaryGoalId`.
- Validar que `primaryGoalId` pertence ao usuário autenticado.
- Garantir que dados sensíveis não sejam retornados.
- Criar testes unitários.
- Criar testes de integração.

### Fora do escopo

- Alteração de e-mail.
- Alteração de senha.
- Alteração de CPF.
- Exclusão de conta.
- Upload real de imagem.
- Preferências de notificação.
- Preferências de tema.
- Endereço.
- Telefone.
- Data de nascimento.
- Grupos familiares.
- Permissões.
- Auditoria de alterações de perfil.
- Frontend.

## Regras principais

O usuário autenticado SHALL acessar apenas o próprio perfil.

O sistema SHALL criar um `UserProfile` automaticamente caso ele ainda não exista.

O endpoint `GET /me` SHALL retornar dados públicos e seguros do usuário.

A resposta SHALL NOT retornar:

```txt
passwordHash
cpfHash
refreshTokenHash
```

O `primaryGoalId`, quando informado, SHALL pertencer ao usuário autenticado.

O `primaryGoalId` SHALL poder ser `null`, permitindo remover o objetivo principal.

## Critérios de sucesso

- Usuário autenticado consegue consultar o próprio perfil.
- Usuário autenticado consegue atualizar nome e sobrenome.
- Usuário autenticado consegue atualizar preferências financeiras básicas.
- Usuário autenticado consegue definir objetivo principal.
- Usuário autenticado consegue remover objetivo principal.
- Sistema rejeita objetivo principal pertencente a outro usuário.
- Sistema rejeita objetivo principal inexistente.
- Sistema rejeita `financialMonthStartDay` inválido.
- Sistema rejeita `displayName` muito longo.
- Sistema rejeita `avatarUrl` inválida.
- Sistema não retorna dados sensíveis.
- Testes unitários passam.
- Testes de integração passam.
- CI continua passando.

## Riscos

- Retornar dados sensíveis por acidente no endpoint `GET /me`.
- Permitir que usuário defina como principal um objetivo de outro usuário.
- Deixar o dashboard sem objetivo principal por ausência de configuração.
- Criar regras demais no perfil e aumentar o escopo do MVP.

## Plano de rollback

Se a funcionalidade causar problemas, reverter a change e remover a migration relacionada ao model `UserProfile`.

Como a funcionalidade é nova, o rollback é de baixo risco enquanto não houver dados reais de produção.
