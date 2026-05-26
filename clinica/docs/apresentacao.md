# Sistema de Gestão para Clínica de Fisioterapia
**Apresentação técnica — ~15 minutos**

---

## 1. Visão geral (1 min)

Sistema web para fisioterapeutas autônomos gerenciarem **pacientes, planos de tratamento, sessões e exercícios**. Cada fisio enxerga só os próprios dados — multi-tenant por usuário.

**Casos de uso cobertos:**
- Cadastrar pacientes e acompanhar status (ativo/inativo).
- Criar plano de tratamento (queixa, diagnóstico, frequência, alta prevista) com lista de exercícios prescritos.
- Agendar sessões a partir do plano, conduzir a sessão na hora (iniciar / concluir / marcar falta) e registrar status por exercício.
- Visualizar agendamentos em calendário mensal.

---

## 2. Stack técnica (1 min)

| Camada | Escolha |
|---|---|
| Framework | **Next.js 16** (App Router, React 19) |
| UI | **Tailwind v4** + **shadcn/ui** sobre **base-ui** + **lucide-react** |
| Persistência | **MongoDB** via **Mongoose** |
| Autenticação | **JWT em cookie httpOnly** + **bcryptjs** |
| Hospedagem | **Vercel** (com cron jobs nativos) |

Tudo em **TypeScript**. Sem ORM relacional, sem Redux, sem SWR/React Query — fetch puro com `useEffect` + `useState`.

---

## 3. Como o Next.js App Router funciona neste projeto (2 min)

**Convenção:** cada pasta dentro de `app/` é uma rota. Cada `page.tsx` é uma página; cada `route.ts` é um endpoint HTTP. Pastas entre parênteses `(nome)` são **route groups** — agrupam arquivos sem aparecer na URL.

```
app/
├── (auth)/              ← grupo público (login, register)
│   ├── login/page.tsx
│   └── register/page.tsx
├── (app)/               ← grupo autenticado (sidebar + header)
│   ├── layout.tsx       ← sidebar + header só aparecem aqui
│   ├── dashboard/page.tsx
│   ├── pacientes/page.tsx
│   ├── pacientes/[id]/page.tsx
│   ├── pacientes/[id]/sessoes/[sessaoId]/page.tsx
│   └── agendamentos/page.tsx
├── api/                 ← endpoints (route handlers)
│   ├── auth/route.ts
│   ├── pacientes/...
│   ├── sessoes/...
│   ├── planoTratamento/...
│   ├── exercicios/route.ts
│   └── cron/sessoes-expiradas/route.ts
└── layout.tsx           ← root layout (fontes, html/body)
```

**Vantagem prática deste arranjo:** o `app/(app)/layout.tsx` envolve TODAS as telas autenticadas com a sidebar e header — sem precisar repetir em cada página. Já o `(auth)/login` herda só o root layout (sem sidebar).

**Quase tudo no cliente:** as páginas têm `"use client"` no topo. O App Router serve essas páginas como Client Components, e os dados vêm via `fetch` para as rotas em `app/api/*`. Decisão consciente — simplifica o modelo mental no projeto integrador, à custa de não aproveitar React Server Components.

---

## 4. Rotas de API: o `apiHandler` (2 min)

Todo endpoint passa por um wrapper único em [lib/apiHandler.ts](lib/apiHandler.ts):

```ts
export function apiHandler(handler) {
  return async (request, context) => {
    const auth = verificarToken(request);          // 1. JWT do cookie
    if (auth.erro) return auth.erro;                // → 401 se não tiver token
    try {
      await connectDB();                            // 2. conexão Mongo cached
      const params = await context?.params;         // 3. resolve params (Promise no Next 16)
      return await handler(request, auth.userId, params);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ erro: "Erro interno do servidor" }, { status: 500 });
    }
  };
}
```

Cada rota fica enxuta:

```ts
export const GET = apiHandler(async (request, userId) => {
  const pacientes = await Paciente.find({ fisio: userId }).sort({ nome: 1 });
  return NextResponse.json(pacientes);
});
```

**Mapa de endpoints:**

| Método | Rota | O que faz |
|---|---|---|
| POST | `/api/auth` | login / register / logout (despachado por `body.acao`) |
| GET / POST | `/api/pacientes` | listar / criar paciente do fisio logado |
| GET / PUT / DELETE | `/api/pacientes/[id]` | detalhar / editar / remover |
| GET | `/api/exercicios` | catálogo global de exercícios |
| GET / POST | `/api/planoTratamento` | listar planos do paciente / criar plano + exercícios prescritos |
| GET / PUT | `/api/planoTratamento/[id]` | detalhar plano / editar (recria a prescrição se vier `exerciciosIds`) |
| GET / POST | `/api/sessoes` | listar sessões (filtros: paciente, plano, intervalo de datas) / agendar |
| GET / PUT / DELETE | `/api/sessoes/[id]` | detalhar com exercícios / mudar status / deletar com cascata |
| PUT | `/api/sessoes/[id]/exercicios/[exercicioId]` | atualizar status/comentário por exercício |
| GET | `/api/cron/sessoes-expiradas` | job diário (header `x-cron-secret`) |

---

## 5. Modelo de dados e regras de negócio (3 min)

**Diagrama relacional (mental):**

```
User (fisio)
  └── Paciente (1:N)
        └── PlanoTratamento (1:N, só um "ativo" por vez)
              ├── PlanoExercicio (N — exercícios prescritos do plano)
              │     └── Exercicio (catálogo global)
              └── Sessao (N — agendamentos)
                    └── SessaoExercicio (N — checklist da sessão, status/comentário)
                          └── Exercicio
```

**Regras de negócio importantes:**

1. **Isolamento por fisio.** Toda query filtra por `fisio: userId`. Um fisio nunca enxerga paciente, plano ou sessão de outro.

2. **Só um plano ativo por paciente.** Ao criar um plano novo ([planoTratamento/route.ts:41](app/api/planoTratamento/route.ts#L41)):
   ```ts
   await PlanoTratamento.updateMany(
     { paciente: dados.paciente, status: "ativo" },
     { status: "finalizado" }
   );
   ```
   O anterior é automaticamente finalizado antes do novo entrar.

3. **Não agendar sessão para o passado** ([sessoes/route.ts:34](app/api/sessoes/route.ts#L34)).

4. **Sem conflito de horário** — `findOne` antes de criar bloqueia agendar duas sessões agendado/em_andamento no mesmo instante para o mesmo fisio ([sessoes/route.ts:41](app/api/sessoes/route.ts#L41)).

5. **Sessão "fecha" ao concluir.** Após status `concluido`, `cancelado` ou `nao_compareceu`, a UI tranca edição ([DetalheSessao.tsx:51](app/(app)/pacientes/[id]/DetalheSessao.tsx#L51)).

6. **Materialização do checklist no agendamento.** Ao criar a sessão, o backend copia os exercícios do plano em `SessaoExercicio` ([sessoes/route.ts:55](app/api/sessoes/route.ts#L55)). É essa "fotografia" que o fisio vai marcar como realizado/adaptado/etc. durante a sessão. Vantagem: se o plano mudar depois, o histórico da sessão anterior fica intacto.

7. **Job diário marca faltas.** [/api/cron/sessoes-expiradas](app/api/cron/sessoes-expiradas/route.ts), agendado em [vercel.json](vercel.json) (`0 3 * * *`), marca como `nao_compareceu` toda sessão que ficou >24h passada sem mudança de status. Protegido por `x-cron-secret` no header.

**Status (máquina de estados da sessão):**

```
agendado ──► em_andamento ──► concluido
   │              │
   ├──► cancelado ┘
   └──► nao_compareceu (manual ou via cron)
```

---

## 6. Fluxos de interface (3 min)

### Fluxo A: novo paciente até primeira sessão

1. **Login** (`/login`) → POST `/api/auth` → seta cookie JWT (7 dias) → redireciona pra `/dashboard`.
2. **Lista de pacientes** (`/pacientes`) → modal "Novo paciente" com máscara de celular e validação client-side ([pacientes/page.tsx](app/(app)/pacientes/page.tsx)).
3. **Detalhe do paciente** (`/pacientes/[id]`) → 5 abas via componente `Tabs` ([pacientes/[id]/page.tsx](app/(app)/pacientes/[id]/page.tsx)):
   - **Dados** — leitura simples.
   - **Plano de Tratamento** — `AbaPlano` lista o plano ativo e oferece criar/editar com checklist de exercícios do catálogo global.
   - **Sessões** — `AbaSessoes` exige plano ativo; modal de agendar pede só data e observação.
   - **Anexos / Prontuário** — placeholders.
4. **Sessão individual** (`/pacientes/[id]/sessoes/[sessaoId]`) → `DetalheSessao` renderiza checklist + botões de estado (Iniciar → Concluir / Não compareceu / Cancelar).

### Fluxo B: agenda mensal

`/agendamentos` ([agendamentos/page.tsx](app/(app)/agendamentos/page.tsx)) — calendário mensal renderizado client-side. Busca todas as sessões no intervalo `de`/`ate` do mês, agrupa por dia, exibe em células coloridas por status. Sessão `agendada` que cair na janela "15 min antes → 4h depois" mostra ícone de play para iniciar com um clique.

### Padrão de mutação na UI

Todos os formulários seguem o mesmo esqueleto:

```js
setCarregando(true);
try {
  const res = await fetch(URL, { method, body: JSON.stringify(form) });
  const data = await res.json();
  if (!res.ok) { setErro(data.erro); return; }
  await buscarLista();         // ← refetch ANTES de fechar
  setModalAberto(false);
} finally {
  setCarregando(false);
}
```

O `await buscarLista()` garante que o modal só fecha quando os dados novos já estão no estado — sem aquele flicker de "lista vazia" entre o modal fechar e o refetch terminar.

---

## 7. Autenticação e segurança (1 min)

- **Senha** salva como hash bcrypt (`select: false` no schema — não vaza em queries).
- **JWT em cookie httpOnly + secure + sameSite=lax**, validade 7 dias. Browser envia automaticamente; JavaScript do cliente não consegue ler — mitiga XSS roubando token.
- **Rate limit em login**: 5 tentativas falhas em 5 min bloqueia o IP por 10 min ([auth/route.ts:17-19](app/api/auth/route.ts#L17)). Best-effort em serverless (estado em memória da função).
- **Autorização por escopo**: toda query inclui `fisio: userId` ou cascateia através de uma entidade do fisio.
- **Cron protegido**: header `x-cron-secret` comparado a env var.

---

## 8. Detalhes Vercel / produção (1 min)

- **Cron nativo** em [vercel.json](vercel.json) chama `/api/cron/sessoes-expiradas` todo dia às 3h da manhã.
- **Mongoose cached connection** em [lib/mongodb.ts](lib/mongodb.ts) — guarda a conexão em `global.mongoose` para sobreviver entre invocações da mesma lambda warm.
- **Modelos importados por side-effect** em rotas que usam `populate` — cada lambda tem seu próprio registro Mongoose, então `populate("paciente")` exige `import "@/lib/models/Paciente"` no topo do arquivo, mesmo sem usar o default export. Sem isso, lambdas cold soltam `MissingSchemaError` que vira 500 silencioso no cliente.

---

## 9. Roadmap / próximos passos (1 min)

- **Anexos e prontuário** estão como placeholder nas abas — modelo `Anexo` já existe em [lib/models/Anexo.ts](lib/models/Anexo.ts).
- **Helper centralizado de fetch** para tratar 401 → redirect automático pra `/login`.
- **Catálogo de exercícios editável pelo fisio** (hoje vem do `exercicioSeed.json` carregado direto no Mongo).
- **Relatórios** — rota `app/api/relatorios/` já existe esqueleto.

---

## Para a demo

Roteiro sugerido (3 min ao vivo):

1. Registrar usuário novo → cair no dashboard.
2. Criar paciente.
3. Abrir paciente → aba Plano → criar plano com 3 exercícios.
4. Aba Sessões → agendar sessão pra daqui 5 minutos.
5. Ir em `/agendamentos` → mostrar a sessão no calendário com botão de play.
6. Clicar play → marcar 2 exercícios como realizado, 1 como adaptado → concluir.
7. Voltar pra aba Sessões → mostrar o status `concluido` e que não é mais editável.
