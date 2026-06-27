# Tasks: Bootstrap do Projeto

## 1. Workspace

- [x] 1.1 Confirmar que `pnpm-workspace.yaml` inclui `apps/*` e `packages/*`
- [x] 1.2 Adicionar scripts no `package.json` raiz para dev, build, test, lint e typecheck
- [x] 1.3 Adicionar configuração TypeScript base na raiz, se necessário

## 2. Backend API

- [x] 2.1 Criar `apps/api/package.json`
- [x] 2.2 Criar `apps/api/tsconfig.json`
- [x] 2.3 Instalar dependências do Express e TypeScript
- [x] 2.4 Criar `apps/api/src/app.ts`
- [x] 2.5 Criar `apps/api/src/server.ts`
- [x] 2.6 Criar rota `GET /health`
- [x] 2.7 Criar estrutura básica de tratamento de erros compartilhado

## 3. Frontend Web

- [x] 3.1 Criar estrutura React + Vite em `apps/web`
- [x] 3.2 Criar `apps/web/package.json`
- [x] 3.3 Criar `App.tsx` inicial
- [x] 3.4 Garantir que o build do frontend passa

## 4. Pacote Compartilhado

- [x] 4.1 Criar `packages/shared/package.json`
- [x] 4.2 Criar `packages/shared/tsconfig.json`
- [x] 4.3 Criar tipo ou utilitário inicial exportado

## 5. Testes

- [x] 5.1 Configurar test runner
- [x] 5.2 Adicionar teste de integração para `GET /health`
- [x] 5.3 Garantir que o comando de testes passa

## 6. Verificação

- [x] 6.1 Rodar `pnpm install`
- [x] 6.2 Rodar `pnpm typecheck`
- [x] 6.3 Rodar `pnpm test`
- [x] 6.4 Rodar `pnpm build`
- [x] 6.5 Chamar manualmente `GET /health`
