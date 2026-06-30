# Design: Refinar Regras de Renda, Objetivos e Dashboard

## Visão geral

Esta mudança refina regras de negócio observadas durante o teste da interface web.

Os ajustes principais são:

1. renda mensal recorrente;
2. dashboard considerando renda mensal em meses futuros;
3. validação correta do aporte mensal em objetivos;
4. ajustes de exibição no dashboard da interface web.

## Decisões técnicas

### Renda mensal recorrente

O sistema já possui `Income.type`.

A renda do tipo `MONTHLY` SHALL ser tratada como recorrente.

O campo `referenceMonth` de renda mensal SHALL representar o mês a partir do qual aquela renda passa a valer.

Exemplo:

    title = Salário
    type = MONTHLY
    amountInCents = 1200000
    referenceMonth = 2026-06

Essa renda SHALL ser considerada em:

    2026-06
    2026-07
    2026-08
    ...

até que seja editada ou removida.

### Renda extra pontual

A renda do tipo `EXTRA` SHALL continuar sendo pontual.

Ela só deve ser considerada no mês de `referenceMonth`.

Exemplo:

    title = Freelance
    type = EXTRA
    amountInCents = 100000
    referenceMonth = 2026-06

Essa renda SHALL ser considerada em junho de 2026, mas não em julho de 2026.

### Consulta de rendas por mês

Ao consultar:

    GET /incomes?month=YYYY-MM

O sistema SHALL retornar:

- rendas `MONTHLY` cujo `referenceMonth` seja menor ou igual ao mês consultado;
- rendas `EXTRA` cujo `referenceMonth` seja igual ao mês consultado.

### Dashboard

Ao consultar:

    GET /dashboard/summary?month=YYYY-MM

O dashboard SHALL calcular renda mensal usando rendas recorrentes.

Regra:

    monthlyIncomeInCents = soma das rendas MONTHLY com referenceMonth <= mês consultado
    extraIncomeInCents = soma das rendas EXTRA com referenceMonth dentro do mês consultado
    totalIncomeInCents = monthlyIncomeInCents + extraIncomeInCents

### Objetivos financeiros

O sistema já calcula `suggestedMonthlyAmountInCents`.

A criação de objetivo SHALL validar também o aporte mensal informado pelo usuário.

Regra:

    if monthlyAmountInCents < suggestedMonthlyAmountInCents:
      reject GOAL_MONTHLY_AMOUNT_TOO_LOW

Exemplo:

    targetAmountInCents = 1500000
    monthsUntilDeadline = 6
    suggestedMonthlyAmountInCents = 250000
    monthlyAmountInCents = 125000

Resultado esperado:

    rejeitar com GOAL_MONTHLY_AMOUNT_TOO_LOW

### Viabilidade financeira

Após validar que o aporte mensal informado é suficiente para cumprir o prazo, o sistema SHALL continuar validando se esse aporte cabe na sobra mensal livre.

Regra:

    if monthlyAmountInCents > availableMonthlyAmountInCents:
      reject GOAL_NOT_FINANCIALLY_FEASIBLE

Portanto, as duas validações são necessárias:

    monthlyAmountInCents >= suggestedMonthlyAmountInCents
    monthlyAmountInCents <= availableMonthlyAmountInCents

### Sugestão de aporte

A API SHALL retornar dados de viabilidade sempre que possível.

Em caso de aporte mensal baixo, a resposta SHOULD incluir:

- `suggestedMonthlyAmountInCents`
- `monthsUntilDeadline`

Isso permite que a interface oriente o usuário.

### Alertas do dashboard na UI

Atualmente a interface exibe a mensagem amigável e também o código técnico do alerta.

Exemplo atual indesejado:

    Sua reserva ainda está abaixo da meta de proteção.
    RESERVE_BELOW_TARGET

A interface SHALL exibir apenas a mensagem amigável e a severidade.

Exemplo esperado:

    Sua reserva ainda está abaixo da meta de proteção.
    Média

O código técnico do alerta poderá continuar existindo internamente, mas não deverá ser exibido ao usuário final.

### Card de dívidas abertas na UI

O card de dívidas abertas SHALL exibir a quantidade e o valor em formato mais claro.

Formato esperado:

    Dívidas abertas
    Dívidas totais - 1
    R$ 7.600,00

O valor usado SHALL continuar vindo de `openDebtBalanceInCents`.

A quantidade usada SHALL continuar vindo de `openDebtsCount`.

### Formulário de objetivos na UI

O formulário de criação de objetivos SHALL exibir o aporte mensal sugerido quando o usuário informar:

- valor alvo;
- prazo/data limite.

Cálculo esperado no frontend:

    suggestedMonthlyAmountInCents = ceil(targetAmountInCents / monthsUntilDeadline)

Esse cálculo serve apenas para feedback visual.

A validação definitiva SHALL continuar no backend.

Se o usuário informar aporte mensal abaixo do sugerido, a interface SHALL exibir um alerta antes ou durante o envio.

Se a API retornar `GOAL_MONTHLY_AMOUNT_TOO_LOW`, a interface SHALL exibir mensagem amigável.

Exemplo de mensagem:

    O aporte mensal informado é menor que o necessário para atingir este objetivo no prazo escolhido.

## Áreas afetadas

- módulo de rendas
- módulo de objetivos
- módulo de dashboard
- interface web do dashboard
- interface web de objetivos
- testes unitários
- testes de integração
- build do frontend

## Sem nova migration

Esta change SHOULD NOT exigir migration.

A semântica do campo `referenceMonth` será refinada para rendas mensais.

## Mapeamento de erros

| Caso | HTTP Status | Código |
|---|---:|---|
| Aporte mensal abaixo do necessário | 400 | GOAL_MONTHLY_AMOUNT_TOO_LOW |
| Objetivo financeiramente inviável | 422 | GOAL_NOT_FINANCIALLY_FEASIBLE |

## Testes unitários

### Incomes

- renda mensal aparece no mês de referência;
- renda mensal aparece em mês futuro;
- renda extra aparece apenas no mês de referência;
- renda extra não aparece em mês futuro.

### Dashboard

- dashboard considera renda mensal em mês futuro;
- dashboard não zera renda mensal recorrente;
- dashboard considera renda extra apenas no mês correto;
- dashboard calcula sobra prevista corretamente com renda recorrente.

### Goals

- cálculo de aporte mensal sugerido;
- rejeição de aporte mensal abaixo do sugerido;
- aceite de aporte mensal igual ao sugerido;
- aceite de aporte mensal acima do sugerido quando couber na sobra;
- rejeição de aporte mensal acima da sobra disponível;
- retorno de erro `GOAL_MONTHLY_AMOUNT_TOO_LOW`.

### Web UI

- alertas do dashboard não exibem código técnico;
- card de dívidas abertas exibe quantidade no formato `Dívidas totais - {quantidade}`;
- card de dívidas abertas exibe valor total em aberto;
- formulário de objetivo exibe aporte mensal sugerido;
- formulário de objetivo trata erro `GOAL_MONTHLY_AMOUNT_TOO_LOW`.

## Testes de integração

- criar renda mensal em junho e consultar dashboard de julho;
- criar renda extra em junho e consultar dashboard de julho;
- consultar `/incomes?month=2026-07` e receber renda mensal recorrente;
- criar objetivo com aporte mensal menor que o mínimo e receber erro;
- criar objetivo com aporte mensal adequado e sobra suficiente;
- criar objetivo com aporte mensal adequado, mas acima da sobra, e receber erro de inviabilidade.
