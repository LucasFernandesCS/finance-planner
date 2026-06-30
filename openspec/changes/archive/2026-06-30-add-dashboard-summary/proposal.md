# Proposta: Adicionar Resumo do Dashboard

## Intenção

Adicionar um endpoint de resumo financeiro para alimentar o dashboard do MVP.

O dashboard deverá consolidar os principais dados financeiros do usuário autenticado em uma única resposta, incluindo renda, despesas, fluxo de caixa, dívidas, reserva de emergência, objetivo principal e alertas financeiros.

Esta funcionalidade deverá ser uma camada de leitura e agregação.

O dashboard SHALL NOT criar uma nova fonte de verdade financeira. Ele deverá calcular os valores dinamicamente com base nos dados já existentes no banco.

## Estado atual

O sistema já possui:

- autenticação
- perfil do usuário
- gerenciamento de rendas
- gerenciamento de despesas fixas
- gerenciamento de despesas variáveis
- gerenciamento de objetivos financeiros
- gerenciamento de dívidas
- acompanhamento de reserva de emergência

Ainda não existe um endpoint centralizado que consolide essas informações para a tela inicial.

## Estado desejado

O sistema SHALL permitir que um usuário autenticado consulte um resumo financeiro consolidado através de:

```txt
GET /dashboard/summary
```

O sistema também SHALL permitir consultar o resumo de um mês específico:

```txt
GET /dashboard/summary?month=YYYY-MM
```

O resumo SHALL retornar:

- período considerado
- renda mensal
- renda extra
- renda total
- despesas fixas
- despesas variáveis
- pagamentos de dívida
- despesas totais
- sobra prevista
- sobra recorrente
- dívidas abertas
- dívidas atrasadas
- reserva de emergência
- objetivo principal
- alertas financeiros

O sistema SHALL garantir que o usuário autenticado acesse apenas os próprios dados.

## Escopo

### Dentro do escopo

- Criar endpoint `GET /dashboard/summary`.
- Aceitar query opcional `month=YYYY-MM`.
- Calcular período do dashboard.
- Respeitar `timezone` e `financialMonthStartDay` do perfil do usuário.
- Agregar rendas mensais e extras.
- Agregar despesas fixas e variáveis.
- Separar pagamentos de dívida como detalhamento.
- Evitar contagem duplicada de pagamentos de dívida.
- Calcular sobra prevista.
- Calcular sobra recorrente.
- Agregar dívidas abertas.
- Agregar dívidas atrasadas.
- Retornar reserva de emergência com meta dinâmica.
- Retornar objetivo principal configurado no perfil do usuário.
- Retornar flags de setup quando reserva ou objetivo principal não existirem.
- Gerar alertas financeiros básicos.
- Criar testes unitários.
- Criar testes de integração.

### Fora do escopo

- Frontend.
- Gráficos.
- Histórico mensal completo.
- Comparação com mês anterior.
- Projeções avançadas.
- Ranking de categorias.
- Exportação CSV.
- Exportação PDF.
- Cache do dashboard.
- Notificações.
- Dashboard familiar.
- Permissões avançadas.
- Auditoria.
- Novas tabelas no banco.
- Novas migrations, salvo se a implementação atual estiver faltando algum campo essencial.

## Regra importante sobre fonte da verdade

O dashboard SHALL NOT persistir totais calculados, como:

```txt
totalIncomeInCents
totalExpensesInCents
expectedSurplusInCents
openDebtBalanceInCents
reserveTargetAmountInCents
```

Esses valores SHALL ser calculados dinamicamente a partir dos módulos existentes.

## Regra importante sobre pagamentos de dívida

O pagamento de dívida já gera uma despesa variável reflexa com categoria:

```txt
DEBT_PAYMENT
```

Portanto, o dashboard SHALL considerar pagamentos de dívida como parte das despesas variáveis.

O campo `debtPaymentsInCents` SHALL ser apenas um detalhamento das despesas variáveis.

O sistema SHALL NOT somar `debtPaymentsInCents` novamente no total de despesas.

Exemplo correto:

```txt
totalExpensesInCents = fixedExpensesInCents + variableExpensesInCents
```

Exemplo incorreto:

```txt
totalExpensesInCents = fixedExpensesInCents + variableExpensesInCents + debtPaymentsInCents
```

## Critérios de sucesso

- Usuário autenticado consegue consultar o resumo do dashboard.
- Usuário não autenticado recebe erro 401.
- Usuário visualiza apenas seus próprios dados.
- O dashboard calcula renda mensal corretamente.
- O dashboard calcula renda extra corretamente.
- O dashboard calcula despesas fixas corretamente.
- O dashboard calcula despesas variáveis corretamente.
- O dashboard destaca pagamentos de dívida sem duplicar no total.
- O dashboard calcula sobra prevista corretamente.
- O dashboard calcula sobra recorrente corretamente.
- O dashboard retorna dívidas abertas sem incluir dívidas quitadas.
- O dashboard retorna quantidade de dívidas atrasadas.
- O dashboard retorna reserva configurada com meta dinâmica.
- O dashboard retorna `reserveSetupRequired` quando não existe reserva.
- O dashboard retorna objetivo principal configurado.
- O dashboard retorna `primaryGoalSetupRequired` quando não existe objetivo principal.
- O dashboard gera alerta para sobra negativa.
- O dashboard gera alerta para dívida atrasada.
- O dashboard gera alerta para reserva não configurada.
- O dashboard gera alerta para reserva abaixo da meta.
- O dashboard gera alerta para objetivo principal não definido.
- O dashboard respeita `month=YYYY-MM`.
- O dashboard respeita `financialMonthStartDay`.
- Testes unitários passam.
- Testes de integração passam.
- CI continua passando.

## Riscos

- Contar pagamentos de dívida duas vezes.
- Misturar dados de usuários diferentes.
- Salvar totais calculados e gerar inconsistência.
- Ignorar `financialMonthStartDay` e exibir período incorreto.
- Retornar objetivo principal pertencente a outro usuário.
- Retornar reserva com meta desatualizada.
- Criar uma resposta grande demais para o MVP.

## Plano de rollback

Se a funcionalidade causar problemas, reverter a change.

Como a funcionalidade é uma camada de leitura e não deve criar novas tabelas, o rollback é de baixo risco.
