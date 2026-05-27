# Sobre o projeto

Um sistema web para fisioterapeutas autônomos organizarem seus atendimentos. O fisio cadastra os pacientes, monta um plano de tratamento com exercícios pra cada um, agenda as sessões e durante cada atendimento registra o que foi feito.

A ideia é resolver o caos do papel e da planilha — ter tudo num lugar só, acessível do celular ou do computador, e com histórico permanente do que aconteceu em cada sessão.

---

## Pra quem é

Fisioterapeuta que atende sozinho (sem clínica grande, sem secretária). Quer:

- Lembrar quem é o paciente e qual o problema dele.
- Saber o que prescreveu de exercício no plano.
- Marcar sessões e ver a agenda do mês.
- Anotar, em cada sessão, como o paciente foi nos exercícios.
- Olhar o histórico depois (a evolução do paciente).

---

## O que o sistema faz hoje

**Login e cadastro.** Cada fisio tem sua conta. Os dados de um nunca aparecem pra outro.

**Pacientes.** Cadastro com nome, data de nascimento, celular, observações. Lista dos pacientes do fisio na tela inicial.

**Plano de tratamento.** Pra cada paciente, o fisio cria um plano com queixa principal, diagnóstico, objetivos, frequência semanal, sessões previstas, e escolhe os exercícios do catálogo. Só pode haver um plano ativo por paciente — criar um novo finaliza o anterior.

**Catálogo de exercícios.** Lista compartilhada de exercícios disponíveis pra serem prescritos. Vem pré-cadastrada.

**Agendamento de sessões.** Marca data e hora. O sistema checa se já tem outra sessão no mesmo horário e não deixa criar.

**Calendário.** Visão do mês com todas as sessões agendadas. Dá pra iniciar uma sessão direto dali quando o horário chegar.

**Sessão em andamento.** Quando o fisio inicia a sessão, ele vê os exercícios do plano (já copiados pra dentro daquela sessão) e pra cada um pode marcar: realizado, adaptado, não realizado ou superado. Escreve comentário em cada exercício e observação geral da sessão.

**Encerrar sessão.** Ao concluir, a sessão fica travada — ninguém edita mais. Vira parte do histórico permanente do paciente.

---

## O que ainda não tem

- Upload de anexos (exames, laudos).
- Geração de prontuário em PDF.
- Dashboard com estatísticas (gráfico de evolução, etc.).
- Notificações de lembrete pro paciente.

---

## Como foi feito

| Camada | O quê |
|---|---|
| Frontend e backend | Next.js (TypeScript) — uma aplicação só |
| Banco de dados | MongoDB |
| Autenticação | JWT em cookie |
| Hospedagem | Vercel |

O Next.js junta as duas pontas: as telas que o usuário vê e a API que conversa com o banco moram no mesmo projeto, no mesmo deploy. Isso simplifica muita coisa pra um projeto pequeno feito por uma pessoa.
