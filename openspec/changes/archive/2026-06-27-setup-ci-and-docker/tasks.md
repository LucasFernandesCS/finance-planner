# Tasks: Configurar CI e Docker

## 1. Scripts do repositório

- [x] 1.1 Confirmar que o `package.json` raiz possui `typecheck`
- [x] 1.2 Confirmar que o `package.json` raiz possui `lint`
- [x] 1.3 Confirmar que o `package.json` raiz possui `test`
- [x] 1.4 Confirmar que o `package.json` raiz possui `build`
- [x] 1.5 Garantir que os scripts falhem com exit code diferente de zero quando houver erro

## 2. GitHub Actions

- [x] 2.1 Criar `.github/workflows/ci.yml`
- [x] 2.2 Configurar trigger em push para `main`
- [x] 2.3 Configurar trigger em pull request para `main`
- [x] 2.4 Definir permissões do workflow como somente leitura por padrão
- [x] 2.5 Habilitar Corepack
- [x] 2.6 Configurar Node.js
- [x] 2.7 Configurar cache do pnpm
- [x] 2.8 Instalar dependências com lockfile congelado
- [x] 2.9 Rodar typecheck
- [x] 2.10 Rodar lint
- [x] 2.11 Rodar testes
- [x] 2.12 Rodar build

## 3. Docker Compose

- [x] 3.1 Criar `compose.yaml`
- [x] 3.2 Adicionar serviço PostgreSQL
- [x] 3.3 Adicionar volume nomeado para dados do PostgreSQL
- [x] 3.4 Expor PostgreSQL na porta 5432
- [x] 3.5 Documentar fluxo com `docker compose up`

## 4. Dockerfiles

- [x] 4.1 Criar `apps/api/Dockerfile`
- [x] 4.2 Criar `apps/web/Dockerfile`
- [x] 4.3 Criar `.dockerignore`
- [x] 4.4 Confirmar que a imagem Docker da API faz build
- [x] 4.5 Confirmar que a imagem Docker do Web faz build

## 5. Exemplos de ambiente

- [x] 5.1 Criar `apps/api/.env.example`
- [x] 5.2 Criar `apps/web/.env.example`
- [x] 5.3 Documentar variáveis obrigatórias no README

## 6. Verificação

- [x] 6.1 Rodar `pnpm typecheck`
- [x] 6.2 Rodar `pnpm lint`
- [x] 6.3 Rodar `pnpm test`
- [x] 6.4 Rodar `pnpm build`
- [x] 6.5 Rodar `docker compose up`
- [x] 6.6 Confirmar que o container do PostgreSQL inicia
- [x] 6.7 Confirmar que a imagem Docker da API faz build
- [x] 6.8 Confirmar que a imagem Docker do Web faz build
