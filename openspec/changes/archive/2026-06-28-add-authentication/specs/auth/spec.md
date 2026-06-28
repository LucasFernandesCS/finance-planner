# Delta for Auth

## ADDED Requirements

### Requirement: Registro de usuário

O sistema SHALL permitir que visitantes criem uma conta informando nome, sobrenome, e-mail, senha e CPF.

#### Scenario: Registro sucedido

- GIVEN não existe usuário cadastrado com o e-mail informado
- AND não existe usuário cadastrado com o CPF informado
- AND o CPF passa no algoritmo dos dígitos verificadores
- AND a senha possui no mínimo 8 caracteres
- AND a senha contém letra minúscula, letra maiúscula e caractere especial
- WHEN o visitante envia uma requisição `POST /auth/register` com nome, sobrenome, e-mail, senha e CPF
- THEN o sistema SHALL criar um novo usuário
- AND o sistema SHALL salvar a senha como hash
- AND o sistema SHALL salvar o CPF como hash determinístico
- AND o sistema SHALL retornar status 201
- AND a resposta SHALL conter os dados básicos do usuário
- AND a resposta SHALL NOT conter `passwordHash`
- AND a resposta SHALL NOT conter CPF em texto puro

#### Scenario: Registro com CPF já existente

- GIVEN existe um usuário cadastrado com o CPF informado
- WHEN o visitante envia uma requisição `POST /auth/register` usando esse CPF
- THEN o sistema SHALL rejeitar o registro
- AND o sistema SHALL retornar status 409
- AND a resposta SHALL conter o código de erro `CPF_ALREADY_EXISTS`

#### Scenario: Registro com e-mail já existente

- GIVEN existe um usuário cadastrado com o e-mail informado
- WHEN o visitante envia uma requisição `POST /auth/register` usando esse e-mail
- THEN o sistema SHALL rejeitar o registro
- AND o sistema SHALL retornar status 409
- AND a resposta SHALL conter o código de erro `EMAIL_ALREADY_EXISTS`

#### Scenario: Registro com senha muito simples

- GIVEN o visitante informa uma senha sem letra minúscula, letra maiúscula ou caractere especial
- WHEN o visitante envia uma requisição `POST /auth/register`
- THEN o sistema SHALL rejeitar o registro
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `PASSWORD_TOO_WEAK`

#### Scenario: Registro com senha curta

- GIVEN o visitante informa uma senha com menos de 8 caracteres
- WHEN o visitante envia uma requisição `POST /auth/register`
- THEN o sistema SHALL rejeitar o registro
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `PASSWORD_TOO_SHORT`

### Requirement: Validação matemática de CPF

O sistema SHALL validar o CPF pelo algoritmo dos dígitos verificadores antes de permitir o registro de usuário.

#### Scenario: Registro com CPF válido

- GIVEN o visitante informa um CPF com 11 dígitos
- AND o CPF não é uma sequência repetida
- AND o CPF passa no cálculo dos dígitos verificadores
- WHEN o visitante envia uma requisição `POST /auth/register`
- THEN o sistema SHALL aceitar o CPF como válido para a tentativa de registro
- AND o sistema SHALL gerar o hash determinístico do CPF normalizado

#### Scenario: Registro com CPF matematicamente inválido

- GIVEN o visitante informa o CPF `000.000.000-01`
- WHEN o visitante envia uma requisição `POST /auth/register`
- THEN o sistema SHALL rejeitar o registro
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `INVALID_CPF`

#### Scenario: Registro com CPF formado por sequência repetida

- GIVEN o visitante informa o CPF `000.000.000-00`
- WHEN o visitante envia uma requisição `POST /auth/register`
- THEN o sistema SHALL rejeitar o registro
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `INVALID_CPF`

#### Scenario: Registro com CPF em formato inválido

- GIVEN o visitante informa um CPF com menos ou mais de 11 dígitos
- WHEN o visitante envia uma requisição `POST /auth/register`
- THEN o sistema SHALL rejeitar o registro
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `INVALID_CPF`

### Requirement: Unicidade de CPF

O sistema SHALL garantir que CPF seja único entre usuários cadastrados.

#### Scenario: CPF duplicado

- GIVEN existe um usuário cadastrado com um CPF
- WHEN outro visitante tenta se registrar com o mesmo CPF
- THEN o sistema SHALL impedir a criação do segundo usuário
- AND o sistema SHALL retornar status 409
- AND a resposta SHALL conter o código de erro `CPF_ALREADY_EXISTS`

### Requirement: Unicidade de e-mail

O sistema SHALL garantir que e-mail seja único entre usuários cadastrados.

#### Scenario: E-mail duplicado

- GIVEN existe um usuário cadastrado com um e-mail
- WHEN outro visitante tenta se registrar com o mesmo e-mail
- THEN o sistema SHALL impedir a criação do segundo usuário
- AND o sistema SHALL retornar status 409
- AND a resposta SHALL conter o código de erro `EMAIL_ALREADY_EXISTS`

### Requirement: Segurança dos dados sensíveis

O sistema SHALL proteger senha, CPF e refresh token usando hash apropriado.

#### Scenario: Senha salva com hash

- GIVEN um visitante realiza cadastro com senha válida
- WHEN o usuário é persistido no banco
- THEN a senha SHALL ser salva como hash
- AND a senha original SHALL NOT ser salva em texto puro

#### Scenario: CPF salvo com hash determinístico

- GIVEN um visitante realiza cadastro com CPF válido
- WHEN o usuário é persistido no banco
- THEN o CPF SHALL ser normalizado
- AND o CPF SHALL ser salvo como hash determinístico
- AND o CPF em texto puro SHALL NOT ser retornado pela API

#### Scenario: Refresh token salvo com hash

- GIVEN um usuário realiza login com credenciais válidas
- WHEN o refresh token é gerado
- THEN o sistema SHALL salvar apenas o hash do refresh token
- AND o refresh token puro SHALL ser retornado somente no momento do login

### Requirement: Login com e-mail e senha

O sistema SHALL permitir que usuários cadastrados façam login usando e-mail e senha.

#### Scenario: Login sucedido com e-mail

- GIVEN existe um usuário cadastrado com e-mail `lucas@email.com`
- AND a senha informada corresponde ao hash salvo no banco
- WHEN o usuário envia uma requisição `POST /auth/login` com e-mail e senha
- THEN o sistema SHALL retornar status 200
- AND a resposta SHALL conter um `accessToken`
- AND a resposta SHALL conter um `refreshToken`
- AND a resposta SHALL conter os dados básicos do usuário
- AND a resposta SHALL NOT conter `passwordHash`
- AND a resposta SHALL NOT conter CPF em texto puro

#### Scenario: Login com e-mail e senha inválidos

- GIVEN não existe usuário para o e-mail informado ou a senha informada está incorreta
- WHEN o usuário envia uma requisição `POST /auth/login` com e-mail e senha
- THEN o sistema SHALL rejeitar o login
- AND o sistema SHALL retornar status 401
- AND a resposta SHALL conter o código de erro `INVALID_CREDENTIALS`

### Requirement: Login com CPF e senha

O sistema SHALL permitir que usuários cadastrados façam login usando CPF e senha.

#### Scenario: Login sucedido com CPF

- GIVEN existe um usuário cadastrado com o CPF informado
- AND a senha informada corresponde ao hash salvo no banco
- WHEN o usuário envia uma requisição `POST /auth/login` com CPF e senha
- THEN o sistema SHALL retornar status 200
- AND a resposta SHALL conter um `accessToken`
- AND a resposta SHALL conter um `refreshToken`
- AND a resposta SHALL conter os dados básicos do usuário
- AND a resposta SHALL NOT conter `passwordHash`
- AND a resposta SHALL NOT conter CPF em texto puro

#### Scenario: Login com CPF e senha inválidos

- GIVEN não existe usuário para o CPF informado ou a senha informada está incorreta
- WHEN o usuário envia uma requisição `POST /auth/login` com CPF e senha
- THEN o sistema SHALL rejeitar o login
- AND o sistema SHALL retornar status 401
- AND a resposta SHALL conter o código de erro `INVALID_CREDENTIALS`

### Requirement: Tempo máximo de uso contínuo

O sistema SHALL limitar o uso contínuo da sessão inicial a no máximo 30 minutos.

#### Scenario: Refresh token com expiração de 30 minutos

- GIVEN um usuário realiza login com credenciais válidas
- WHEN o sistema gera um refresh token
- THEN o refresh token SHALL possuir expiração de 30 minutos
- AND o hash do refresh token SHALL ser persistido com a data de expiração
