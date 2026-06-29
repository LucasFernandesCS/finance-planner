# debts Specification

## Purpose
TBD - created by archiving change add-debt-management. Update Purpose after archive.
## Requirements
### Requirement: Adicionar dívida

O sistema SHALL permitir que usuários autenticados adicionem dívidas.

#### Scenario: Criação de dívida bem-sucedida

- GIVEN existe um usuário autenticado
- AND o usuário informa título, credor, tipo, valor original e vencimento mensal válidos
- WHEN o usuário envia uma requisição `POST /debts`
- THEN o sistema SHALL criar uma dívida associada ao usuário autenticado
- AND o sistema SHALL definir `currentBalanceInCents` igual a `originalAmountInCents`
- AND o sistema SHALL definir status inicial como `IN_PROGRESS`
- AND o sistema SHALL retornar status 201

#### Scenario: Tentativa de criar dívida sem autenticação

- GIVEN não existe usuário autenticado
- WHEN uma requisição `POST /debts` é enviada
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 401
- AND a resposta SHALL conter o código de erro `UNAUTHORIZED`

#### Scenario: Tentativa de criar dívida com valor negativo

- GIVEN existe um usuário autenticado
- AND o usuário informa valor original menor que zero
- WHEN o usuário envia uma requisição `POST /debts`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `DEBT_AMOUNT_MUST_BE_POSITIVE`

#### Scenario: Tentativa de criar dívida com valor zerado

- GIVEN existe um usuário autenticado
- AND o usuário informa valor original igual a zero
- WHEN o usuário envia uma requisição `POST /debts`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `DEBT_AMOUNT_MUST_BE_POSITIVE`

#### Scenario: Tentativa de criar dívida sem campos obrigatórios

- GIVEN existe um usuário autenticado
- AND a requisição não contém todos os campos obrigatórios
- WHEN o usuário envia uma requisição `POST /debts`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `VALIDATION_ERROR`

#### Scenario: Tentativa de criar dívida com valor acima do limite

- GIVEN existe um usuário autenticado
- AND o usuário informa valor original acima do limite permitido
- WHEN o usuário envia uma requisição `POST /debts`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `DEBT_AMOUNT_OVERFLOW`

#### Scenario: Tentativa de criar dívida com título muito longo

- GIVEN existe um usuário autenticado
- AND o usuário informa título com mais de 100 caracteres
- WHEN o usuário envia uma requisição `POST /debts`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `DEBT_TITLE_TOO_LONG`

### Requirement: Listar dívidas

O sistema SHALL permitir que usuários autenticados listem apenas suas próprias dívidas.

#### Scenario: Listagem de dívidas bem-sucedida

- GIVEN existe um usuário autenticado
- AND existem dívidas associadas a esse usuário
- WHEN o usuário envia uma requisição `GET /debts`
- THEN o sistema SHALL retornar status 200
- AND a resposta SHALL conter apenas dívidas do usuário autenticado

#### Scenario: Listagem não retorna dívida de outro usuário

- GIVEN existe um usuário autenticado
- AND existe dívida cadastrada para outro usuário
- WHEN o usuário envia uma requisição `GET /debts`
- THEN o sistema SHALL retornar status 200
- AND a resposta SHALL NOT conter dívidas pertencentes ao outro usuário

### Requirement: Atualizar dívida

O sistema SHALL permitir que usuários autenticados atualizem suas próprias dívidas.

#### Scenario: Atualização de dívida própria

- GIVEN existe um usuário autenticado
- AND existe uma dívida associada a esse usuário
- WHEN o usuário envia uma requisição `PATCH /debts/:debtId` com dados válidos
- THEN o sistema SHALL atualizar a dívida
- AND o sistema SHALL retornar status 200

#### Scenario: Tentativa de atualizar dívida de outro usuário

- GIVEN existe um usuário autenticado
- AND existe uma dívida associada a outro usuário
- WHEN o usuário envia uma requisição `PATCH /debts/:debtId` para a dívida do outro usuário
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 403
- AND a resposta SHALL conter o código de erro `FORBIDDEN`

### Requirement: Remover dívida

O sistema SHALL permitir que usuários autenticados removam suas próprias dívidas.

#### Scenario: Remoção de dívida própria

- GIVEN existe um usuário autenticado
- AND existe uma dívida associada a esse usuário
- WHEN o usuário envia uma requisição `DELETE /debts/:debtId`
- THEN o sistema SHALL remover a dívida
- AND o sistema SHALL retornar status 200

#### Scenario: Tentativa de remover dívida de outro usuário

- GIVEN existe um usuário autenticado
- AND existe uma dívida associada a outro usuário
- WHEN o usuário envia uma requisição `DELETE /debts/:debtId` para a dívida do outro usuário
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 403
- AND a resposta SHALL conter o código de erro `FORBIDDEN`

### Requirement: Registrar pagamento de dívida

O sistema SHALL permitir que usuários autenticados registrem pagamentos em suas próprias dívidas.

#### Scenario: Pagamento de dívida bem-sucedido

- GIVEN existe um usuário autenticado
- AND existe uma dívida associada ao usuário
- AND a dívida possui saldo devedor suficiente
- WHEN o usuário envia uma requisição `POST /debts/:debtId/payments`
- THEN o sistema SHALL criar um registro de pagamento
- AND o sistema SHALL reduzir o saldo devedor da dívida
- AND o sistema SHALL retornar status 201

#### Scenario: Amortização bem-sucedida

- GIVEN existe uma dívida com saldo devedor de R$ 2.000,00
- WHEN o usuário registra pagamento de R$ 500,00
- THEN o sistema SHALL atualizar o saldo devedor para R$ 1.500,00

#### Scenario: Tentativa de pagar valor maior que saldo devedor restante

- GIVEN existe uma dívida com saldo devedor de R$ 500,00
- WHEN o usuário tenta registrar pagamento de R$ 600,00
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `DEBT_PAYMENT_EXCEEDS_BALANCE`

#### Scenario: Tentativa de pagar dívida de outro usuário

- GIVEN existe um usuário autenticado
- AND existe uma dívida pertencente a outro usuário
- WHEN o usuário tenta registrar pagamento nessa dívida
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 403
- AND a resposta SHALL conter o código de erro `FORBIDDEN`

### Requirement: Criar despesa reflexa ao pagar dívida

O sistema SHALL criar uma despesa variável reflexa quando um pagamento de dívida for registrado.

#### Scenario: Geração de despesa reflexa

- GIVEN existe um usuário autenticado
- AND existe uma dívida associada ao usuário
- WHEN o usuário registra um pagamento de dívida
- THEN o sistema SHALL criar uma despesa variável no mês do pagamento
- AND a despesa SHALL ter valor igual ao pagamento
- AND a despesa SHALL usar categoria `DEBT_PAYMENT`
- AND a despesa SHALL pertencer ao mesmo usuário autenticado

### Requirement: Atualizar status da dívida

O sistema SHALL atualizar automaticamente o status da dívida conforme pagamentos e vencimentos.

#### Scenario: Alteração automática para quitado

- GIVEN existe uma dívida com saldo devedor restante
- WHEN um pagamento faz o saldo devedor chegar a zero
- THEN o sistema SHALL alterar o status da dívida para `PAID`
- AND a alteração SHALL ser persistida no banco de dados

#### Scenario: Alteração automática para atrasado

- GIVEN existe uma dívida com status diferente de `PAID`
- AND a data atual é posterior ao vencimento mensal
- AND não existe pagamento registrado no mês atual
- WHEN o sistema consulta ou manipula a dívida
- THEN o sistema SHALL alterar o status da dívida para `OVERDUE`

#### Scenario: Dívida atrasada volta para em andamento após pagamento parcial

- GIVEN existe uma dívida com status `OVERDUE`
- AND a dívida possui saldo devedor restante
- WHEN o usuário registra um pagamento válido
- THEN o sistema SHALL alterar o status para `IN_PROGRESS`
- AND o sistema SHALL manter o saldo devedor atualizado

