# Proposta: Adicionar Gerenciamento de Dívidas

## Intenção

Adicionar a funcionalidade que permite ao usuário autenticado registrar, listar, atualizar, remover e pagar dívidas.

Uma dívida representa um compromisso financeiro em aberto, como empréstimo bancário, financiamento de carro, dívida com amigo, cartão rotativo, parcelamento ou outro débito que gere saídas de caixa futuras.

A dívida em si não será tratada como uma despesa única. O que entra no fluxo de caixa como saída é o pagamento realizado da dívida.

Quando o usuário registra um pagamento, o sistema deverá:

- reduzir o saldo devedor da dívida
- registrar o histórico de pagamento
- criar uma despesa variável reflexa referente à saída de caixa
- alterar o status da dívida automaticamente quando necessário

A implementação deverá seguir TDD, criando primeiro testes unitários e testes de integração, e somente depois o código de produção.

## Estado atual

O sistema já possui:

- autenticação
- perfil do usuário
- gerenciamento de rendas
- gerenciamento de despesas fixas
- gerenciamento de despesas variáveis
- gerenciamento de objetivos financeiros

Ainda não existe funcionalidade para registrar dívidas, acompanhar saldo devedor ou registrar pagamentos de dívidas.

## Estado desejado

O sistema SHALL permitir que um usuário autenticado:

- crie uma dívida
- liste suas dívidas
- visualize uma dívida específica
- atualize uma dívida própria
- remova uma dívida própria
- registre pagamento de uma dívida própria
- acompanhe o saldo devedor atualizado
- acompanhe o histórico de pagamentos
- tenha a dívida marcada como quitada quando o saldo chegar a zero
- tenha a dívida marcada como atrasada quando houver vencimento pendente não pago

O sistema SHALL impedir que um usuário acesse, edite, remova ou pague dívidas pertencentes a outro usuário.

## Escopo

### Dentro do escopo

- Criar model `Debt`.
- Criar model `DebtPayment`.
- Associar dívidas ao usuário autenticado.
- Criar tipos de dívida.
- Criar status de dívida.
- Criar endpoints de criação, listagem, busca, atualização e remoção de dívida.
- Criar endpoint de pagamento de dívida.
- Reduzir saldo devedor ao registrar pagamento.
- Impedir pagamento maior que saldo devedor.
- Atualizar status para `PAID` quando o saldo chegar a zero.
- Atualizar status para `OVERDUE` quando a dívida estiver vencida e sem pagamento no mês.
- Criar despesa variável reflexa ao registrar pagamento.
- Criar testes unitários.
- Criar testes de integração.

### Fora do escopo

- Frontend.
- Dashboard.
- Conta bancária interna.
- Cartão de crédito completo.
- Juros compostos automáticos.
- Multa automática por atraso.
- Renegociação de dívida.
- Parcelamento detalhado com tabela de parcelas.
- Integração bancária.
- Notificações de vencimento.
- Job/cron em background para marcar dívidas atrasadas.
- Auditoria detalhada.
- Grupo familiar.
- Permissões avançadas.

## Regra importante sobre atraso

No MVP, o sistema não terá job em background.

Portanto, a atualização automática para `OVERDUE` SHALL acontecer de forma preguiçosa durante operações do próprio módulo, como:

- listar dívidas
- buscar dívida específica
- registrar pagamento

Isso significa que o sistema recalcula o status com base na data atual sempre que a dívida é consultada ou manipulada.

## Regra importante sobre fluxo de caixa

Como ainda não existe módulo de conta bancária interna, o pagamento da dívida SHALL gerar uma despesa variável reflexa.

Exemplo:

```txt
Dívida: Financiamento de carro
Pagamento: R$ 500,00
Resultado:
- saldo devedor diminui R$ 500,00
- histórico de pagamento é criado
- despesa variável é criada no mês do pagamento
```

A despesa variável reflexa permitirá que o dashboard futuro considere o pagamento da dívida como saída real de caixa.

## Critérios de sucesso

- Usuário autenticado consegue criar dívida válida.
- Usuário autenticado consegue listar apenas suas dívidas.
- Usuário autenticado consegue atualizar dívida própria.
- Usuário autenticado consegue remover dívida própria.
- Usuário autenticado consegue registrar pagamento em dívida própria.
- Pagamento reduz corretamente o saldo devedor.
- Pagamento cria histórico em `DebtPayment`.
- Pagamento cria despesa variável reflexa.
- Sistema rejeita dívida com valor negativo.
- Sistema rejeita dívida com valor zerado.
- Sistema rejeita dívida sem campos obrigatórios.
- Sistema rejeita dívida com título muito longo.
- Sistema rejeita dívida com valor acima do limite.
- Sistema rejeita pagamento negativo.
- Sistema rejeita pagamento zerado.
- Sistema rejeita pagamento maior que saldo devedor.
- Sistema altera status para `PAID` quando saldo chega a zero.
- Sistema altera status para `OVERDUE` quando a dívida está vencida e sem pagamento no mês.
- Usuário não consegue gerenciar dívida de outro usuário.
- Testes unitários passam.
- Testes de integração passam.
- CI continua passando.

## Riscos

- Tratar a dívida como despesa única pode distorcer o fluxo de caixa.
- Permitir pagamento maior que o saldo pode gerar saldo negativo.
- Atualizar saldo e histórico fora de transação pode gerar inconsistência.
- Criar pagamento sem despesa reflexa pode fazer o dashboard ignorar a saída de caixa.
- Marcar atraso sem job em background exige uma estratégia clara de recalcular status durante consultas.
- Permitir `userId` no body pode abrir falha de segurança.

## Plano de rollback

Se a funcionalidade causar problemas, reverter a change e remover as migrations relacionadas aos models `Debt` e `DebtPayment`.

Como a funcionalidade é nova, o rollback é de baixo risco enquanto não houver dados reais de produção.
