"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogConfirmar } from "@/components/ui/dialog-confirmar";

interface Exercicio {
  _id: string;
  nome: string;
  descricao: string;
}

interface SessaoExercicio {
  _id: string;
  exercicio: Exercicio;
  status: string;
  comentario?: string;
}

interface Sessao {
  _id: string;
  data: string;
  status: string;
  observacoesGerais?: string;
}

const STATUS_EXERCICIO = ["realizado", "adaptado", "nao_realizado", "superado"];

const STATUS_COR: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-700",
  em_andamento: "bg-amber-100 text-amber-700",
  concluido: "bg-green-100 text-green-700",
  cancelado: "bg-slate-200 text-slate-600",
  nao_compareceu: "bg-red-100 text-red-700",
};

const STATUS_FINALIZADOS = ["concluido", "cancelado", "nao_compareceu"];

type ConfirmacaoPendente = "concluir" | "cancelar" | "falta" | null;

export default function DetalheSessao({ sessaoId, onAtualizar }: { sessaoId: string; onAtualizar?: () => void }) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [exercicios, setExercicios] = useState<SessaoExercicio[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [salvandoIds, setSalvandoIds] = useState<string[]>([]);
  const [confirmacao, setConfirmacao] = useState<ConfirmacaoPendente>(null);
  const [confirmandoAcao, setConfirmandoAcao] = useState(false);

  const trancada = !!sessao && STATUS_FINALIZADOS.includes(sessao.status);

  useEffect(() => {
    buscar();
  }, [sessaoId]);

  async function buscar() {
    const res = await fetch(`/api/sessoes/${sessaoId}`, { credentials: "include" });
    const data = await res.json();
    if (!res.ok) return;
    setSessao(data.sessao);
    setExercicios(Array.isArray(data.exercicios) ? data.exercicios : []);
    setObservacoes(data.sessao?.observacoesGerais || "");
  }

  async function atualizarSessao(campos: Partial<Sessao>) {
    await fetch(`/api/sessoes/${sessaoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(campos),
    });
    await buscar();
    onAtualizar?.();
  }

  async function salvarExercicio(item: SessaoExercicio) {
    setSalvandoIds((prev) => [...prev, item._id]);
    try {
      await fetch(`/api/sessoes/${sessaoId}/exercicios/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: item.status, comentario: item.comentario }),
      });
    } finally {
      setSalvandoIds((prev) => prev.filter((id) => id !== item._id));
    }
  }

  function atualizarItem(id: string, campos: Partial<SessaoExercicio>) {
    setExercicios((prev) => prev.map((x) => (x._id === id ? { ...x, ...campos } : x)));
  }

  async function confirmarAcao() {
    setConfirmandoAcao(true);
    try {
      if (confirmacao === "concluir") {
        await atualizarSessao({ observacoesGerais: observacoes, status: "concluido" });
      } else if (confirmacao === "cancelar") {
        await atualizarSessao({ status: "cancelado" });
      } else if (confirmacao === "falta") {
        await atualizarSessao({ status: "nao_compareceu" });
      }
    } finally {
      setConfirmandoAcao(false);
      setConfirmacao(null);
    }
  }

  const dialogProps: Record<NonNullable<ConfirmacaoPendente>, { titulo: string; descricao: string; variant: "default" | "destrutivo" }> = {
    concluir: {
      titulo: "Concluir sessão",
      descricao: "Depois disso a sessão não poderá mais ser editada.",
      variant: "default",
    },
    cancelar: {
      titulo: "Cancelar sessão",
      descricao: "Tem certeza que deseja cancelar esta sessão?",
      variant: "destrutivo",
    },
    falta: {
      titulo: "Marcar falta",
      descricao: "Marcar que o paciente não compareceu a esta sessão?",
      variant: "destrutivo",
    },
  };

  if (!sessao) return <p className="text-sm text-slate-400">Carregando sessão...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            {new Date(sessao.data).toLocaleString("pt-BR")}
          </h1>
          <span
            className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${STATUS_COR[sessao.status] || "bg-slate-100"}`}
          >
            {sessao.status}
          </span>
        </div>

        <div className="flex gap-2">
          {sessao.status === "agendado" && (
            <>
              <Button size="sm" variant="outline" onClick={() => setConfirmacao("falta")}>
                Não compareceu
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirmacao("cancelar")}>
                Cancelar
              </Button>
              <Button size="sm" onClick={() => atualizarSessao({ status: "em_andamento" })}>
                Iniciar sessão
              </Button>
            </>
          )}
          {sessao.status === "em_andamento" && (
            <Button size="sm" onClick={() => setConfirmacao("concluir")}>
              Concluir sessão
            </Button>
          )}
        </div>
      </div>

      {trancada && (
        <div className="text-xs px-3 py-2 rounded bg-slate-100 text-slate-600">
          Sessão {sessao.status} — não pode mais ser editada.
        </div>
      )}

      <div className="space-y-2">
        <Label>Observações gerais</Label>
        <Textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          onBlur={() => {
            if (!trancada && observacoes !== (sessao.observacoesGerais || "")) {
              atualizarSessao({ observacoesGerais: observacoes });
            }
          }}
          disabled={trancada}
          placeholder="Observações da sessão"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-700">Exercícios</h3>
        {exercicios.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum exercício nesta sessão.</p>
        ) : (
          exercicios.map((item) => (
            <div key={item._id} className="border rounded-md p-3 space-y-2">
              <div>
                <p className="font-medium text-sm">{item.exercicio?.nome}</p>
                <p className="text-xs text-slate-500">{item.exercicio?.descricao}</p>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Status</Label>
                <select
                  className="border rounded px-2 py-1 text-sm disabled:bg-slate-50 disabled:text-slate-400"
                  value={item.status}
                  onChange={(e) => atualizarItem(item._id, { status: e.target.value })}
                  disabled={trancada}
                >
                  {STATUS_EXERCICIO.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <Textarea
                placeholder="Comentário desta sessão"
                value={item.comentario || ""}
                onChange={(e) => atualizarItem(item._id, { comentario: e.target.value })}
                disabled={trancada}
              />
              {!trancada && (
                <Button
                  size="sm"
                  onClick={() => salvarExercicio(item)}
                  disabled={salvandoIds.includes(item._id)}
                >
                  {salvandoIds.includes(item._id) ? "Salvando..." : "Salvar"}
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {confirmacao && (
        <DialogConfirmar
          open
          onOpenChange={(v) => { if (!v) setConfirmacao(null); }}
          titulo={dialogProps[confirmacao].titulo}
          descricao={dialogProps[confirmacao].descricao}
          variant={dialogProps[confirmacao].variant}
          onConfirmar={confirmarAcao}
          carregando={confirmandoAcao}
        />
      )}
    </div>
  );
}
