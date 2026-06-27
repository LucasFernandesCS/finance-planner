# Proposta: Configurar CI e Docker

## Intenção

Adicionar uma fundação confiável de desenvolvimento e validação para o projeto.

O repositório não deve depender da máquina de um único desenvolvedor para provar que funciona. Cada commit ou pull request deve ser validado por um workflow automatizado, e o ambiente local deve ser reproduzível com Docker.

## Estado atual

O projeto possui uma fundação básica em monorepo, mas ainda não possui:

- workflow do GitHub Actions
- ambiente Docker Compose
- Dockerfiles para API e Web
- arquivos `.env.example` padronizados
- validação automática de CI em pull requests

## Estado desejado

O repositório SHALL fornecer:

- workflow de CI com GitHub Actions
- Docker Compose para serviços locais de desenvolvimento
- serviço PostgreSQL para desenvolvimento local
- Dockerfile para API
- Dockerfile para Web
- arquivos `.env.example`
- scripts da raiz compatíveis com CI
- baseline de deploy por meio de build e health check

## Escopo

### Dentro do escopo

- Adicionar `.github/workflows/ci.yml`.
- Rodar install, typecheck, lint, test e build no CI.
- Adicionar Docker Compose com PostgreSQL.
- Adicionar Dockerfile da API.
- Adicionar Dockerfile do Web.
- Adicionar `.dockerignore`.
- Adicionar arquivos `.env.example`.
- Documentar como rodar o projeto localmente com Docker.
- Garantir que `GET /health` possa ser usado como verificação de deploy.

### Fora do escopo

- Kubernetes em produção.
- Terraform.
- Provisionamento em cloud provider.
- Banco real de produção.
- Stack de observabilidade.
- Dashboards de monitoramento.
- Blue/green deployments.
- Autenticação.
- Funcionalidades de negócio.

## Usuários afetados

- Desenvolvedores.
- Revisores.
- Assistentes de IA.
- Ambientes futuros de deploy.

## Critérios de sucesso

- CI roda em pull requests para `main`.
- CI roda em pushes para `main`.
- CI instala dependências com lockfile congelado.
- CI roda typecheck, lint, testes e build.
- Docker Compose inicia PostgreSQL localmente.
- Dockerfiles da API e do Web conseguem fazer build.
- Variáveis de ambiente são documentadas por meio de `.env.example`.
- Desenvolvedores conseguem rodar o ambiente local sem adivinhar passos de setup.

## Riscos

- A configuração Docker pode ficar desatualizada caso os scripts mudem.
- O CI pode falhar caso nomes de pacotes ou filtros de workspace estejam inconsistentes.
- Rodar verificações demais muito cedo pode deixar a iteração lenta, se o workflow não for mantido simples.

## Plano de rollback

Se a configuração de CI ou Docker bloquear o desenvolvimento, desativar temporariamente o trigger do workflow ou reverter o commit de CI/Docker. Como esta mudança não introduz comportamento de negócio, o rollback é de baixo risco.
