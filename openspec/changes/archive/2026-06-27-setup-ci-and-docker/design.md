# Design: Configurar CI e Docker

## Visão geral

Esta mudança adiciona validação automatizada de qualidade e infraestrutura local reproduzível.

O projeto usará:

- GitHub Actions para CI
- Docker Compose para serviços locais
- PostgreSQL como serviço de banco local
- Dockerfiles para API e Web
- arquivos `.env.example` para documentação de ambiente

O workflow de CI deve validar cada push e pull request direcionado para `main`.

## Arquitetura

Fluxo do CI:

```txt
Checkout repository
→ Enable Corepack
→ Setup Node
→ Install dependencies
→ Typecheck
→ Lint
→ Test
→ Build
```

Fluxo local com Docker:

```txt
docker compose up
→ postgres inicia
→ api consegue conectar no postgres
→ web consegue conectar na api
```

## Áreas afetadas

- `.github/workflows/ci.yml` — validação automatizada.
- `compose.yaml` — serviços locais com Docker.
- `.dockerignore` — otimização do contexto de build Docker.
- `apps/api/Dockerfile` — build do container da API.
- `apps/web/Dockerfile` — build do container do Web.
- `apps/api/.env.example` — variáveis de ambiente da API.
- `apps/web/.env.example` — variáveis de ambiente do Web.
- `README.md` — instruções de setup.
- `package.json` — scripts da raiz, se necessário.

## Design do GitHub Actions

O workflow de CI deve rodar em:

```yaml
on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]
```

O workflow deve usar permissões somente de leitura por padrão:

```yaml
permissions:
  contents: read
```

O workflow deve executar:

```txt
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Design do Docker Compose

A configuração inicial do Compose SHALL incluir PostgreSQL.

Exemplo de serviço:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: family
      POSTGRES_PASSWORD: family
      POSTGRES_DB: family_dreams
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Variáveis de ambiente

API `.env.example`:

```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://family:family@localhost:5432/family_dreams
```

Web `.env.example`:

```env
VITE_API_URL=http://localhost:3333
```

## Baseline de deploy

O baseline de deploy desta mudança não é um deploy completo de produção.

O objetivo é provar que:

- a API faz build
- o Web faz build
- o banco local consegue rodar
- variáveis de ambiente estão documentadas
- o CI captura commits quebrados
- `GET /health` continua disponível para verificação em runtime

## Estratégia de testes

- O CI deve rodar a suíte de testes existente.
- O Docker Compose deve iniciar PostgreSQL.
- Os Dockerfiles devem fazer build com sucesso.
- O endpoint de health da API deve continuar retornando 200.

## Perguntas em aberto

- Os serviços de API e Web devem entrar no Compose imediatamente ou depois que os Dockerfiles estiverem estáveis?
- O CI deve incluir build de imagem Docker nesta mudança ou em uma mudança posterior?
