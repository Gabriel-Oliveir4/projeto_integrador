# Engenharia de Software

Decisões técnicas, padrões e arquitetura do projeto.

---

## 1. Arquitetura

O sistema segue uma arquitetura cliente-servidor simples, com frontend e backend desacoplados comunicando-se via API REST.

```
┌─────────────┐        HTTP/JSON        ┌──────────────┐        ┌────────────┐
│   Frontend  │  ──────────────────────▶│   Backend    │◀──────▶│ PostgreSQL │
│    React    │◀──────────────────────  │   FastAPI    │        └────────────┘
└─────────────┘                         └──────────────┘
```

---

## 2. Stack

| Camada | Tecnologia | Justificativa |
|:---|:---|:---|
| Frontend | React | Componentização, SPA, ecossistema consolidado |
| Backend | Python + FastAPI | Tipagem com Pydantic, async nativo, geração automática de docs (Swagger) |
| Banco de dados | PostgreSQL | Relacional, robusto, suporte a JSONB se necessário |
| Geração de PDF | WeasyPrint ou Playwright | HTML → PDF no backend |
| Autenticação | JWT (Bearer token) | Stateless, simples de implementar com FastAPI |
| Hash de senha | bcrypt / argon2 | Resistente a brute force |

---

## 3. Estrutura do Projeto

### Backend (FastAPI)

```
backend/
├── main.py                  # Entry point
├── database.py              # Conexão com PostgreSQL (SQLAlchemy / asyncpg)
├── models/                  # Modelos ORM
│   ├── medico.py
│   ├── paciente.py
│   ├── ficha_inicial.py
│   ├── plano_tratamento.py
│   ├── plano_exercicio.py
│   ├── sessao.py
│   ├── sessao_exercicio.py
│   ├── exercicio.py
│   ├── paciente_anexo.py
│   └── agendamento.py
├── schemas/                 # Schemas Pydantic (request/response)
├── routers/                 # Endpoints por domínio
│   ├── auth.py
│   ├── pacientes.py
│   ├── fichas.py
│   ├── planos.py
│   ├── sessoes.py
│   ├── exercicios.py
│   ├── anexos.py
│   ├── agendamentos.py
│   └── prontuario.py
├── services/                # Lógica de negócio
│   ├── sessao_service.py    # Cópia da bateria do plano ao criar sessão
│   └── prontuario_service.py
└── core/
    ├── config.py            # Variáveis de ambiente
    └── security.py          # JWT, hash de senha
```

### Frontend (React)

```
frontend/
├── src/
│   ├── pages/               # Telas principais
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Paciente.jsx
│   │   ├── FichaInicial.jsx
│   │   ├── PlanoTratamento.jsx
│   │   ├── Sessao.jsx
│   │   ├── BancoExercicios.jsx
│   │   ├── Anexos.jsx
│   │   ├── Agenda.jsx
│   │   └── Prontuario.jsx
│   ├── components/          # Componentes reutilizáveis
│   ├── services/            # Chamadas à API (axios / fetch)
│   ├── context/             # Estado global (auth, etc.)
│   └── routes/              # Definição de rotas (React Router)
```

---

## 4. Autenticação

- Registro e login retornam um **JWT** com `medico_id` e tempo de expiração.
- O token é armazenado no frontend (`localStorage` ou `httpOnly cookie`).
- Todas as rotas protegidas exigem o header `Authorization: Bearer <token>`.
- O backend extrai o `medico_id` do token e usa para filtrar todos os dados — um médico nunca acessa dados de outro.

---

## 5. Regras de Negócio

| Regra | Onde aplicar |
|:---|:---|
| Senha nunca em texto puro | `core/security.py` — sempre hash + salt |
| Médico só acessa seus próprios pacientes | Filtro obrigatório por `medico_id` em todas as queries |
| Plano anterior desativado ao criar novo | `services/plano_service.py` |
| Ao criar sessão, copiar bateria do plano ativo | `services/sessao_service.py` |
| Remover exercício da sessão = soft delete | `removido = true` em `sessao_exercicio` |
| Agendamento vira "realizado" ao iniciar sessão | `services/agendamento_service.py` |
| Prontuário não é armazenado | Gerado em tempo real, nunca persiste no banco |
| Exercícios do banco são somente leitura para fisioterapeutas | Controle por role no JWT (`role: medico` vs `role: admin`) |

---

## 6. Fluxo de Criação de Sessão (backend)

```
POST /sessoes
  1. Validar agendamento (deve existir e estar com status "agendado")
  2. Buscar plano de tratamento ativo do paciente
  3. Criar registro em sessao (status = "em_andamento")
  4. Copiar plano_exercicio → sessao_exercicio (INSERT INTO sessao_exercicio SELECT FROM plano_exercicio)
  5. Atualizar agendamento.sessao_id e agendamento.status = "realizado"
  6. Retornar sessão criada com exercícios
```

---

## 7. Geração do Prontuário (backend)

```
GET /prontuario/{paciente_id}
  1. Buscar dados do paciente
  2. Buscar fichas iniciais
  3. Buscar planos de tratamento
  4. Buscar sessões finalizadas + sessao_exercicio (excluindo removido = true)
  5. Buscar anexos
  6. Montar template HTML com todos os dados
  7. Converter HTML → PDF (WeasyPrint / Playwright)
  8. Retornar PDF como stream (Content-Type: application/pdf)
```

---

## 8. Variáveis de Ambiente

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/fisioterapia
SECRET_KEY=<chave_jwt_forte>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
UPLOAD_DIR=./uploads
```

---

## 9. Convenções

- **Branches:** `main` (produção), `dev` (desenvolvimento), `feature/<nome>` para novas features.
- **Commits:** mensagens em português, imperativas — ex: `Adiciona endpoint de sessão`.
- **API:** REST, JSON, snake_case nos campos.
- **Datas:** sempre `TIMESTAMPTZ` no banco, ISO 8601 na API.
- **Soft delete:** usado apenas em `sessao_exercicio.removido`. Demais tabelas usam `ativo` para desativação lógica.

---

## 10. Módulos v2 (fora do escopo atual)

| Módulo | Descrição |
|:---|:---|
| Notificações | Lembrete de consulta por e-mail/WhatsApp |
| Evolução gráfica | Gráficos de progresso do paciente por exercício |
| App mobile | Versão mobile para o fisioterapeuta |
| Multi-clínica | Suporte a múltiplos consultórios por profissional |
