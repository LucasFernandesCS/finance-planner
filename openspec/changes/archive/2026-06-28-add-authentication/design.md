# Design: Adicionar Autenticação

## Visão geral

Esta mudança adiciona registro e login de usuários.

A implementação seguirá TDD:

```txt
1. Criar testes de registro
2. Ver testes falharem
3. Implementar registro
4. Ver testes passarem
5. Criar testes de login
6. Ver testes falharem
7. Implementar login
8. Ver testes passarem
```

O backend seguirá a arquitetura em camadas:

```txt
Route → Controller → Service → Repository → Prisma
```

O domínio de autenticação será implementado em:

```txt
apps/api/src/modules/auth/
```

## Decisões técnicas importantes

### Senha

A senha SHALL ser salva como hash irreversível.

Campo sugerido:

```txt
passwordHash
```

A senha original nunca deve ser salva em texto puro e nunca deve ser retornada em respostas da API.

Biblioteca sugerida:

```txt
bcrypt
```

ou:

```txt
argon2
```

### CPF

O CPF precisa atender três requisitos:

1. Ser validado matematicamente.
2. Não ser salvo em texto puro.
3. Ser consultável para login e unicidade.

O CPF SHALL ser normalizado antes de qualquer validação, removendo pontos, hífen, espaços e qualquer caractere não numérico.

Exemplo:

```txt
"123.456.789-09" → "12345678909"
```

O CPF SHALL ser validado antes de gerar o hash.

A validação SHALL verificar:

- CPF possui exatamente 11 dígitos.
- CPF não é formado por uma sequência repetida, como `00000000000` ou `11111111111`.
- CPF passa no cálculo dos dois dígitos verificadores.

O sistema SHALL rejeitar CPFs inválidos antes de consultar unicidade no banco.

O sistema SHALL salvar apenas o hash determinístico do CPF normalizado.

Campo sugerido:

```txt
cpfHash
```

Esse campo deverá ser gerado usando HMAC-SHA256 com uma chave secreta de ambiente.

Exemplo conceitual:

```txt
cpfHash = HMAC_SHA256(CPF_NORMALIZADO, CPF_HASH_SECRET)
```

O campo `cpfHash` SHALL ter índice único no PostgreSQL.

O CPF original não deve ser retornado em respostas da API.

Opcionalmente, se no futuro for necessário exibir o CPF mascarado, uma mudança posterior poderá adicionar armazenamento criptografado reversível com AES-GCM. Nesta change, o necessário é permitir login e unicidade sem armazenar CPF puro.

### Algoritmo de validação de CPF

A implementação SHALL validar CPF com os seguintes passos:

1. Remover todos os caracteres não numéricos.
2. Verificar se o resultado possui exatamente 11 dígitos.
3. Rejeitar CPFs formados por uma única sequência repetida, como `00000000000`.
4. Calcular o primeiro dígito verificador usando os 9 primeiros dígitos e pesos de 10 até 2.
5. Calcular o segundo dígito verificador usando os 10 primeiros dígitos e pesos de 11 até 2.
6. Comparar os dígitos calculados com os dois últimos dígitos do CPF informado.
7. Considerar o CPF válido somente se ambos os dígitos verificadores coincidirem.

### E-mail

O e-mail SHALL ser normalizado antes de salvar e consultar:

```txt
email.trim().toLowerCase()
```

O campo `email` SHALL ter índice único no PostgreSQL.

### Access token e refresh token

No login bem-sucedido, o sistema SHALL retornar:

- `accessToken`
- `refreshToken`

O access token SHALL ser um JWT.

O refresh token SHALL ser gerado como valor aleatório seguro.

O refresh token SHALL ser salvo no banco apenas como hash.

Tempo de uso contínuo máximo:

```txt
30 minutos
```

Nesta change, o login emite refresh token com expiração de 30 minutos. O endpoint para renovar access token pode ser implementado em uma change posterior, caso o projeto precise de refresh token rotation completo.

## Arquitetura

Estrutura esperada:

```txt
apps/api/src/modules/auth/
├── auth.routes.ts
├── auth.controller.ts
├── auth.service.ts
├── auth.repository.ts
├── auth.schemas.ts
├── auth.types.ts
└── auth.errors.ts
```

Áreas compartilhadas esperadas:

```txt
apps/api/src/shared/
├── errors/
├── middlewares/
├── infra/
│   └── prisma.ts
└── utils/
    ├── hash.ts
    ├── cpf.ts
    └── token.ts
```

## Áreas afetadas

- `apps/api/src/modules/auth` — implementação do módulo de autenticação.
- `apps/api/src/shared/infra/prisma.ts` — acesso ao Prisma Client.
- `apps/api/src/shared/utils/hash.ts` — funções de hash de senha, CPF e refresh token.
- `apps/api/src/shared/utils/cpf.ts` — normalização e validação matemática de CPF.
- `apps/api/src/shared/utils/token.ts` — geração de access token e refresh token.
- `apps/api/src/app.ts` — registro das rotas de auth.
- `prisma/schema.prisma` — model de usuário e refresh token.
- `apps/api/tests/integration/auth/register.spec.ts` — bateria de testes de registro.
- `apps/api/tests/integration/auth/login.spec.ts` — bateria de testes de login.
- `apps/api/.env.example` — variáveis obrigatórias de autenticação.

## Modelo de dados

### User

```prisma
model User {
  id           String   @id @default(uuid())
  firstName    String
  lastName     String
  email        String   @unique
  cpfHash      String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  refreshTokens RefreshToken[]
}
```

### RefreshToken

```prisma
model RefreshToken {
  id        String    @id @default(uuid())
  userId    String
  tokenHash String    @unique
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

## Variáveis de ambiente

Adicionar em `apps/api/.env.example`:

```env
JWT_ACCESS_SECRET=change-me-access-secret
JWT_ACCESS_EXPIRES_IN=15m

REFRESH_TOKEN_EXPIRES_IN_MINUTES=30

CPF_HASH_SECRET=change-me-cpf-hash-secret
REFRESH_TOKEN_HASH_SECRET=change-me-refresh-token-hash-secret
```

## Contrato de API

### POST /auth/register

Request:

```json
{
  "firstName": "Lucas",
  "lastName": "Fernandes",
  "email": "lucas@email.com",
  "password": "Senha@123",
  "cpf": "123.456.789-09"
}
```

Success response:

```json
{
  "user": {
    "id": "uuid",
    "firstName": "Lucas",
    "lastName": "Fernandes",
    "email": "lucas@email.com"
  }
}
```

Error response — CPF inválido:

```json
{
  "error": {
    "code": "INVALID_CPF",
    "message": "CPF inválido."
  }
}
```

Error response — CPF já existente:

```json
{
  "error": {
    "code": "CPF_ALREADY_EXISTS",
    "message": "CPF já cadastrado."
  }
}
```

Error response — e-mail já existente:

```json
{
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "E-mail já cadastrado."
  }
}
```

Error response — senha curta:

```json
{
  "error": {
    "code": "PASSWORD_TOO_SHORT",
    "message": "A senha deve ter no mínimo 8 caracteres."
  }
}
```

Error response — senha simples:

```json
{
  "error": {
    "code": "PASSWORD_TOO_WEAK",
    "message": "A senha deve conter letra minúscula, letra maiúscula e caractere especial."
  }
}
```

### POST /auth/login

Login com e-mail:

```json
{
  "email": "lucas@email.com",
  "password": "Senha@123"
}
```

Login com CPF:

```json
{
  "cpf": "123.456.789-09",
  "password": "Senha@123"
}
```

Success response:

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "uuid",
    "firstName": "Lucas",
    "lastName": "Fernandes",
    "email": "lucas@email.com"
  }
}
```

Error response — credenciais inválidas:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Credenciais inválidas."
  }
}
```

## Regras de validação

| Campo       | Regra                                                             |
| ----------- | ----------------------------------------------------------------- |
| `firstName` | obrigatório, string não vazia                                     |
| `lastName`  | obrigatório, string não vazia                                     |
| `email`     | obrigatório, formato de e-mail válido, normalizado para lowercase |
| `cpf`       | obrigatório no registro, normalizado para conter somente dígitos  |
| `cpf`       | deve possuir exatamente 11 dígitos                                |
| `cpf`       | não pode ser sequência repetida                                   |
| `cpf`       | deve passar no algoritmo dos dígitos verificadores                |
| `password`  | obrigatório, mínimo 8 caracteres                                  |
| `password`  | deve conter pelo menos uma letra minúscula                        |
| `password`  | deve conter pelo menos uma letra maiúscula                        |
| `password`  | deve conter pelo menos um caractere especial                      |

## Regras de autorização

| Ação              | Quem pode executar        |
| ----------------- | ------------------------- |
| Registrar usuário | visitante não autenticado |
| Fazer login       | visitante não autenticado |

## Mapeamento de erros

| Caso                            | HTTP Status | Código de erro       |
| ------------------------------- | ----------: | -------------------- |
| Body inválido                   |         400 | VALIDATION_ERROR     |
| CPF inválido                    |         400 | INVALID_CPF          |
| Senha com menos de 8 caracteres |         400 | PASSWORD_TOO_SHORT   |
| Senha sem complexidade mínima   |         400 | PASSWORD_TOO_WEAK    |
| CPF já cadastrado               |         409 | CPF_ALREADY_EXISTS   |
| E-mail já cadastrado            |         409 | EMAIL_ALREADY_EXISTS |
| Login com credenciais inválidas |         401 | INVALID_CREDENTIALS  |

## Estratégia de testes

### Bateria de testes de registro

Arquivo sugerido:

```txt
apps/api/tests/integration/auth/register.spec.ts
```

Cenários obrigatórios:

- Registro sucedido.
- Registro com CPF matematicamente inválido.
- Registro com CPF formado por sequência repetida.
- Registro com CPF já existente.
- Registro com e-mail já existente.
- Registro com senha muito simples.
- Registro com senha curta.

### Bateria de testes de login

Arquivo sugerido:

```txt
apps/api/tests/integration/auth/login.spec.ts
```

Cenários obrigatórios:

- Login sucedido com e-mail e senha.
- Login sucedido com CPF e senha.
- Login com e-mail e senha inválidos.
- Login com CPF e senha inválidos.

## Estratégia TDD

A implementação SHALL seguir esta ordem:

```txt
1. Criar teste de registro sucedido
2. Rodar teste e confirmar falha
3. Implementar o mínimo para passar
4. Criar teste de CPF matematicamente inválido
5. Rodar teste e confirmar falha
6. Implementar validação matemática de CPF
7. Criar teste de CPF com sequência repetida
8. Rodar teste e confirmar falha
9. Implementar rejeição de CPF repetido
10. Criar teste de CPF duplicado
11. Rodar teste e confirmar falha
12. Implementar validação de CPF duplicado
13. Criar teste de e-mail duplicado
14. Rodar teste e confirmar falha
15. Implementar validação de e-mail duplicado
16. Criar testes de senha fraca e curta
17. Rodar testes e confirmar falha
18. Implementar validações de senha
19. Criar testes de login
20. Rodar testes e confirmar falha
21. Implementar login
22. Rodar suíte completa
```

## Perguntas em aberto

- O projeto usará `bcrypt` ou `argon2` para hash de senha?
- O refresh token terá endpoint próprio nesta primeira versão ou apenas será emitido no login?
- O CPF deverá ser validado apenas pelo algoritmo matemático ou também por consulta externa no futuro?

## Complemento: Cobertura unitária após primeira implementação

A primeira aplicação da change priorizou os testes de integração e o fluxo funcional de autenticação.

Antes do archive da change, o projeto SHALL adicionar testes unitários para regras críticas do domínio de autenticação.

Esses testes unitários devem validar regras isoladas sem depender de HTTP, Prisma ou banco real.

A cobertura unitária deve incluir:

- normalização de CPF
- validação matemática de CPF
- rejeição de CPF com sequência repetida
- política de senha forte
- hash determinístico de CPF
- comportamento do AuthService em registro
- comportamento do AuthService em login

Esta etapa não deve alterar o contrato público da API.

Pequenas refatorações são permitidas apenas quando necessárias para tornar funções e serviços testáveis.
