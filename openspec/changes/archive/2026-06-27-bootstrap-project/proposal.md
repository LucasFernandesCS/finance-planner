# Proposta: Bootstrap do Projeto

## Intenção

Criar a fundação técnica inicial do sistema Finance Planning.

O projeto precisa de uma estrutura previsível antes da implementação de qualquer funcionalidade de negócio. Essa fundação deve permitir que a aplicação cresça como um monorepo full stack, com backend API, frontend web app, pacotes compartilhados, testes e scripts padronizados.

## Estado atual

O repositório está vazio ou contém apenas a configuração inicial do OpenSpec e templates de projeto.

Ainda não existe estrutura de aplicação, backend, frontend, pacote compartilhado ou scripts padronizados.

## Estado desejado

O repositório SHALL conter uma fundação funcional em monorepo com:

- `apps/api` para a API backend
- `apps/web` para o frontend
- `packages/shared` para código compartilhado
- scripts na raiz do projeto
- configuração TypeScript
- estrutura básica do backend
- estrutura básica do frontend
- endpoint de health check na API
- estrutura básica de testes

## Escopo

### Dentro do escopo

- Configurar pnpm workspace.
- Criar estrutura inicial da aplicação backend.
- Criar estrutura inicial da aplicação frontend.
- Criar estrutura inicial do pacote compartilhado.
- Adicionar scripts de desenvolvimento, typecheck, lint, test e build.
- Adicionar endpoint mínimo de health check.
- Adicionar configuração inicial de TypeScript.
- Adicionar testes mínimos para validar que o setup funciona.

### Fora do escopo

- Autenticação.
- Schema de banco para entidades de negócio.
- Funcionalidades financeiras.
- Gerenciamento de usuários.
- Configuração de deploy em produção.
- Interface visual complexa.
- Integrações de pagamento.
- Sistema de notificações.

## Usuários afetados

- Desenvolvedores trabalhando no projeto.
- Assistentes de IA usando a estrutura do repositório.
- Futuros contribuidores que precisarão entender o sistema.

## Critérios de sucesso

- Um desenvolvedor consegue instalar as dependências com `pnpm install`.
- Um desenvolvedor consegue rodar o backend em modo desenvolvimento.
- Um desenvolvedor consegue rodar o frontend em modo desenvolvimento.
- A API expõe `GET /health`.
- O typecheck roda com sucesso.
- O comando de testes roda com sucesso.
- O comando de build roda com sucesso.
- A estrutura do repositório corresponde à arquitetura documentada no OpenSpec.

## Riscos

- Criar infraestrutura demais muito cedo pode atrasar a implementação de funcionalidades.
- Criar estrutura de menos pode tornar o desenvolvimento assistido por IA inconsistente.
- Scripts do monorepo podem falhar caso os nomes dos workspaces estejam inconsistentes.

## Plano de rollback

Se a estrutura inicial causar problemas, reverter o commit da mudança e retornar ao estado anterior do repositório. Como ainda não existe dado de negócio ou comportamento de produção, o rollback é de baixo risco.
