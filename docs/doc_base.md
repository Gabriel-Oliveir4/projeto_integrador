# Documentação do Projeto: Aplicativo para Fisioterapeutas

## 1. Objetivo

Aplicativo web para fisioterapeutas cadastrarem pacientes, conduzirem sessões com exercícios selecionados e comentados, e gerarem um prontuário em PDF sob demanda.

---
---

## 2. User Story

> Eu, Camila Haab, preciso de um sistema onde eu me cadastre e faça login. Cadastro meus pacientes e preencho uma ficha inicial com queixa, histórico clínico e diagnóstico. Para cada paciente, defino um plano de tratamento com objetivos, frequência e previsão de alta. Conduzo sessões vinculadas ao plano, selecionando exercícios do banco compartilhado e registrando um comentário em cada um (execução, desempenho, observações). Posso anexar exames e laudos ao paciente. Quando necessário, gero um prontuário em PDF com ficha inicial, plano, todas as sessões e anexos.

---

## 3. Módulos

### 3.1 Autenticação
- Cadastro: nome, sobrenome, e-mail, senha e celular.
- Login com e-mail e senha. Senha armazenada com hash + salt (bcrypt/argon2) //precisa?
- Todas as entidades são vinculadas ao médico autenticado.

### 3.2 Paciente
- Cadastro: nome completo, data de nascimento, celular e observações.
- Listagem com filtro por ativos/inativos.
- Página do paciente com ficha inicial, plano de tratamento, histórico de sessões e anexos.

### 3.3 Ficha Inicial
- Registro de queixa principal, histórico clínico, diagnóstico e observações.
- Vinculada ao paciente.

### 3.4 Plano de Tratamento
- Campos: objetivos terapêuticos, frequência semanal, sessões previstas, data de início e previsão de alta.
- Um paciente pode ter mais de um plano ao longo do tempo; o ativo é o vigente.

### 3.5 Sessões
- Criar sessão vinculada a um paciente e ao plano ativo.
- Selecionar exercícios do banco e registrar um comentário por exercício.
- Status: `em_andamento`, `finalizada` ou `cancelada`.
- Encerrar com observação geral.
- Histórico de sessões anteriores com exercícios e comentários.

### 3.6 Banco de Exercícios
- Catálogo compartilhado entre todos os fisioterapeutas do sistema.
- Cadastro e gestão feitos pelo administrador; profissionais apenas consultam e selecionam.
- Campos por exercício: nome, descrição (opcional) e foto (opcional).
- Exercícios podem ser ativados/desativados.

### 3.7 Anexos
- Upload de arquivos do paciente (exames, laudos, etc.).
- Registra: nome, caminho, tipo MIME, tamanho e anotação opcional.

### 3.8 Prontuário
- Não armazenado no banco — gerado sob demanda (HTML → PDF).
- Compila: dados do paciente, ficha inicial, plano de tratamento, sessões com exercícios e comentários, e anexos.
- Gerado manualmente via botão na página do paciente.

---

## 4. Telas

| Tela | Descrição |
| :--- | :--- |
| **Cadastro / Login** | Cadastro e autenticação do médico |
| **Dashboard** | Lista de pacientes e acesso rápido às sessões recentes |
| **Paciente** | Dados, ficha inicial, plano, histórico de sessões, anexos e geração do prontuário |
| **Ficha Inicial** | Queixa principal, histórico clínico e diagnóstico |
| **Plano de Tratamento** | Objetivos, frequência, sessões previstas e previsão de alta |
| **Sessão** | Seleção de exercícios, comentário por exercício e observação geral |
| **Banco de Exercícios** | Consulta do catálogo (somente leitura para o fisioterapeuta; cadastro e edição pelo administrador) |
| **Anexos** | Upload e listagem de documentos do paciente |
| **Prontuário** | Visualização e download do PDF gerado |

---

## 5. Diagrama de Caso de Uso

**Diagrama (PlantUML):**

//alt+d abre diagrama
```plantuml
@start tuml

left to right direction
skinparam packageStyle rectangle
skinparam actorStyle awesome
skinparam shadowing false

skinparam package {
  BackgroundColor #F8F9FA
  BorderColor #6C757D
  FontColor #343A40
  FontStyle bold
}

skinparam usecase {
  BackgroundColor #FFFFFF
  BorderColor #495057
  FontColor #212529
}

actor "Profissional\nda Saúde" as prof
actor "Administrador" as admin

rectangle Sistema {

  together {
    package "Autenticação" {
      usecase "Cadastrar-se /\nFazer Login" as UC0
    }

    package "Paciente" {
      usecase "Gerenciar\nPaciente" as UC1
    }

    package "Ficha Inicial" {
      usecase "Registrar\nFicha Inicial" as UC1a
    }

    package "Plano de Tratamento" {
      usecase "Definir Plano\nde Tratamento" as UC1b
    }

    package "Anexos" {
      usecase "Gerenciar\nAnexos" as UC1c
    }
  }

  together {
    package "Sessão" {
      usecase "Conduzir\nSessão" as UC2
      usecase "Selecionar Exercícios\ndo Banco" as UC2a
      usecase "Comentar\nExercício" as UC2b
    }

    package "Banco de Exercícios" {
      usecase "Consultar Banco\nde Exercícios" as UC3
      usecase "Gerenciar Banco\nde Exercícios" as UC3a
    }

    package "Prontuário" {
      usecase "Gerar\nProntuário" as UC4
      usecase "Consultar Sessões\ndo Paciente" as UC4a
    }
  }

}

prof  --> UC0
prof  --> UC1
prof  --> UC1a
prof  --> UC1b
prof  --> UC1c
prof  --> UC2
prof  --> UC3
prof  --> UC4
admin --> UC3a

UC2 ..> UC2a : <<include>>
UC2 ..> UC2b : <<include>>
UC4 ..> UC4a : <<include>>

@enduml
```

---

## 6. Stack

| Camada | Tecnologia |
| :--- | :--- |
| **Frontend** | React, HTML, CSS, JavaScript |
| **Backend** | Python, FastAPI |
| **Banco de Dados** | PostgreSQL |
| **Ferramentas** | VS Code, Git |

---

## 7. Cronograma

**Etapa 1 — Análise e Documentação**
- Levantamento de requisitos
- Definição de módulos, telas e fluxos
- User Story e diagrama de casos de uso
- Revisão e validação

**Etapa 2 — Prototipação**
- Wireframes das telas principais
- Validação do fluxo de navegação
- Ajustes antes do desenvolvimento

**Etapa 3 — Modelagem do Banco de Dados**
- Definição das entidades e relacionamentos
- Diagrama ER
- Criação das tabelas no PostgreSQL e índices

**Etapa 4 — Backend**
- Configuração do projeto FastAPI
- Endpoints de paciente, sessão, banco de exercícios e prontuário

**Etapa 5 — Frontend**
- Configuração do projeto React
- Implementação das telas: Dashboard → Paciente → Sessão → Banco de Exercícios → Prontuário
- Integração com a API

**Etapa 6 — Testes**
- Testes dos fluxos principais
- Correção de bugs

**Etapa 7 — Entrega**
- Revisão geral
- Documentação final
- Deploy ou entrega do projeto

