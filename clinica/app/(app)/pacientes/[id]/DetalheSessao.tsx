"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getToken } from "@/lib/utils/token";

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

const STATUS_SESSAO = ["agendado", "em_andamento", "concluido", "cancelado", "nao_compareceu"];
const STATUS_EXERCICIO = ["realizado", "adaptado", "nao_realizado", "superado"];

export default function DetalheSessao({ sessaoId, onAtualizar }: { sessaoId: string; onAtualizar?: () => void }) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [exercicios, setExercicios] = useState<SessaoExercicio[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [salvandoIds, setSalvandoIds] = useState<string[]>([]);

  useEffect(() => {
    buscar();
  }, [sessaoId]);

  async function buscar() {
    const token = getToken();
    const res = await fetch(`/api/sessoes/${sessaoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return;
    setSessao(data.sessao);
    setExercicios(Array.isArray(data.exercicios) ? data.exercicios : []);
    setObservacoes(data.sessao?.observacoesGerais || "");
  }

  async function atualizarSessao(campos: Partial<Sessao>) {
    const token = getToken();
    await fetch(`/api/sessoes/${sessaoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(campos),
    });
    await buscar();
    onAtualizar?.();
  }

  async function salvarExercicio(item: SessaoExercicio) {
    setSalvandoIds((prev) => [...prev, item._id]);
    try {
      const token = getToken();
      await fetch(`/api/sessoes/${sessaoId}/exercicios/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: item.status, comentario: item.comentario }),
      });
    } finally {
      setSalvandoIds((prev) => prev.filter((id) => id !== item._id));
    }
  }

  function atualizarItem(id: string, campos: Partial<SessaoExercicio>) {
    setExercicios((prev) => prev.map((x) => (x._id === id ? { ...x, ...campos } : x)));
  }

  if (!sessao) return <p className="text-sm text-slate-400">Carregando sessão...</p>;

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Sessão</p>
          <p className="font-medium">{new Date(sessao.data).toLocaleString("pt-BR")}</p>
        </div>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={sessao.status}
          onChange={(e) => atualizarSessao({ status: e.target.value })}
        >
          {STATUS_SESSAO.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Observações gerais</Label>
        <Textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          onBlur={() => atualizarSessao({ observacoesGerais: observacoes })}
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
                  className="border rounded px-2 py-1 text-sm"
                  value={item.status}
                  onChange={(e) => atualizarItem(item._id, { status: e.target.value })}
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
              />
              <Button
                size="sm"
                onClick={() => salvarExercicio(item)}
                disabled={salvandoIds.includes(item._id)}
              >
                {salvandoIds.includes(item._id) ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
