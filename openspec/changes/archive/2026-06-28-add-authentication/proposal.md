# Proposta: Adicionar Autenticação

## Intenção

Adicionar o fluxo inicial de autenticação do sistema, permitindo que usuários se registrem e façam login.

O sistema precisa identificar usuários de forma segura para permitir funcionalidades futuras, como controle financeiro individual, grupos familiares, objetivos compartilhados, despesas, dívidas e dashboard personalizado.

A autenticação deve ser implementada com TDD, criando primeiro os testes automatizados de registro e login, e somente depois a implementação.

## Estado atual

O projeto possui a fundação técnica inicial, CI, Docker e estrutura básica de backend/frontend.

Ainda não existe:

- cadastro de usuários
- login
- persistência de usuário
- geração de access token
- geração de refresh token
- validação de senha forte
- validação matemática de CPF
- garantia de unicidade de e-mail
- garantia de unicidade de CPF

## Estado desejado

O sistema SHALL permitir que um usuário se registre informando:

- nome
- sobrenome
- e-mail
- senha
- CPF

O sistema SHALL garantir que:

- e-mail seja único
- CPF seja único
- CPF seja validado pelo algoritmo dos dígitos verificadores
- CPF formado por sequência repetida seja rejeitado
- senha seja salva como hash
- CPF não seja salvo em texto puro
- login possa ser feito com e-mail e senha
- login possa ser feito com CPF e senha
- login retorne access token e refresh token
- refresh token tenha expiração compatível com uso contínuo máximo de 30 minutos
- testes de registro e login sejam criados antes da implementação

## Escopo

### Dentro do escopo

- Criar model de usuário.
- Criar campo único para e-mail.
- Criar campo único para hash determinístico do CPF.
- Criar hash de senha.
- Criar validação de senha forte.
- Criar validação matemática de CPF.
- Rejeitar CPFs com sequência repetida de dígitos.
- Criar endpoint de registro.
- Criar endpoint de login.
- Permitir login com e-mail + senha.
- Permitir login com CPF + senha.
- Gerar access token.
- Gerar refresh token.
- Salvar refresh token apenas como hash.
- Criar testes automatizados para registro.
- Criar testes automatizados para login.
- Implementar seguindo TDD.

### Fora do escopo

- Recuperação de senha.
- Confirmação de e-mail.
- Login social.
- Autenticação em dois fatores.
- Tela frontend de login e cadastro.
- Refresh token rotation completo.
- Endpoint para renovar access token.
- Controle de roles/permissões.
- Logout.
- Bloqueio por múltiplas tentativas inválidas.
- Consulta externa em base governamental para verificar existência real do CPF.

## Usuários afetados

- Usuários que precisam criar conta.
- Usuários que precisam acessar o sistema.
- Desenvolvedores que implementarão funcionalidades autenticadas no futuro.
- Assistentes de IA que trabalharão em cima das specs do domínio de auth.

## Critérios de sucesso

- Um usuário consegue se registrar com dados válidos.
- O sistema rejeita CPF com formato inválido.
- O sistema rejeita CPF matematicamente inválido.
- O sistema rejeita CPF formado por sequência repetida de dígitos.
- O sistema rejeita registro com CPF já existente.
- O sistema rejeita registro com e-mail já existente.
- O sistema rejeita senha com menos de 8 caracteres.
- O sistema rejeita senha sem complexidade mínima.
- Um usuário consegue fazer login usando e-mail e senha.
- Um usuário consegue fazer login usando CPF e senha.
- Login válido retorna access token e refresh token.
- Login inválido retorna erro de credenciais inválidas.
- Senha não é retornada em nenhuma resposta.
- CPF em texto puro não é retornado em nenhuma resposta.
- Refresh token salvo no banco não fica em texto puro.
- Testes de registro e login existem antes da implementação.
- CI continua passando após a implementação.

## Riscos

- Implementar CPF com hash não determinístico impediria busca e unicidade.
- Validar apenas tamanho/formato do CPF permitiria CPFs matematicamente inválidos.
- Expor CPF ou senha em resposta seria falha grave de segurança.
- Regras de senha muito fracas reduzem a segurança do sistema.
- Regras de senha muito rígidas podem prejudicar experiência do usuário.
- Refresh token sem armazenamento seguro pode dificultar logout/revogação no futuro.
- O algoritmo de CPF valida a estrutura matemática, mas não comprova que o CPF pertence a uma pessoa real.

## Plano de rollback

Se a autenticação causar problemas, reverter a change e remover as migrations relacionadas ao usuário e tokens em ambiente local. Como a funcionalidade ainda não estará em produção, o rollback é de baixo risco.

Em ambiente com banco compartilhado, a reversão deverá considerar backup e rollback controlado das migrations.
