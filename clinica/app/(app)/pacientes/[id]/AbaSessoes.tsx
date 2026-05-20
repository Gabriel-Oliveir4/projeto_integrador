"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ChevronRight } from "lucide-react";
import { getToken } from "@/lib/utils/token";

interface Sessao {
  _id: string;
  data: string;
  status: string;
  planoTratamento: string;
}

interface PlanoResumo {
  _id: string;
  status: string;
}

const STATUS_COR: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-700",
  em_andamento: "bg-amber-100 text-amber-700",
  concluido: "bg-green-100 text-green-700",
  cancelado: "bg-slate-200 text-slate-600",
  nao_compareceu: "bg-red-100 text-red-700",
};

export default function AbaSessoes({ pacienteId }: { pacienteId: string }) {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [planoAtivoId, setPlanoAtivoId] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [data, setData] = useState("");
  const [obs, setObs] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarPlano();
    buscarSessoes();
  }, []);

  async function buscarPlano() {
    const token = getToken();
    const res = await fetch(`/api/planoTratamento?pacienteId=${pacienteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const lista = await res.json();
    if (!Array.isArray(lista)) return;
    const ativo = lista.find((p: PlanoResumo) => p.status === "ativo");
    setPlanoAtivoId(ativo?._id || null);
  }

  async function buscarSessoes() {
    const token = getToken();
    const res = await fetch(`/api/sessoes?pacienteId=${pacienteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSessoes(Array.isArray(data) ? data : []);
  }

  async function agendar() {
    setErro("");
    if (!planoAtivoId) {
      setErro("Não há plano ativo. Cadastre um plano antes de agendar.");
      return;
    }
    if (!data) {
      setErro("Informe a data da sessão.");
      return;
    }
    setCarregando(true);
    try {
      const token = getToken();
      const res = await fetch("/api/sessoes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          paciente: pacienteId,
          planoTratamento: planoAtivoId,
          data,
          observacoesGerais: obs,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setErro(body.erro || "Erro ao agendar sessão");
        return;
      }
      setModalAberto(false);
      setData("");
      setObs("");
      buscarSessoes();
    } finally {
      setCarregando(false);
    }
  }

  async function excluirSessao(id: string) {
    if (!confirm("Remover esta sessão?")) return;
    const token = getToken();
    await fetch(`/api/sessoes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    buscarSessoes();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-slate-800">Sessões</h2>

        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger>
            <Button disabled={!planoAtivoId}>
              <Plus size={16} className="mr-2" />
              Agendar sessão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar sessão</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Data e hora *</Label>
                <Input type="datetime-local" value={data} onChange={(e) => setData(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Observações gerais</Label>
                <Textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Opcional" />
              </div>
              {erro && <p className="text-sm text-red-500">{erro}</p>}
              <Button className="w-full" onClick={agendar} disabled={carregando}>
                {carregando ? "Salvando..." : "Agendar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!planoAtivoId && (
        <p className="text-sm text-slate-400">Nenhum plano ativo. Crie um plano de tratamento antes.</p>
      )}

      {sessoes.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhuma sessão agendada ainda.</p>
      ) : (
        <ul className="space-y-2">
          {sessoes.map((s) => (
            <li key={s._id} className="border rounded-lg flex items-center justify-between p-3">
              <Link
                href={`/pacientes/${pacienteId}/sessoes/${s._id}`}
                className="flex items-center gap-3 flex-1 hover:opacity-80"
              >
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COR[s.status] || "bg-slate-100"}`}>
                  {s.status}
                </span>
                <span className="text-sm">{new Date(s.data).toLocaleString("pt-BR")}</span>
                <ChevronRight size={14} className="text-slate-400 ml-auto" />
              </Link>
              <Button size="sm" variant="outline" className="ml-3" onClick={() => excluirSessao(s._id)}>
                Excluir
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
