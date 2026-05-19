# Fluxos do Sistema

Descreve os fluxos principais de navegação e operação do aplicativo, do ponto de vista do profissional e do administrador.

---

## 1. Cadastro e Login

```
Acessar sistema
  └─ Tem conta?
       ├─ Não → Preencher cadastro (nome, e-mail, senha, celular) → Confirmar → Login automático
       └─ Sim  → Informar e-mail e senha → Validar credenciais
                    ├─ OK  → Redirecionar para Dashboard
                    └─ Erro → Exibir mensagem → Tentar novamente
```

---

## 2. Cadastrar Paciente

```
Dashboard → "Novo paciente"
  └─ Preencher formulário (nome, nascimento, celular, observações)
       └─ Salvar → Redirecionar para página do paciente
```

---

## 3. Criar Episódio de Tratamento

```
Página do paciente → Aba "Episódio"
  └─ Criar nova ficha de tratamento
       ├─ Preencher queixa principal, histórico clínico, diagnóstico
       ├─ Definir objetivos, frequência semanal, sessões previstas
       ├─ Informar data de início e previsão de alta
       └─ Salvar → Episódio criado com status "ativo"
```

> Cada paciente pode ter vários episódios ao longo do tempo, mas apenas um episódio está ativo de cada vez.

---

## 4. Interface por Abas do Paciente

A página do paciente é organizada em abas principais:

- **Dados**: informações pessoais do paciente.
- **Episódio**: ficha de tratamento ativa e exercícios previstos.
- **Sessões**: agenda e registro de sessões.
- **Anexos**: exames, laudos e documentos relacionados ao episódio.
- **Prontuário**: geração de relatório PDF sob demanda.

### 4.1 Stepper da sessão

Na aba "Sessões", cada sessão é conduzida por um stepper de três etapas:

1. **Preparar**
   - revisar dados do paciente e do episódio ativo
   - confirmar a lista padrão de exercícios do episódio
   - iniciar ou criar a sessão agendada
2. **Executar**
   - copiar exercícios de `ficha_exercicio` para `sessao_exercicio`
   - marcar cada exercício com status e comentário
   - adaptar, adicionar ou remover exercícios se necessário
3. **Encerrar**
   - preencher observação geral da sessão
   - finalizar a sessão

---

## 5. Gerenciar Sessões

```
Aba "Sessões" → "Nova sessão"
  └─ Definir data e hora
       └─ Salvar → Sessão criada com status "agendado"

No dia da sessão:
  ├─ Iniciar sessão → status muda para "em_andamento"
  ├─ Preencher exercícios da sessão
  │    ├─ status por exercício: realizado / adaptado / nao_realizado / superado
  │    └─ comentário por exercício
  ├─ Encerrar sessão → preencher observação geral
  └─ Finalizar → status muda para "realizada"
```

Se o paciente não comparecer ou a sessão for cancelada:

- registrar a sessão como `nao_compareceu` ou `cancelada`
- preservar o histórico da sessão

> A sessão já representa o agendamento. Não há tabela separada de `agendamento` no modelo atual.

---

## 6. Exercícios do Episódio

```
Aba "Episódio" → "Exercícios previstos"
  └─ Buscar exercício no catálogo
       └─ Adicionar à ficha de tratamento
            ├─ Definir ordem
            └─ Salvar → exercício registrado em `ficha_exercicio`
```

Os exercícios previstos no episódio servem de base para as sessões. Ao iniciar uma sessão, a carga padrão é copiada para `sessao_exercicio`.

---

## 7. Gerenciar Anexos

```
Aba "Anexos" → "Novo anexo"
  └─ Selecionar arquivo
       └─ Preencher anotação (opcional)
            └─ Salvar → Anexo vinculado ao episódio de tratamento
```

---

## 8. Gerar Prontuário

```
Aba "Prontuário" → "Gerar prontuário"
  └─ Backend compila:
       ├─ dados do paciente
       ├─ ficha de tratamento ativa
       ├─ sessões realizadas com exercícios e comentários
       └─ anexos
            └─ Gerar PDF → Exibir visualização → Download
```

> O prontuário é gerado sob demanda e não fica armazenado como entidade separada.

---

## 9. Novo ciclo de tratamento

```
Paciente com episódio ativo → Encerrar episódio atual
  └─ Atualizar `ficha_tratamento.status` para "concluido" ou "cancelado"
       └─ Criar novo episódio de tratamento
            └─ Novo episódio passa a ser o ativo
```

---

## 10. Resumo de status

### `ficha_tratamento.status`
| Valor | Descrição |
|:---|:---|
| `ativo` | Episódio vigente de tratamento |
| `concluido` | Episódio finalizado |
| `cancelado` | Episódio cancelado |

### `sessao.status`
| Valor | Descrição |
|:---|:---|
| `agendado` | Sessão criada e aguardando data/hora |
| `em_andamento` | Sessão iniciada |
| `realizada` | Sessão concluída |
| `cancelada` | Sessão cancelada |
| `nao_compareceu` | Paciente não compareceu |

### `sessao_exercicio.status`
| Valor | Descrição |
|:---|:---|
| `realizado` | Exercício feito normalmente |
| `adaptado` | Exercício feito com adaptação |
| `nao_realizado` | Exercício não foi feito |
| `superado` | Exercício superado pelo paciente |
''