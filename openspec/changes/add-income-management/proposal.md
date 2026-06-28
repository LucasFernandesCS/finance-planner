# Proposta: Adicionar Gerenciamento de Rendas

## Intenção

Adicionar a funcionalidade que permite ao usuário autenticado registrar, atualizar, listar e remover rendas.

Essa funcionalidade é a base para o dashboard financeiro do sistema, pois define quanto dinheiro o usuário espera receber em um determinado mês.

O usuário deve conseguir registrar tanto uma renda mensal recorrente, como salário, quanto rendas extras daquele mês, como herança, devolução de empréstimo, bônus, comissão ou qualquer outro recebimento pontual.

A implementação deve seguir TDD, criando primeiro testes unitários e testes de integração, e somente depois o código de produção.

## Estado atual

O sistema possui autenticação com registro, login e tokens.

Ainda não existe funcionalidade para o usuário registrar quanto recebe mensalmente ou adicionar rendas extras de um mês.

## Estado desejado

O sistema SHALL permitir que um usuário autenticado:

- adicione uma renda mensal
- adicione uma renda extra
- liste suas rendas de um mês
- atualize uma renda própria
- remova uma renda própria

O sistema SHALL impedir que um usuário acesse, edite ou remova rendas pertencentes a outro usuário.

O sistema SHALL rejeitar rendas inválidas, incluindo:

- valor negativo
- valor zerado
- campos obrigatórios ausentes
- valor acima do limite permitido
- título muito longo

## Escopo

### Dentro do escopo

- Criar model de renda.
- Associar renda ao usuário autenticado.
- Criar endpoint para adicionar renda.
- Criar endpoint para listar rendas do usuário por mês.
- Criar endpoint para atualizar renda.
- Criar endpoint para remover renda.
- Permitir renda do tipo mensal.
- Permitir renda do tipo extra.
- Validar valores monetários.
- Validar título da renda.
- Garantir isolamento por usuário autenticado.
- Criar testes unitários.
- Criar testes de integração.

### Fora do escopo

- Dashboard financeiro.
- Gráficos.
- Média histórica calculada.
- Auditoria detalhada de alterações.
- Recorrência automática mensal.
- Compartilhamento de renda entre membros da família.
- Permissões de grupo familiar.
- Frontend.
- Importação de extrato bancário.

## Histórico de renda

O sistema deve preservar rendas por mês de referência.

Exemplo:

- Janeiro: salário de R$ 1.621,00
- Junho: salário de R$ 2.120,00

Essa abordagem permite gerar gráficos futuramente sem precisar implementar auditoria completa agora.

Nesta change, o histórico é representado pelos registros mensais de renda. Um sistema mais avançado de auditoria, com histórico de cada edição, poderá ser criado em mudança futura.

## Usuários afetados

- Usuários autenticados que desejam informar sua renda mensal.
- Usuários autenticados que desejam registrar dinheiro extra recebido em um mês.
- Funcionalidades futuras de dashboard e planejamento financeiro.

## Critérios de sucesso

- Usuário autenticado consegue adicionar renda mensal.
- Usuário autenticado consegue adicionar renda extra.
- Usuário autenticado consegue listar suas rendas de um mês.
- Usuário autenticado consegue atualizar uma renda própria.
- Usuário autenticado consegue remover uma renda própria.
- Usuário não consegue alterar renda de outro usuário.
- Sistema rejeita renda negativa.
- Sistema rejeita renda zerada.
- Sistema rejeita renda sem campos obrigatórios.
- Sistema rejeita renda acima do limite permitido.
- Sistema rejeita renda com título muito longo.
- Testes unitários passam.
- Testes de integração passam.
- CI continua passando.

## Riscos

- Usar número decimal diretamente em JavaScript pode gerar erros de precisão.
- Permitir `userId` no body pode abrir falhas de segurança.
- Não validar ownership pode permitir que um usuário altere renda de outro.
- Não preservar renda por mês pode dificultar gráficos futuros.

## Plano de rollback

Se a funcionalidade causar problemas, reverter a change e remover a migration relacionada ao model de renda.

Como a funcionalidade é nova, o rollback é de baixo risco enquanto não houver dados reais de produção.
