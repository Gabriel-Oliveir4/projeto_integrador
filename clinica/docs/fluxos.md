# Fluxos do sistema

O passo a passo de como o fisio usa o sistema no dia a dia. Sem código aqui — só o "o que clica e o que acontece".

---

## 1. Entrar no sistema

Primeira vez:
- Acessa o site.
- Clica em "Cadastrar".
- Preenche nome, sobrenome, email, celular e senha.
- Pronto, já entra logado.

Depois:
- Email e senha.
- Cai no dashboard.

Se errar a senha, mostra erro e deixa tentar de novo.

---

## 2. Cadastrar um paciente

Na lista de pacientes, clica em **"Novo paciente"**. Abre um formulário com:

- Nome e sobrenome (obrigatórios)
- Data de nascimento
- Sexo
- Celular (com máscara)
- Observações livres

Salva. O paciente aparece na lista. Dá pra editar depois clicando no lápis.

---

## 3. Criar um plano de tratamento

Entra no paciente, aba **"Plano"**, clica em **"Novo plano"**. Preenche:

- Queixa principal (obrigatório)
- Histórico clínico
- Diagnóstico
- Objetivo do tratamento
- Frequência semanal e total de sessões previstas
- Data de início e previsão de alta
- **Escolhe os exercícios** marcando uns checkboxes na lista do catálogo

Salva. O plano fica como **ativo** e vira o vigente daquele paciente.

> Se já havia um plano ativo, ele é finalizado automaticamente. Só pode ter um ativo de cada vez.

---

## 4. Agendar uma sessão

Duas formas:

**a) Pela aba "Sessões" do paciente.** Clica em "Agendar sessão", escolhe data e hora, salva.

**b) (Em breve) Pelo calendário.** Hoje o calendário só mostra o que já foi agendado.

Regras na hora de salvar:
- A data tem que ser no futuro.
- Não pode ter outra sessão do mesmo fisio no mesmo horário.

Quando a sessão é criada, o sistema **copia os exercícios do plano ativo** pra dentro dela. Assim, ao abrir a sessão depois, o fisio já vê a lista pronta — sem precisar montar de novo.

---

## 5. Ver a agenda

Tela **"Agendamentos"**: calendário do mês com todas as sessões. Cada sessão aparece no dia, com horário e nome do paciente, colorida pelo status (azul = agendado, âmbar = em andamento, verde = concluído, etc.).

Setas pra trocar de mês, botão "Hoje" pra voltar. Clicando numa sessão, vai direto pro detalhe dela.

---

## 6. Iniciar e conduzir a sessão

Chegando o horário da sessão, o fisio abre ela. Os botões disponíveis dependem do status:

**Se ainda está `agendado`:**
- "Iniciar sessão" — muda pra `em_andamento` e libera a edição.
- "Não compareceu" — paciente faltou.
- "Cancelar" — desmarcou.

**Durante a sessão (`em_andamento`):**

A tela mostra a lista de exercícios já copiados do plano. Pra cada um, o fisio pode:
- Mudar o status: realizado / adaptado / não realizado / superado.
- Escrever um comentário (ex.: "fez 3 séries de 10, queixou de dor leve no joelho").
- Clicar em "Salvar" naquele exercício.

Também tem o campo **"Observações gerais"** da sessão — coisas que valem pra atendimento todo, não pra um exercício específico.

**Pra fechar:** botão **"Concluir sessão"**. Pede confirmação ("depois disso a sessão não pode mais ser editada"). Confirma, e a sessão vira `concluido` — todos os campos ficam travados.

---

## 7. Status que a sessão pode assumir

| Status | Quando |
|---|---|
| `agendado` | Acabou de ser marcada |
| `em_andamento` | Fisio começou |
| `concluido` | Sessão fechada — vira histórico imutável |
| `cancelado` | Foi desmarcada |
| `nao_compareceu` | Paciente faltou |

Os três últimos travam a sessão — não dá mais pra editar nada.

---

## 8. Ver o histórico do paciente

Na aba "Sessões" do paciente, lista todas as sessões que ele já teve, ordenadas por data. Cada uma mostra o status e o horário. Clicando, abre o detalhe — inclusive das já fechadas, em modo só-leitura.

---

## 9. Trocar de plano (novo ciclo)

Se o paciente termina o tratamento e volta meses depois com outra queixa, o fisio:

- Vai na aba Plano, cria um plano novo.
- O plano anterior é finalizado automaticamente.
- A partir daí, as novas sessões agendadas usam o plano novo.

O histórico do plano antigo (e das sessões dele) continua acessível.

---

## 10. Sair

Botão de logout no canto da sidebar. Apaga o cookie e volta pra tela de login.
