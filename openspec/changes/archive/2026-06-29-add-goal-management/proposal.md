# Proposta: Adicionar Gerenciamento de Objetivos Financeiros

## Intenção

Adicionar a funcionalidade que permite ao usuário autenticado criar, listar, atualizar e acompanhar objetivos financeiros.

O objetivo financeiro representa uma meta que o usuário deseja alcançar, como comprar um notebook, uma passagem, um carro, uma casa ou qualquer outro sonho.

O sistema deverá calcular se o objetivo é financeiramente viável com base na renda mensal, nas despesas fixas e nos compromissos já assumidos com outros objetivos ativos.

A implementação deverá seguir TDD, criando primeiro testes unitários e testes de integração, e somente depois o código de produção.

## Estado atual

O sistema já possui:

- autenticação
- gerenciamento de rendas
- gerenciamento de despesas fixas
- gerenciamento de despesas variáveis

Ainda não existe funcionalidade para cadastro de objetivos financeiros.

## Estado desejado

O sistema SHALL permitir que um usuário autenticado:

- crie objetivos financeiros
- liste seus objetivos
- visualize o cálculo de viabilidade de um objetivo
- registre depósitos/aportes mensais em um objetivo
- acompanhe o valor atual acumulado
- tenha o status do objetivo atualizado automaticamente quando atingir o valor alvo

O sistema SHALL impedir que um usuário acesse, edite, deposite ou remova objetivos pertencentes a outro usuário.

## Escopo

### Dentro do escopo

- Criar model de objetivo financeiro.
- Criar model de histórico de aportes do objetivo.
- Associar objetivos ao usuário autenticado.
- Criar cálculo de parcela mínima sugerida.
- Criar cálculo de sobra mensal disponível.
- Considerar renda mensal e despesas fixas no cálculo de viabilidade.
- Considerar objetivos ativos existentes no cálculo da sobra livre.
- Validar objetivo financeiramente inviável.
- Criar endpoints de criação, listagem, atualização e remoção de objetivos.
- Criar endpoint de depósito/aporte no objetivo.
- Atualizar automaticamente o status para `ACHIEVED` quando o valor atual atingir ou superar o valor alvo.
- Criar testes unitários.
- Criar testes de integração.

### Fora do escopo

- Frontend.
- Dashboard.
- Gráficos.
- Conta bancária interna.
- Extrato financeiro completo.
- Transferência entre contas.
- Integração bancária.
- Notificações.
- Juros ou rendimento sobre o valor guardado.
- Objetivos compartilhados entre usuários.
- Objetivos familiares.
- Parcelamento complexo.
- Regras de investimento.

## Regras principais

O sistema SHALL calcular:

```txt
sobraMensal = rendaMensal - despesasFixasAtivas
```

Depois, para novos objetivos, o sistema SHALL considerar também os objetivos ativos existentes:

```txt
sobraLivreParaNovoObjetivo = sobraMensal - somaDasParcelasDeObjetivosAtivos
```

O valor mensal mínimo sugerido SHALL ser:

```txt
valorMensalSugerido = valorAlvo / prazoEmMeses
```

Usando arredondamento para cima em centavos, para garantir que o objetivo seja atingido dentro do prazo.

## Exemplo

Se o usuário possui:

```txt
Renda mensal: R$ 5.000,00
Despesas fixas: R$ 3.500,00
Sobra mensal: R$ 1.500,00
Objetivo: Notebook de R$ 15.000,00
Prazo: 8 meses
```

O sistema calcula:

```txt
R$ 15.000,00 / 8 = R$ 1.875,00 por mês
```

Como R$ 1.875,00 é maior que R$ 1.500,00, o objetivo é inviável no prazo informado.

Resposta esperada:

```txt
Aviso de Viabilidade: Para atingir este objetivo em 8 meses, você precisaria guardar R$ 1.875,00/mês, mas sua sobra atual é de R$ 1.500,00.

Sugestão: Aumente o prazo para pelo menos 10 meses ou reduza o valor do objetivo para até R$ 12.000,00 nesse prazo.
```

## Critérios de sucesso

- Usuário autenticado consegue criar objetivo viável.
- Objetivo criado inicia com status `NOT_STARTED`.
- Sistema calcula valor mensal sugerido corretamente.
- Sistema valida se o objetivo cabe na sobra mensal livre.
- Sistema rejeita objetivo financeiramente inviável.
- Sistema rejeita objetivo com valor negativo.
- Sistema rejeita objetivo com valor zerado.
- Sistema rejeita objetivo sem campos obrigatórios.
- Sistema rejeita objetivo com data limite no passado ou hoje.
- Sistema rejeita objetivo com título muito longo.
- Sistema rejeita objetivo com valor acima do limite permitido.
- Usuário não consegue criar objetivo para outro usuário.
- Usuário lista apenas seus próprios objetivos.
- Sistema considera outros objetivos ativos ao calcular sobra livre.
- Usuário consegue registrar depósito em objetivo próprio.
- Depósito alimenta histórico do objetivo.
- Depósito aumenta o valor atual do objetivo.
- Sistema altera status para `ACHIEVED` automaticamente quando o objetivo é atingido.
- Testes unitários passam.
- Testes de integração passam.
- CI continua passando.

## Riscos

- Cálculo de prazo em meses pode gerar inconsistências se não for padronizado.
- Valores monetários com ponto flutuante podem gerar erro de precisão.
- Não considerar objetivos ativos pode permitir que o usuário comprometa a mesma sobra várias vezes.
- Permitir `userId` no body pode abrir falha de segurança.
- Atualizar valor atual e histórico fora de transação pode gerar inconsistência.

## Plano de rollback

Se a funcionalidade causar problemas, reverter a change e remover as migrations relacionadas aos models de objetivos e aportes.

Como a funcionalidade é nova, o rollback é de baixo risco enquanto não houver dados reais de produção.
