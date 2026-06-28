# Proposta: Adicionar Gerenciamento de Despesas

## Intenção

Adicionar a funcionalidade que permite ao usuário autenticado registrar, listar, atualizar e remover suas despesas.

O sistema deverá lidar com dois tipos principais de despesas:

- despesas fixas
- despesas variáveis

Despesas fixas representam gastos recorrentes, como água, energia, condomínio, aluguel, IPVA e IPTU. O usuário cadastra uma despesa fixa uma vez, e ela passa a ser considerada nos meses futuros enquanto estiver ativa.

Despesas variáveis representam gastos pontuais de um mês específico, como iFood, Uber, compras, lazer ou despesas ocasionais.

Essa funcionalidade é necessária para permitir que o sistema calcule futuramente sobra prevista, orçamento mensal, dashboard financeiro e progresso em direção a objetivos.

A implementação deve seguir TDD, criando primeiro testes unitários e testes de integração, e somente depois o código de produção.

## Estado atual

O sistema já possui autenticação e gerenciamento de rendas.

Ainda não existe funcionalidade para o usuário registrar despesas fixas ou despesas variáveis.

## Estado desejado

O sistema SHALL permitir que um usuário autenticado:

- adicione uma despesa fixa
- liste suas despesas fixas
- atualize uma despesa fixa própria
- remova uma despesa fixa própria
- adicione uma despesa variável
- liste suas despesas variáveis por mês
- atualize uma despesa variável própria
- remova uma despesa variável própria

O sistema SHALL impedir que um usuário acesse, edite ou remova despesas pertencentes a outro usuário.

O sistema SHALL rejeitar despesas inválidas, incluindo:

- valor negativo
- valor zerado
- campos obrigatórios ausentes
- valor acima do limite permitido
- título muito longo
- categoria inválida
- mês de referência inválido

## Escopo

### Dentro do escopo

- Criar model de despesa fixa.
- Criar model de despesa variável.
- Associar despesas ao usuário autenticado.
- Criar endpoints para despesas fixas.
- Criar endpoints para despesas variáveis.
- Criar categorias de despesas.
- Validar valores monetários em centavos.
- Validar título da despesa.
- Validar mês de referência quando aplicável.
- Garantir isolamento por usuário autenticado.
- Criar testes unitários.
- Criar testes de integração.

### Fora do escopo

- Dashboard financeiro.
- Gráficos.
- Orçamento por categoria.
- Limites mensais de gastos.
- Cartão de crédito.
- Parcelamento de compras.
- Recorrência avançada com regras complexas.
- Auditoria detalhada de alterações.
- Frontend.
- Compartilhamento entre membros de família.
- Notificações de vencimento.

## Usuários afetados

- Usuários autenticados que desejam controlar suas despesas fixas.
- Usuários autenticados que desejam registrar despesas variáveis de um mês.
- Funcionalidades futuras de dashboard, planejamento e cálculo de sobra mensal.

## Critérios de sucesso

- Usuário autenticado consegue adicionar despesa fixa.
- Usuário autenticado consegue adicionar despesa variável.
- Usuário autenticado consegue listar suas despesas fixas.
- Usuário autenticado consegue listar suas despesas variáveis por mês.
- Usuário autenticado consegue atualizar uma despesa própria.
- Usuário autenticado consegue remover uma despesa própria.
- Usuário não consegue alterar despesa de outro usuário.
- Sistema rejeita despesa negativa.
- Sistema rejeita despesa zerada.
- Sistema rejeita despesa sem campos obrigatórios.
- Sistema rejeita despesa acima do limite permitido.
- Sistema rejeita despesa com título muito longo.
- Testes unitários passam.
- Testes de integração passam.
- CI continua passando.

## Riscos

- Usar número decimal diretamente em JavaScript pode gerar problemas de precisão monetária.
- Permitir `userId` no body pode abrir falha de segurança.
- Não validar ownership pode permitir que um usuário altere despesa de outro.
- Remover uma despesa fixa sem considerar histórico pode afetar dashboards futuros.
- Misturar regras de despesa fixa e variável em um único model pode deixar a regra de recorrência confusa.

## Plano de rollback

Se a funcionalidade causar problemas, reverter a change e remover as migrations relacionadas aos models de despesas.

Como a funcionalidade é nova, o rollback é de baixo risco enquanto não houver dados reais de produção.
