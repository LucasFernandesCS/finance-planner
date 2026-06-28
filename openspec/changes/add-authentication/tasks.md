# Tasks: Adicionar Autenticação

## 1. Especificação e planejamento

- [x] 1.1 Revisar `proposal.md`
- [x] 1.2 Revisar `design.md`
- [x] 1.3 Revisar `specs/auth/spec.md`
- [x] 1.4 Confirmar estratégia de hash para senha
- [x] 1.5 Confirmar estratégia de hash determinístico para CPF
- [x] 1.6 Confirmar algoritmo de validação matemática de CPF
- [x] 1.7 Validar a change com OpenSpec

## 2. Testes de registro antes da implementação

- [x] 2.1 Criar arquivo `apps/api/tests/integration/auth/register.spec.ts`
- [x] 2.2 Criar teste de registro sucedido
- [x] 2.3 Criar teste de registro com CPF matematicamente inválido
- [x] 2.4 Criar teste de registro com CPF formado por sequência repetida
- [x] 2.5 Criar teste de registro com CPF já existente
- [x] 2.6 Criar teste de registro com e-mail já existente
- [x] 2.7 Criar teste de registro com senha muito simples
- [x] 2.8 Criar teste de registro com senha curta
- [x] 2.9 Rodar os testes e confirmar que falham antes da implementação

## 3. Modelo de dados

- [x] 3.1 Adicionar model `User` no Prisma
- [x] 3.2 Adicionar campo `email` único
- [x] 3.3 Adicionar campo `cpfHash` único
- [x] 3.4 Adicionar campo `passwordHash`
- [x] 3.5 Adicionar model `RefreshToken`
- [x] 3.6 Criar migration
- [x] 3.7 Rodar migration localmente
- [x] 3.8 Gerar Prisma Client

## 4. Utilitários de segurança

- [x] 4.1 Criar utilitário para normalizar CPF
- [x] 4.2 Criar utilitário para validar CPF pelo algoritmo dos dígitos verificadores
- [x] 4.3 Criar utilitário para rejeitar CPF com sequência repetida
- [x] 4.4 Criar utilitário para gerar hash determinístico de CPF
- [x] 4.5 Criar utilitário para gerar hash de senha
- [x] 4.6 Criar utilitário para comparar senha com hash
- [x] 4.7 Criar utilitário para gerar access token
- [x] 4.8 Criar utilitário para gerar refresh token
- [x] 4.9 Criar utilitário para gerar hash do refresh token

## 5. Implementação do registro

- [x] 5.1 Criar `auth.schemas.ts` com schema de registro
- [x] 5.2 Criar `auth.errors.ts` com erros de domínio
- [x] 5.3 Criar `auth.repository.ts`
- [x] 5.4 Implementar busca por e-mail
- [x] 5.5 Implementar busca por CPF hash
- [x] 5.6 Implementar criação de usuário
- [x] 5.7 Criar `auth.service.ts`
- [x] 5.8 Implementar validação de CPF inválido antes da consulta no banco
- [x] 5.9 Implementar erro `INVALID_CPF`
- [x] 5.10 Implementar validação de e-mail duplicado
- [x] 5.11 Implementar validação de CPF duplicado
- [x] 5.12 Implementar validação de senha curta
- [x] 5.13 Implementar validação de senha fraca
- [x] 5.14 Criar `auth.controller.ts`
- [x] 5.15 Criar `auth.routes.ts`
- [x] 5.16 Registrar rotas de auth no `app.ts`
- [x] 5.17 Rodar bateria de testes de registro e confirmar que passa

## 6. Testes de login antes da implementação

- [x] 6.1 Criar arquivo `apps/api/tests/integration/auth/login.spec.ts`
- [x] 6.2 Criar teste de login sucedido com e-mail e senha
- [x] 6.3 Criar teste de login sucedido com CPF e senha
- [x] 6.4 Criar teste de login com e-mail e senha inválidos
- [x] 6.5 Criar teste de login com CPF e senha inválidos
- [x] 6.6 Rodar os testes e confirmar que falham antes da implementação

## 7. Implementação do login

- [x] 7.1 Criar schema de login aceitando e-mail + senha ou CPF + senha
- [x] 7.2 Implementar busca de usuário por e-mail
- [x] 7.3 Implementar normalização e validação de CPF no login
- [x] 7.4 Implementar busca de usuário por CPF hash
- [x] 7.5 Implementar comparação de senha
- [x] 7.6 Implementar geração de access token
- [x] 7.7 Implementar geração de refresh token
- [x] 7.8 Implementar persistência do hash do refresh token
- [x] 7.9 Implementar resposta sem `passwordHash` e sem CPF
- [x] 7.10 Rodar bateria de testes de login e confirmar que passa

## 8. Variáveis de ambiente

- [x] 8.1 Atualizar `apps/api/.env.example` com `JWT_ACCESS_SECRET`
- [x] 8.2 Atualizar `apps/api/.env.example` com `JWT_ACCESS_EXPIRES_IN`
- [x] 8.3 Atualizar `apps/api/.env.example` com `CPF_HASH_SECRET`
- [x] 8.4 Atualizar `apps/api/.env.example` com `REFRESH_TOKEN_HASH_SECRET`
- [x] 8.5 Atualizar `apps/api/.env.example` com `REFRESH_TOKEN_EXPIRES_IN_MINUTES`
- [x] 8.6 Garantir validação de variáveis obrigatórias na inicialização da API

## 9. Verificação

- [x] 9.1 Rodar `openspec validate add-authentication --strict`
- [x] 9.2 Rodar `pnpm typecheck`
- [x] 9.3 Rodar `pnpm lint`
- [x] 9.4 Rodar `pnpm test`
- [x] 9.5 Rodar `pnpm build`
- [x] 9.6 Rodar a API localmente
- [x] 9.7 Testar manualmente `POST /auth/register` com CPF válido
- [x] 9.8 Testar manualmente `POST /auth/register` com CPF inválido
- [x] 9.9 Testar manualmente `POST /auth/login` com e-mail
- [x] 9.10 Testar manualmente `POST /auth/login` com CPF
- [x] 9.11 Confirmar que senha, CPF puro e refresh token hash não aparecem nas respostas
- [x] 9.12 Atualizar tasks concluídas

## Complemento: Testes unitários de autenticação

Esta seção foi adicionada após a primeira aplicação da change.

A implementação inicial já criou parte do fluxo de autenticação e testes de integração. Portanto, esta seção NÃO deve refazer registro, login, rotas, controllers, services, repositories ou migrations já implementados.

O objetivo é apenas adicionar cobertura unitária para regras críticas de autenticação e realizar pequenas refatorações somente se forem necessárias para testabilidade.

### Testes unitários de CPF

- [x] Criar ou complementar `apps/api/tests/unit/shared/cpf.spec.ts`
- [x] Testar normalização de CPF
- [x] Testar CPF matematicamente válido
- [x] Testar CPF matematicamente inválido
- [x] Testar CPF com sequência repetida
- [x] Testar CPF com menos de 11 dígitos
- [x] Testar CPF com mais de 11 dígitos

### Testes unitários de política de senha

- [x] Criar ou complementar `apps/api/tests/unit/auth/password-policy.spec.ts`
- [x] Testar senha curta
- [x] Testar senha sem letra minúscula
- [x] Testar senha sem letra maiúscula
- [x] Testar senha sem caractere especial
- [x] Testar senha forte válida

### Testes unitários de hash determinístico de CPF

- [x] Criar ou complementar `apps/api/tests/unit/shared/cpf-hash.spec.ts`
- [x] Testar que o mesmo CPF normalizado gera o mesmo hash
- [x] Testar que CPF com pontuação e sem pontuação geram o mesmo hash após normalização
- [x] Testar que CPFs diferentes geram hashes diferentes
- [x] Testar que o hash não contém CPF em texto puro

### Testes unitários do AuthService

- [x] Criar ou complementar `apps/api/tests/unit/auth/auth.service.spec.ts`
- [x] Testar registro com dados válidos
- [x] Testar registro com e-mail duplicado
- [x] Testar registro com CPF duplicado
- [x] Testar registro com CPF inválido
- [x] Testar login com e-mail e senha
- [x] Testar login com CPF e senha
- [x] Testar login com usuário inexistente
- [x] Testar login com senha incorreta

### Restrições

- [x] Não refazer testes de integração já existentes
- [x] Não alterar contrato público da API
- [x] Não alterar schema Prisma
- [x] Não alterar rotas públicas
- [x] Não remover testes existentes
- [x] Não alterar comportamento de registro ou login
- [x] Fazer apenas refatorações pequenas necessárias para testabilidade

### Verificação

- [x] Rodar testes unitários
- [x] Rodar testes de integração de auth
- [x] Rodar `pnpm typecheck`
- [x] Rodar `pnpm lint`
- [x] Rodar `pnpm test`
- [x] Rodar `pnpm build`
