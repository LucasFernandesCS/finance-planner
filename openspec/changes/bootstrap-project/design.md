# Design: Bootstrap do Projeto

## Visão geral

Esta mudança cria a fundação inicial do monorepo do projeto.

O repositório usará pnpm workspaces com três áreas principais:

- `apps/api`: API backend
- `apps/web`: aplicação frontend
- `packages/shared`: tipos e utilitários compartilhados

O backend seguirá uma arquitetura em camadas:

```txt
Route → Controller → Service → Repository → Prisma
```

Neste bootstrap, o Prisma pode ser instalado ou configurado em uma mudança posterior relacionada a banco, CI ou Docker. O foco desta mudança é a estrutura da aplicação, scripts, TypeScript, testes básicos e health check.

## Arquitetura

Estrutura desejada:

```txt
apps/
├── api/
│   ├── src/
│   │   ├── modules/
│   │   ├── shared/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
│
└── web/
    ├── src/
    ├── package.json
    └── tsconfig.json

packages/
└── shared/
    ├── src/
    ├── package.json
    └── tsconfig.json
```

## Áreas afetadas

- `package.json` — scripts da raiz e metadados do workspace.
- `pnpm-workspace.yaml` — configuração do workspace.
- `apps/api` — estrutura inicial do backend.
- `apps/web` — estrutura inicial do frontend.
- `packages/shared` — estrutura inicial do pacote compartilhado.
- `openspec/changes/bootstrap-project` — artefatos de planejamento.

## Contrato de API

### GET /health

Request:

Sem body.

Success response:

```json
{
  "status": "ok"
}
```

## Design do Backend

A API deve expor:

```txt
GET /health
```

A criação da aplicação Express deve ser separada da inicialização do servidor:

```txt
src/app.ts
src/server.ts
```

Isso permite que os testes importem a aplicação sem iniciar o servidor.

## Design do Frontend

O frontend deve renderizar uma página mínima confirmando que a aplicação está funcionando.

Conteúdo sugerido:

```txt
Family Dreams is running
```

Nenhuma interface de negócio é necessária nesta mudança.

## Design do Pacote Compartilhado

O pacote compartilhado pode exportar um tipo ou utilitário simples para validar a estrutura do workspace.

Exemplo:

```ts
export type HealthStatus = "ok";
```

## Estratégia de testes

- Teste de integração da API para `GET /health`.
- Build do frontend deve passar.
- Typecheck do pacote compartilhado deve passar.

## Perguntas em aberto

- O projeto usará Vitest ou Jest como padrão?
- A porta padrão da API será `3333` ou `3000`?
