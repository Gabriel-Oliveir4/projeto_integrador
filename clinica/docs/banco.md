# Banco de dados

O banco é o **MongoDB** (NoSQL, baseado em documentos). Cada "tabela" aqui é uma **coleção** de documentos JSON. Relacionamento entre coleções é feito guardando o `_id` de um documento dentro do outro (chamado de `ref` no Mongoose).

---

## Como tudo se conecta

```
User (fisioterapeuta)
 └── Paciente
      └── PlanoTratamento (só 1 ativo por vez)
           ├── PlanoExercicio  ─── Exercicio
           └── Sessao
                └── SessaoExercicio  ─── Exercicio
```

Lendo de cima pra baixo:

- Um fisio tem vários **pacientes**.
- Cada paciente tem um **plano de tratamento** vigente.
- O plano define quais **exercícios** o paciente vai fazer (via `PlanoExercicio`, que é a ponte entre plano e exercício).
- Quando o fisio agenda uma **sessão**, o sistema copia os exercícios do plano pra dentro dela (via `SessaoExercicio`).
- Isso permite registrar, em cada sessão, o que foi feito **sem alterar o plano original**.

O catálogo de **exercícios** é compartilhado — todos os fisios usam os mesmos.

---

## As coleções

### `User` — o fisioterapeuta

| Campo | Tipo | Observação |
|---|---|---|
| `_id` | ObjectId | identificador único |
| `nome` | string | obrigatório |
| `sobrenome` | string | obrigatório |
| `email` | string | único, usado pra login |
| `senha` | string | guardada com hash (bcrypt), nunca em texto puro |
| `celular` | string | opcional |

### `Paciente`

| Campo | Tipo | Observação |
|---|---|---|
| `_id` | ObjectId | |
| `fisio` | ObjectId → User | dono do paciente |
| `nome` | string | obrigatório |
| `sobrenome` | string | obrigatório |
| `dataNascimento` | Date | opcional |
| `sexo` | string | masculino / feminino / outro |
| `celular` | string | opcional |
| `observacoes` | string | opcional |
| `status` | string | `ativo` ou `inativo` |
| `createdAt`, `updatedAt` | Date | gerados automático |

### `PlanoTratamento`

O "episódio de tratamento" do paciente.

| Campo | Tipo | Observação |
|---|---|---|
| `_id` | ObjectId | |
| `paciente` | ObjectId → Paciente | |
| `queixa` | string | obrigatório |
| `historico` | string | opcional |
| `diagnostico` | string | opcional |
| `objetivo` | string | opcional |
| `frequenciaSemanal` | number | quantas sessões por semana |
| `sessoesPrevistas` | number | total esperado |
| `dataInicio` | Date | opcional |
| `previsaoAlta` | Date | opcional |
| `status` | string | `ativo`, `finalizado` ou `cancelado` |
| `createdAt`, `updatedAt` | Date | |

> **Regra:** ao criar um plano novo, qualquer plano `ativo` anterior do mesmo paciente vira `finalizado`. Só pode existir um ativo por vez.

### `Exercicio` — catálogo

| Campo | Tipo |
|---|---|
| `_id` | ObjectId |
| `nome` | string |
| `descricao` | string |

### `PlanoExercicio` — ponte plano ↔ exercício

Quais exercícios fazem parte de um plano.

| Campo | Tipo |
|---|---|
| `_id` | ObjectId |
| `planotratamento` | ObjectId → PlanoTratamento |
| `exercicio` | ObjectId → Exercicio |
| `ordem` | number |

### `Sessao`

Um atendimento (agendado, em andamento, ou já fechado).

| Campo | Tipo | Observação |
|---|---|---|
| `_id` | ObjectId | |
| `fisio` | ObjectId → User | dono da sessão |
| `paciente` | ObjectId → Paciente | |
| `planoTratamento` | ObjectId → PlanoTratamento | |
| `data` | Date | data e hora da sessão |
| `status` | string | `agendado`, `em_andamento`, `concluido`, `cancelado`, `nao_compareceu` |
| `observacoesGerais` | string | preenchido durante/ao fim |
| `createdAt`, `updatedAt` | Date | |

> **Regra:** não permite duas sessões do mesmo fisio na mesma data/hora se as duas estiverem `agendado` ou `em_andamento`.

### `SessaoExercicio` — exercícios feitos na sessão

Cópia do exercício do plano, com espaço pra anotar o que aconteceu.

| Campo | Tipo | Observação |
|---|---|---|
| `_id` | ObjectId | |
| `sessao` | ObjectId → Sessao | |
| `exercicio` | ObjectId → Exercicio | |
| `status` | string | `realizado`, `adaptado`, `nao_realizado`, `superado` |
| `comentario` | string | opcional |

### `Anexo` (definido mas ainda não usado pela interface)

| Campo | Tipo |
|---|---|
| `_id` | ObjectId |
| `planotratamento` | ObjectId → PlanoTratamento |
| `nomeArquivo` | string |
| `urlArquivo` | string |
| `anotacao` | string (opcional) |

---

## Por que copiar os exercícios pra dentro da sessão?

Porque o plano pode mudar com o tempo — o fisio pode tirar um exercício, trocar por outro, ajustar a ordem. Se o registro de "o que foi feito naquela sessão de terça" apontasse direto pro plano, alterar o plano amanhã ia mexer no histórico de ontem.

Com a cópia, cada sessão fica congelada no tempo: "no dia X, esses eram os exercícios prescritos, e o paciente fez isso com cada um". O plano pode evoluir livremente sem corromper o histórico.

---

## Status que importam

**`PlanoTratamento.status`**
- `ativo` — em curso
- `finalizado` — encerrado (manualmente ou por substituição)
- `cancelado` — abortado

**`Sessao.status`**
- `agendado` — marcada pra acontecer
- `em_andamento` — fisio iniciou
- `concluido` — fechada, vira histórico imutável
- `cancelado` — cancelada antes
- `nao_compareceu` — paciente faltou

**`SessaoExercicio.status`**
- `realizado` — feito normalmente
- `adaptado` — feito com adaptação
- `nao_realizado` — não fez
- `superado` — paciente foi além do esperado
