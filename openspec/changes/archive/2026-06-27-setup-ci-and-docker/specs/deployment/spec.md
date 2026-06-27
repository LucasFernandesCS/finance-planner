# Delta for Deploy e Infraestrutura Local

## ADDED Requirements

### Requirement: CI valida qualidade do projeto

O repositório SHALL executar verificações automatizadas de qualidade em pushes e pull requests direcionados para a branch main.

#### Scenario: Validação de pull request

- GIVEN um pull request aponta para a branch main
- WHEN o workflow de CI é executado
- THEN as dependências SHALL ser instaladas
- AND o typecheck SHALL ser executado
- AND o lint SHALL ser executado
- AND os testes SHALL ser executados
- AND o build SHALL ser executado

#### Scenario: Build quebrado

- GIVEN uma mudança introduz um erro de build
- WHEN o workflow de CI é executado
- THEN o workflow SHALL falhar

### Requirement: Banco local roda com Docker Compose

O repositório SHALL fornecer uma configuração Docker Compose para PostgreSQL local.

#### Scenario: Iniciar banco local

- GIVEN Docker está disponível
- WHEN um desenvolvedor executa `docker compose up`
- THEN o PostgreSQL SHALL iniciar
- AND o banco SHALL estar acessível na porta local configurada

### Requirement: Variáveis de ambiente são documentadas

O repositório SHALL fornecer arquivos de exemplo de ambiente para desenvolvimento local.

#### Scenario: Desenvolvedor configura ambiente da API

- GIVEN o desenvolvedor abre `apps/api/.env.example`
- WHEN o desenvolvedor copia o arquivo para `apps/api/.env`
- THEN o desenvolvedor SHALL ter as variáveis obrigatórias da API documentadas

#### Scenario: Desenvolvedor configura ambiente do Web

- GIVEN o desenvolvedor abre `apps/web/.env.example`
- WHEN o desenvolvedor copia o arquivo para `apps/web/.env`
- THEN o desenvolvedor SHALL ter as variáveis obrigatórias do Web documentadas

### Requirement: Imagens das aplicações podem ser construídas

O repositório SHALL fornecer Dockerfiles para as aplicações API e Web.

#### Scenario: Build da imagem da API

- GIVEN o repositório possui um Dockerfile da API
- WHEN a imagem Docker da API é construída
- THEN o build SHALL concluir com sucesso

#### Scenario: Build da imagem do Web

- GIVEN o repositório possui um Dockerfile do Web
- WHEN a imagem Docker do Web é construída
- THEN o build SHALL concluir com sucesso
