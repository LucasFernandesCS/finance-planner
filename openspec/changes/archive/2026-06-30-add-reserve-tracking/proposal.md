# Proposta: Adicionar Acompanhamento de Reserva de Emergência

## Intenção

Adicionar a funcionalidade que permite ao usuário autenticado configurar, acompanhar e movimentar sua reserva de emergência.

A reserva de emergência representa um valor guardado para proteger o usuário por uma quantidade definida de meses.

Diferente de objetivos financeiros comuns, a reserva não possui um valor alvo fixo digitado manualmente pelo usuário.

A meta da reserva SHALL ser calculada dinamicamente com base na soma das despesas fixas mensais do usuário multiplicada pela quantidade de meses de proteção desejada.

```txt
Meta da Reserva = Soma das Despesas Fixas Mensais × Quantidade de Meses de Proteção
```

Isso significa que, se o usuário cadastrar uma nova despesa fixa, remover uma despesa fixa ou alterar o valor de uma despesa fixa, a meta da reserva deverá ser recalculada automaticamente.

A implementação deverá seguir TDD, criando primeiro testes unitários e testes de integração, e somente depois o código de produção.

## Estado atual

O sistema já possui:

- autenticação
- perfil do usuário
- gerenciamento de rendas
- gerenciamento de despesas fixas
- gerenciamento de despesas variáveis
- gerenciamento de objetivos financeiros
- gerenciamento de dívidas

Ainda não existe funcionalidade para configurar e acompanhar reserva de emergência.

## Estado desejado

O sistema SHALL permitir que um usuário autenticado:

- configure sua reserva de emergência
- informe quantos meses de proteção deseja
- visualize a meta calculada dinamicamente
- visualize o saldo atual da reserva
- visualize o percentual de conclusão da reserva
- registre depósitos na reserva
- registre saques da reserva
- acompanhe o histórico de movimentações
- tenha o status da reserva atualizado automaticamente

O sistema SHALL impedir que um usuário acesse, edite, deposite ou saque da reserva de outro usuário.

## Escopo

### Dentro do escopo

- Criar model `EmergencyReserve`.
- Criar model `ReserveTransaction`.
- Criar status específicos para reserva.
- Criar tipos de movimentação da reserva.
- Criar endpoint para consultar reserva.
- Criar endpoint para configurar reserva.
- Criar endpoint para atualizar meses de proteção.
- Criar endpoint para registrar depósito.
- Criar endpoint para registrar saque.
- Criar endpoint para listar movimentações da reserva.
- Calcular meta da reserva dinamicamente com base nas despesas fixas.
- Recalcular percentual de conclusão dinamicamente.
- Atualizar status da reserva automaticamente.
- Rejeitar meses de proteção menor que 1.
- Rejeitar configuração sem despesas fixas cadastradas.
- Rejeitar saque maior que saldo atual.
- Garantir isolamento por usuário.
- Criar testes unitários.
- Criar testes de integração.

### Fora do escopo

- Frontend.
- Dashboard.
- Conta bancária interna.
- Integração bancária.
- Rendimento automático da reserva.
- Juros.
- Investimentos.
- Separação da reserva por contas diferentes.
- Reserva compartilhada entre usuários.
- Reserva familiar.
- Notificações.
- Auditoria detalhada.
- Transferência real entre contas.
- Criação de despesa variável reflexa para depósito na reserva.

## Regra importante sobre fluxo de caixa

Nesta change, depósito na reserva não será tratado como despesa variável.

A reserva representa dinheiro guardado, não consumo.

Como ainda não existe módulo de conta bancária interna, a movimentação da reserva será registrada apenas no histórico da própria reserva.

No futuro, quando existir conta bancária interna ou fluxo de caixa mais completo, depósitos e saques poderão ser tratados como transferências entre contas.

## Regra importante sobre cálculo dinâmico

O sistema SHALL NOT armazenar a meta da reserva como valor fixo principal.

A meta SHALL ser calculada no momento da consulta ou operação, usando:

```txt
targetAmountInCents = monthlyFixedExpensesInCents × protectionMonths
```

O sistema poderá retornar a meta calculada na resposta, mas ela não deverá ser a fonte principal da verdade.

## Status da reserva

O sistema SHALL usar os seguintes status:

```txt
BUILDING
PROTECTED
REPLENISHING
```

Significados:

- `BUILDING`: reserva ainda está em construção e nunca atingiu a meta.
- `PROTECTED`: reserva atingiu ou ultrapassou 100% da meta.
- `REPLENISHING`: reserva já esteve protegida, mas caiu abaixo da meta por saque ou aumento do custo de vida.

## Critérios de sucesso

- Usuário autenticado consegue configurar reserva com meses de proteção válidos.
- Sistema calcula meta da reserva multiplicando despesas fixas mensais por meses de proteção.
- Sistema rejeita meses de proteção menor que 1.
- Sistema rejeita criação/configuração da reserva quando o usuário não possui despesas fixas.
- Usuário autenticado consegue consultar a própria reserva.
- Usuário autenticado consegue registrar depósito.
- Depósito aumenta corretamente o saldo atual.
- Usuário autenticado consegue registrar saque.
- Saque reduz corretamente o saldo atual.
- Sistema rejeita saque maior que saldo atual.
- Sistema recalcula a meta quando despesas fixas aumentam.
- Sistema recalcula a meta quando despesas fixas diminuem.
- Sistema recalcula percentual de conclusão.
- Sistema muda status para `PROTECTED` quando saldo atinge ou supera a meta.
- Sistema muda status para `REPLENISHING` quando uma reserva protegida fica abaixo da meta.
- Sistema muda status para `PROTECTED` quando a meta diminui e o saldo atual passa a cobrir a reserva.
- Usuário não consegue visualizar reserva de outro usuário.
- Usuário não consegue modificar reserva de outro usuário.
- Testes unitários passam.
- Testes de integração passam.
- CI continua passando.

## Riscos

- Armazenar a meta como valor fixo pode deixar a reserva desatualizada após mudança nas despesas fixas.
- Tratar depósito em reserva como despesa pode distorcer o fluxo de caixa.
- Permitir saque maior que o saldo pode gerar saldo negativo.
- Não diferenciar `BUILDING` de `REPLENISHING` pode esconder quando o usuário perdeu uma proteção que já tinha alcançado.
- Calcular status sem considerar o histórico anterior pode dificultar saber se a reserva está em construção ou reposição.
- Permitir `userId` no body pode abrir falha de segurança.

## Plano de rollback

Se a funcionalidade causar problemas, reverter a change e remover as migrations relacionadas aos models `EmergencyReserve` e `ReserveTransaction`.

Como a funcionalidade é nova, o rollback é de baixo risco enquanto não houver dados reais de produção.
