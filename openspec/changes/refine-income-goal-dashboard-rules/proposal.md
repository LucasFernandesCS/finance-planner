# Proposta: Refinar Regras de Renda, Objetivos e Dashboard

## Intenção

Refinar regras importantes identificadas durante o uso da interface web do MVP.

Foram encontrados três pontos que precisam de ajuste:

1. A renda mensal deve ser recorrente e continuar aparecendo em meses futuros até ser alterada ou removida.
2. O dashboard deve considerar a renda mensal recorrente ao consultar meses futuros.
3. A criação de objetivos deve validar corretamente o aporte mensal informado pelo usuário em relação ao prazo e valor alvo.

Esses ajustes garantem que o sistema se comporte de forma mais próxima da realidade financeira do usuário.

## Estado atual

O sistema já possui:

- gerenciamento de rendas
- gerenciamento de objetivos financeiros
- dashboard summary
- interface web em implementação

Durante os testes visuais da UI, foi observado que:

- ao consultar o mês seguinte, a renda fica zerada;
- o dashboard passa a mostrar sobra negativa mesmo quando o usuário tem uma renda mensal fixa;
- o sistema permite criar objetivo com aporte mensal menor que o necessário para cumprir o prazo;
- o dashboard visual está exibindo informações técnicas de alerta na UI.

## Estado desejado

O sistema SHALL tratar renda do tipo `MONTHLY` como recorrente.

Uma renda mensal cadastrada em determinado mês SHALL continuar sendo considerada nos meses seguintes até que seja atualizada ou removida.

O sistema SHALL tratar renda do tipo `EXTRA` como pontual, válida apenas para o mês de referência.

O dashboard SHALL considerar rendas mensais recorrentes ao calcular meses futuros.

A criação de objetivos SHALL rejeitar `monthlyAmountInCents` menor que o aporte mensal mínimo necessário para atingir o objetivo dentro do prazo.

## Escopo

### Dentro do escopo

- Refinar regra de renda mensal recorrente.
- Ajustar listagem de rendas por mês.
- Ajustar cálculo de renda no dashboard.
- Ajustar cálculo de renda mensal no fluxo de objetivos, quando aplicável.
- Refinar validação de criação de objetivo.
- Rejeitar objetivo quando o aporte mensal informado for menor que o aporte mínimo calculado.
- Garantir que o backend retorne erro adequado quando o aporte mensal for insuficiente.
- Atualizar testes unitários.
- Atualizar testes de integração.
- Atualizar a interface web para não exibir códigos técnicos de alerta.
- Ajustar card de dívidas abertas no dashboard.
- Exibir aporte mensal sugerido no formulário de objetivos.

### Fora do escopo

- Criar novo model de renda recorrente.
- Criar tabela de histórico salarial avançado.
- Criar agendamento automático de rendas.
- Criar projeções avançadas.
- Criar gráficos.
- Alterar autenticação.
- Alterar banco de dados, salvo se for estritamente necessário.
- Redesenhar completamente a interface web.
- Implementar responsividade refinada.
- Implementar deploy.

## Regras principais

Renda mensal com `Income.type = MONTHLY` SHALL ser considerada recorrente a partir de `referenceMonth`.

Renda extra com `Income.type = EXTRA` SHALL ser considerada apenas no mês de `referenceMonth`.

Para dashboard de mês futuro, a renda mensal deverá continuar aparecendo.

Exemplo:

    Renda mensal criada em junho de 2026: R$ 12.000,00
    Consulta dashboard de julho de 2026
    Resultado esperado: renda mensal = R$ 12.000,00

Para objetivos, o aporte mensal informado deverá obedecer:

    monthlyAmountInCents >= suggestedMonthlyAmountInCents

Onde:

    suggestedMonthlyAmountInCents = ceil(targetAmountInCents / monthsUntilDeadline)

Se o usuário cria um objetivo de R$ 15.000,00 em 6 meses, o aporte mensal mínimo é:

    R$ 15.000,00 / 6 = R$ 2.500,00

Se o usuário informa aporte mensal de R$ 1.250,00, o sistema SHALL rejeitar a criação.

Além disso, o aporte mensal também deverá caber na sobra mensal livre do usuário.

Portanto, para criar um objetivo, as duas regras precisam ser verdadeiras:

    monthlyAmountInCents >= suggestedMonthlyAmountInCents
    monthlyAmountInCents <= availableMonthlyAmountInCents

## Ajustes visuais esperados

A interface web SHALL ajustar a exibição dos alertas do dashboard.

A UI SHALL exibir apenas:

- mensagem amigável do alerta
- badge de severidade

A UI SHALL NOT exibir códigos técnicos como:

- `RESERVE_BELOW_TARGET`
- `NEGATIVE_SURPLUS`
- `NO_INCOME_REGISTERED`

O card de dívidas abertas SHALL exibir:

    Dívidas abertas
    Dívidas totais - 1
    R$ 7.600,00

O formulário de objetivos SHALL exibir o aporte mensal sugerido quando o usuário informar valor alvo e prazo.

## Critérios de sucesso

- Renda mensal aparece no mês em que foi cadastrada.
- Renda mensal aparece em meses futuros.
- Renda extra aparece apenas no mês de referência.
- Renda extra não aparece em meses futuros.
- Dashboard de mês futuro considera renda mensal recorrente.
- Dashboard de mês futuro não zera renda mensal sem motivo.
- Objetivo com aporte mensal abaixo do necessário é rejeitado.
- Objetivo com aporte mensal igual ou maior que o necessário é aceito se houver sobra disponível.
- Objetivo com aporte mensal maior que a sobra disponível continua sendo rejeitado.
- API retorna erro `GOAL_MONTHLY_AMOUNT_TOO_LOW` quando o aporte mensal é insuficiente.
- UI exibe mensagem amigável para `GOAL_MONTHLY_AMOUNT_TOO_LOW`.
- UI não exibe código técnico dos alertas no dashboard.
- UI exibe card de dívidas abertas em formato mais claro.
- UI exibe aporte mensal sugerido no formulário de objetivo.
- Testes unitários passam.
- Testes de integração passam.
- Build do frontend passa.
- CI continua passando.

## Riscos

- Mudar a interpretação de `referenceMonth` pode afetar testes existentes.
- Somar rendas mensais antigas de forma incorreta pode duplicar renda.
- Validar apenas sobra mensal, sem validar aporte mínimo, permite objetivo inconsistente.
- Validar apenas aporte mínimo, sem validar sobra mensal, permite compromisso financeiro inviável.
- Exibir lógica demais na interface pode duplicar regra que pertence ao backend.
- Ajustar UI junto com regra de backend pode aumentar o escopo da change.

## Plano de rollback

Se os ajustes causarem problemas, reverter a change.

Como a proposta não deve exigir migration, o rollback deve ser simples.
