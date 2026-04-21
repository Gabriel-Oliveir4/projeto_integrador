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

## 3. Registrar Ficha Inicial

```
Página do paciente → "Nova ficha inicial"
  └─ Preencher (queixa principal, histórico clínico, diagnóstico, observações)
       └─ Salvar → Ficha vinculada ao paciente
```

> Um paciente pode ter mais de uma ficha ao longo do tempo (alta e retorno).

---

## 4. Definir Plano de Tratamento

```
Página do paciente → "Novo plano de tratamento"
  └─ Selecionar ficha inicial de referência
       └─ Preencher (objetivos, frequência semanal, sessões previstas, data de início, previsão de alta)
            └─ Adicionar bateria padrão de exercícios (plano_exercicio)
                 └─ Buscar exercício no catálogo → Adicionar → Definir ordem
                      └─ Salvar plano → Plano marcado como ativo
```

> Ao criar novo plano, o anterior é automaticamente marcado como inativo.

---

## 5. Agendamento

```
Agenda / Página do paciente → "Novo agendamento"
  └─ Selecionar paciente (se vindo da agenda)
       └─ Informar data e hora
            └─ Salvar → Agendamento com status "agendado"

No dia da consulta:
  ├─ Paciente compareceu → Iniciar sessão (fluxo 6) → Agendamento muda para "realizado"
  ├─ Paciente não compareceu → Registrar como "nao_compareceu" + motivo opcional
  └─ Cancelado → Registrar como "cancelado" + quem cancelou + motivo
```

---

## 6. Conduzir Sessão

```
Agendamento "agendado" → "Iniciar sessão"
  └─ Sistema copia bateria padrão do plano ativo para a sessão (plano_exercicio → sessao_exercicio)
       └─ Tela da sessão exibe lista de exercícios
            └─ Para cada exercício:
                 ├─ Marcar status: [Normal] [Adaptado] [Não realizado] [Superado]
                 └─ Preencher comentário (opcional)

  ├─ Precisa adaptar a sessão?
  │    └─ Botão "Editar sessão"
  │         ├─ Adicionar exercício do catálogo
  │         └─ Remover exercício (soft delete — registro preservado)

  └─ Encerrar sessão
        └─ Preencher observação geral (opcional)
             └─ Confirmar → Sessão muda para "finalizada"
                  └─ Agendamento vinculado muda para "realizado"
```

---

## 7. Editar Plano de Tratamento (bateria padrão)

```
Página do paciente → Plano ativo → "Editar plano"
  ├─ Alterar campos (objetivos, frequência, etc.)
  ├─ Adicionar exercício à bateria padrão
  └─ Remover exercício da bateria padrão
       └─ Salvar → Próximas sessões herdam a nova bateria
                   Sessões anteriores não são afetadas
```

---

## 8. Gerenciar Anexos

```
Página do paciente → Aba "Anexos" → "Novo anexo"
  └─ Upload do arquivo (exame, laudo, etc.)
       └─ Preencher anotação (opcional)
            └─ Salvar → Anexo listado na página do paciente
```

---

## 9. Gerar Prontuário

```
Página do paciente → "Gerar prontuário"
  └─ Backend compila em tempo real:
       ├─ Dados do paciente
       ├─ Ficha(s) inicial(is)
       ├─ Plano(s) de tratamento
       ├─ Sessões realizadas + exercícios + comentários
       └─ Anexos
            └─ Gerar PDF → Exibir visualização → Opção de download
```

> O prontuário não é salvo no banco. Cada geração compila os dados atuais.

---

## 10. Gerenciar Banco de Exercícios (Administrador)

```
Login como administrador → Banco de Exercícios
  ├─ Listar exercícios (ativos e inativos)
  ├─ Novo exercício → Nome, descrição, foto → Salvar
  ├─ Editar exercício existente
  └─ Ativar / desativar exercício
```

> Fisioterapeutas não têm acesso a esta área — apenas leitura do catálogo durante as sessões.

---

## Resumo dos status por tabela

### `sessao.status`
| Valor | Descrição |
|:---|:---|
| `em_andamento` | Sessão iniciada, ainda sendo conduzida |
| `finalizada` | Sessão encerrada pelo médico |
| `cancelada` | Sessão cancelada |

### `sessao_exercicio.status`
| Valor | Interface |
|:---|:---|
| `realizado` | ✓ Normal |
| `adaptado` | ~ Realizado com adaptação |
| `nao_realizado` | ✗ Não realizado |
| `superado` | ★ Superado |

### `agendamento.status`
| Valor | Descrição |
|:---|:---|
| `agendado` | Consulta marcada, ainda não ocorreu |
| `realizado` | Paciente compareceu e sessão foi conduzida |
| `cancelado` | Cancelado pelo médico ou paciente |
| `nao_compareceu` | Paciente não apareceu |
