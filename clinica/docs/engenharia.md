# Como o sistema foi construído

Aqui vão as decisões técnicas: que ferramentas, por quê, e como as peças se encaixam. Sem muito formalismo.

---

## A stack

| Camada | Ferramenta | Por que |
|---|---|---|
| App inteiro | **Next.js 15** (TypeScript) | Frontend e backend no mesmo projeto. Menos repositório, menos deploy, menos dor de cabeça. |
| Banco | **MongoDB** (via Mongoose) | NoSQL é simples de subir e flexível. O Atlas tem tier grátis. |
| Login | **JWT em cookie httpOnly** | Cookie vai sozinho em toda requisição, navegador não pode ler via JavaScript (mais seguro). |
| Senha | **bcrypt** | Padrão da indústria pra hash de senha. |
| Estilo | **Tailwind CSS + shadcn/ui** | Tailwind é rápido de escrever; shadcn dá componentes bonitos já prontos pra customizar. |
| Hospedagem | **Vercel** | Faz deploy do Next direto do Git. Tier grátis dá conta. |

---

## Por que Next.js em vez de "backend separado"?

Pra um projeto feito por uma pessoa só, ter backend Python + frontend React separados é trabalho dobrado: dois deploys, duas linguagens, dois `package.json`. O Next.js permite ter as duas coisas no mesmo lugar — uma pasta com as telas, outra pasta com as rotas de API, mesmo idioma (TypeScript) nos dois lados.

---

## Como o projeto está organizado

```
app/
  (auth)/          → telas públicas (login, cadastro)
  (app)/           → telas autenticadas (com sidebar)
  api/             → rotas do servidor (endpoints JSON)
components/ui/     → botões, modais, inputs reutilizáveis
lib/
  apiHandler.ts    → wrapper de auth + conexão DB pra todas as rotas
  auth.ts          → gera e valida JWT
  mongodb.ts       → conexão cacheada com o Mongo
  models/          → schemas Mongoose
docs/              → essa documentação
```

No Next.js App Router, **a estrutura de pastas é o mapa do site**: cada `page.tsx` vira uma URL, cada `route.ts` vira um endpoint. Não tem arquivo central de rotas.

---

## Como uma requisição funciona

Quando o usuário clica em "Salvar paciente" na tela:

1. O componente (no navegador) chama `fetch("/api/pacientes", { method: "POST" })`.
2. O Next recebe e despacha pra função `POST` em `app/api/pacientes/route.ts`.
3. Essa função passa pelo `apiHandler`, que:
   - Lê o cookie, valida o JWT, extrai o `userId`.
   - Conecta no MongoDB (ou reusa a conexão se já estiver aberta).
   - Chama o código de verdade da rota, passando o `userId`.
4. A rota salva o paciente e devolve JSON.
5. O componente atualiza a tela.

O `apiHandler` é o "porteiro" — toda rota passa por ele. Garante que ninguém esquece de validar o token.

---

## Como o login funciona

1. Usuário envia email + senha pra `/api/auth`.
2. Servidor procura o User pelo email, compara a senha (bcrypt).
3. Se bate, gera um JWT com `{ userId: ..., exp: ... }` assinado com uma chave secreta.
4. Devolve o JWT como **cookie httpOnly**.
5. A partir daí, o navegador manda esse cookie sozinho em toda requisição. O servidor decodifica, pega o `userId`, e usa pra filtrar os dados.

Logout é só apagar o cookie.

---

## Como os dados ficam isolados por fisio

Todo paciente tem um campo `fisio` que aponta pro User dono. Todas as consultas filtram por `fisio: userId` (vindo do JWT). O cliente nunca informa o `fisio` no body — vem do token. Isso garante que o fisio A nunca vê o paciente do fisio B.

---

## Regras de negócio principais

- **Senha sempre com hash** — bcrypt, nunca em texto puro.
- **Um paciente, um plano ativo** — criar um novo finaliza o anterior automaticamente.
- **Sessão não pode ter conflito** — dois agendamentos do mesmo fisio no mesmo horário, não.
- **Sessão fechada é imutável** — quando vira `concluido`, `cancelado` ou `nao_compareceu`, a UI trava todos os campos.
- **Cópia dos exercícios na hora de criar sessão** — o que foi feito naquele dia fica congelado, mesmo que o plano mude depois.

---

## Variáveis de ambiente

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<chave forte qualquer>
```

São só essas. `MONGODB_URI` vem do MongoDB Atlas. `JWT_SECRET` é uma string aleatória qualquer (não compartilhar).

---

## Quando o servidor "dorme" (serverless)

Na Vercel, cada rota é uma função que sobe quando alguém chama e morre depois. Isso traz duas pegadinhas que valem mencionar:

**1. Cold start.** A primeira chamada depois de um tempo parado pode demorar 1-2 segundos (a função precisa subir do zero). Depois disso, fica rápida.

**2. Models do Mongoose.** Cada função é um processo isolado — só os models importados naquele arquivo ficam registrados. Se uma rota faz `populate("paciente")` sem ter importado o model `Paciente`, dá erro `MissingSchemaError`. Por isso o `apiHandler` importa o `lib/models/index.ts`, que registra todos de uma vez.

---

## O que ficou fora

Algumas coisas que estão no plano original mas não foram implementadas — vale registrar:

- Upload de anexos (esquema existe, UI não).
- Geração de PDF do prontuário.
- Painel de administrador pra gerenciar o catálogo de exercícios (hoje vem de um seed JSON).
- Roles (admin vs fisio) no JWT.
