# Delta for Reserve Tracking

## ADDED Requirements

### Requirement: Configurar reserva de emergência

O sistema SHALL permitir que usuários autenticados configurem uma reserva de emergência informando a quantidade de meses de proteção desejada.

#### Scenario: Configuração de reserva bem-sucedida

- GIVEN existe um usuário autenticado
- AND o usuário possui despesas fixas cadastradas
- AND o usuário informa uma quantidade válida de meses de proteção
- WHEN o usuário envia uma requisição `POST /reserve`
- THEN o sistema SHALL criar uma reserva associada ao usuário autenticado
- AND o sistema SHALL definir o saldo atual como zero
- AND o sistema SHALL calcular a meta da reserva com base nas despesas fixas
- AND o sistema SHALL retornar status 201

#### Scenario: Tentativa de configurar reserva sem autenticação

- GIVEN não existe usuário autenticado
- WHEN uma requisição `POST /reserve` é enviada
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 401
- AND a resposta SHALL conter o código de erro `UNAUTHORIZED`

#### Scenario: Tentativa de configurar reserva com meses zerados

- GIVEN existe um usuário autenticado
- AND o usuário informa `protectionMonths` igual a zero
- WHEN o usuário envia uma requisição `POST /reserve`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `INVALID_PROTECTION_MONTHS`

#### Scenario: Tentativa de configurar reserva com meses negativos

- GIVEN existe um usuário autenticado
- AND o usuário informa `protectionMonths` menor que zero
- WHEN o usuário envia uma requisição `POST /reserve`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `INVALID_PROTECTION_MONTHS`

#### Scenario: Tentativa de configurar reserva sem despesas fixas

- GIVEN existe um usuário autenticado
- AND o usuário não possui despesas fixas cadastradas
- WHEN o usuário envia uma requisição `POST /reserve`
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `RESERVE_FIXED_EXPENSES_REQUIRED`

### Requirement: Calcular meta da reserva dinamicamente

O sistema SHALL calcular a meta da reserva com base nas despesas fixas mensais do usuário e nos meses de proteção configurados.

#### Scenario: Cálculo do alvo da reserva

- GIVEN existe um usuário autenticado
- AND o usuário possui despesas fixas mensais que somam R$ 3.500,00
- AND o usuário configurou 6 meses de proteção
- WHEN o sistema calcula a reserva
- THEN a meta da reserva SHALL ser R$ 21.000,00

#### Scenario: Recálculo dinâmico após adicionar nova despesa fixa

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- AND as despesas fixas mensais somam R$ 3.500,00
- AND a reserva usa 6 meses de proteção
- WHEN o usuário adiciona uma nova despesa fixa de R$ 500,00
- AND consulta a reserva
- THEN a meta da reserva SHALL ser recalculada para R$ 24.000,00
- AND o percentual de conclusão SHALL ser recalculado

#### Scenario: Recálculo dinâmico após reduzir despesa fixa

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- AND as despesas fixas mensais somam R$ 4.000,00
- AND a reserva usa 6 meses de proteção
- WHEN uma despesa fixa é reduzida e a soma passa para R$ 3.500,00
- AND o usuário consulta a reserva
- THEN a meta da reserva SHALL ser recalculada para R$ 21.000,00
- AND o percentual de conclusão SHALL aumentar

#### Scenario: Recálculo dinâmico após remover despesa fixa

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- AND as despesas fixas mensais somam R$ 4.000,00
- AND a reserva usa 6 meses de proteção
- WHEN uma despesa fixa é removida e a soma passa para R$ 3.500,00
- AND o usuário consulta a reserva
- THEN a meta da reserva SHALL ser recalculada para R$ 21.000,00
- AND o percentual de conclusão SHALL aumentar

#### Scenario: Cálculo com despesas fixas zeradas

- GIVEN existe um usuário autenticado
- AND o usuário não possui despesas fixas cadastradas
- WHEN o usuário tenta configurar a reserva
- THEN o sistema SHALL rejeitar a operação
- AND a resposta SHALL conter o código de erro `RESERVE_FIXED_EXPENSES_REQUIRED`

### Requirement: Consultar reserva de emergência

O sistema SHALL permitir que usuários autenticados consultem sua própria reserva de emergência.

#### Scenario: Consulta de reserva configurada

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- WHEN o usuário envia uma requisição `GET /reserve`
- THEN o sistema SHALL retornar status 200
- AND a resposta SHALL conter saldo atual
- AND a resposta SHALL conter meses de proteção
- AND a resposta SHALL conter despesas fixas mensais calculadas
- AND a resposta SHALL conter meta da reserva calculada
- AND a resposta SHALL conter percentual de conclusão
- AND a resposta SHALL conter status da reserva

#### Scenario: Consulta sem reserva configurada

- GIVEN existe um usuário autenticado
- AND o usuário ainda não possui reserva configurada
- WHEN o usuário envia uma requisição `GET /reserve`
- THEN o sistema SHALL retornar status 200
- AND a resposta SHALL conter `reserve` igual a `null`
- AND a resposta SHALL conter `setupRequired` igual a `true`

### Requirement: Registrar depósito na reserva

O sistema SHALL permitir que usuários autenticados registrem depósitos na própria reserva.

#### Scenario: Confirmação de depósito bem-sucedido

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- AND a reserva possui saldo atual de R$ 1.000,00
- WHEN o usuário registra depósito de R$ 500,00
- THEN o sistema SHALL atualizar o saldo atual para R$ 1.500,00
- AND o sistema SHALL criar um registro de movimentação do tipo `DEPOSIT`
- AND o sistema SHALL retornar status 201

#### Scenario: Tentativa de depósito com valor zerado

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- WHEN o usuário tenta registrar depósito de R$ 0,00
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `RESERVE_TRANSACTION_AMOUNT_MUST_BE_POSITIVE`

#### Scenario: Tentativa de depósito com valor negativo

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- WHEN o usuário tenta registrar depósito com valor negativo
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `RESERVE_TRANSACTION_AMOUNT_MUST_BE_POSITIVE`

### Requirement: Registrar saque da reserva

O sistema SHALL permitir que usuários autenticados registrem saques da própria reserva.

#### Scenario: Saque bem-sucedido

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- AND a reserva possui saldo atual de R$ 1.000,00
- WHEN o usuário registra saque de R$ 300,00
- THEN o sistema SHALL atualizar o saldo atual para R$ 700,00
- AND o sistema SHALL criar um registro de movimentação do tipo `WITHDRAWAL`
- AND o sistema SHALL retornar status 201

#### Scenario: Tentativa de saque maior que saldo atual

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- AND a reserva possui saldo atual de R$ 1.000,00
- WHEN o usuário tenta registrar saque de R$ 1.500,00
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `RESERVE_WITHDRAWAL_EXCEEDS_BALANCE`
- AND o saldo da reserva SHALL permanecer inalterado

#### Scenario: Tentativa de saque com valor zerado

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- WHEN o usuário tenta registrar saque de R$ 0,00
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `RESERVE_TRANSACTION_AMOUNT_MUST_BE_POSITIVE`

#### Scenario: Tentativa de saque com valor negativo

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- WHEN o usuário tenta registrar saque com valor negativo
- THEN o sistema SHALL rejeitar a operação
- AND o sistema SHALL retornar status 400
- AND a resposta SHALL conter o código de erro `RESERVE_TRANSACTION_AMOUNT_MUST_BE_POSITIVE`

### Requirement: Atualizar status da reserva

O sistema SHALL atualizar automaticamente o status da reserva de emergência.

#### Scenario: Alteração automática para protegido

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- AND a meta da reserva é R$ 21.000,00
- WHEN o saldo atual da reserva chega a R$ 21.000,00
- THEN o sistema SHALL alterar status da reserva para `PROTECTED`

#### Scenario: Alteração automática para em reposição após saque

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva com status `PROTECTED`
- AND a meta da reserva é R$ 21.000,00
- AND o saldo atual da reserva é R$ 21.000,00
- WHEN o usuário registra saque de R$ 1.000,00
- THEN o sistema SHALL atualizar o saldo para R$ 20.000,00
- AND o sistema SHALL alterar status da reserva para `REPLENISHING`

#### Scenario: Alteração automática para em reposição após aumento do custo de vida

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva com status `PROTECTED`
- AND o saldo atual da reserva é R$ 21.000,00
- AND a meta anterior era R$ 21.000,00
- WHEN as despesas fixas aumentam e a nova meta passa a ser R$ 24.000,00
- AND o usuário consulta a reserva
- THEN o sistema SHALL alterar status da reserva para `REPLENISHING`

#### Scenario: Transição automática para protegido após redução de despesas

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva com status `BUILDING` ou `REPLENISHING`
- AND o saldo atual da reserva é R$ 21.000,00
- WHEN as despesas fixas diminuem e a nova meta passa a ser R$ 21.000,00 ou menos
- AND o usuário consulta a reserva
- THEN o sistema SHALL alterar status da reserva para `PROTECTED`

### Requirement: Listar movimentações da reserva

O sistema SHALL permitir que usuários autenticados listem movimentações da própria reserva.

#### Scenario: Listagem de movimentações

- GIVEN existe um usuário autenticado
- AND o usuário possui reserva configurada
- AND existem movimentações associadas à reserva
- WHEN o usuário envia uma requisição `GET /reserve/transactions`
- THEN o sistema SHALL retornar status 200
- AND a resposta SHALL conter apenas movimentações da reserva do usuário autenticado

### Requirement: Isolamento de dados entre usuários

O sistema SHALL garantir que cada usuário acesse e modifique apenas sua própria reserva.

#### Scenario: Usuário não visualiza reserva de outro usuário

- GIVEN existem dois usuários cadastrados
- AND ambos possuem reservas configuradas
- WHEN o primeiro usuário envia uma requisição `GET /reserve`
- THEN o sistema SHALL retornar apenas a reserva do primeiro usuário
- AND a resposta SHALL NOT conter dados da reserva do segundo usuário

#### Scenario: Usuário não modifica reserva de outro usuário

- GIVEN existem dois usuários cadastrados
- AND ambos possuem reservas configuradas
- WHEN o primeiro usuário registra depósito, saque ou atualização de meses de proteção
- THEN o sistema SHALL modificar apenas a reserva do primeiro usuário
- AND a reserva do segundo usuário SHALL permanecer inalterada
