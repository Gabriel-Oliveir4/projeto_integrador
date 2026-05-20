"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";

interface Exercicio {
  _id: string;
  nome: string;
  descricao: string;
}

interface PlanoExercicioItem {
  _id: string;
  exercicio: Exercicio;
  ordem: number;
}

interface PlanoTratamento {
  _id: string;
  queixa: string;
  historico?: string;
  diagnostico?: string;
  objetivo?: string;
  frequenciaSemanal?: number;
  sessoesPrevistas?: number;
  dataInicio?: string;
  previsaoAlta?: string;
  exercicios?: PlanoExercicioItem[];
  status: string;
}

const formInicial = {
  queixa: "",
  historico: "",
  diagnostico: "",
  objetivo: "",
  frequenciaSemanal: "",
  sessoesPrevistas: "",
  dataInicio: "",
  previsaoAlta: "",
};

export default function AbaPlano({ pacienteId }: { pacienteId: string }) {
  const [planos, setPlanos] = useState<PlanoTratamento[]>([]);
  const [planoAtivo, setPlanoAtivo] = useState<PlanoTratamento | null>(null);
  const [form, setForm] = useState(formInicial);
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [exerciciosSelecionados, setExerciciosSelecionados] = useState<string[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarPlanos();
    buscarExercicios();
  }, []);

  async function buscarPlanos() {
    const res = await fetch(`/api/planoTratamento?pacienteId=${pacienteId}`, {
      credentials: "include",
    });
    const data = await res.json();
    const lista = Array.isArray(data) ? data : [];
    setPlanos(lista);
    setPlanoAtivo(lista.find((p: PlanoTratamento) => p.status === "ativo") || null);
  }

  async function buscarExercicios() {
    const res = await fetch("/api/exercicios", { credentials: "include" });
    const data = await res.json();
    setExercicios(Array.isArray(data) ? data : []);
  }

  function abrirNovo() {
    setEditandoId(null);
    setForm(formInicial);
    setExerciciosSelecionados([]);
    setErro("");
    setModalAberto(true);
  }

  function abrirEditar(plano: PlanoTratamento) {
    setEditandoId(plano._id);
    setForm({
      queixa: plano.queixa,
      historico: plano.historico || "",
      diagnostico: plano.diagnostico || "",
      objetivo: plano.objetivo || "",
      frequenciaSemanal: plano.frequenciaSemanal?.toString() || "",
      sessoesPrevistas: plano.sessoesPrevistas?.toString() || "",
      dataInicio: plano.dataInicio ? plano.dataInicio.slice(0, 10) : "",
      previsaoAlta: plano.previsaoAlta ? plano.previsaoAlta.slice(0, 10) : "",
    });
    setExerciciosSelecionados(
      plano.exercicios?.map((e) => e.exercicio._id) || []
    );
    setErro("");
    setModalAberto(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function toggleExercicio(id: string) {
    setExerciciosSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSalvar() {
    setErro("");
    if (!form.queixa.trim()) {
      setErro("Queixa principal é obrigatória.");
      return;
    }
    if (form.dataInicio && form.previsaoAlta && form.previsaoAlta < form.dataInicio) {
      setErro("Previsão de alta deve ser igual ou após a data de início.");
      return;
    }
    setCarregando(true);

    try {
      const url = editandoId ? `/api/planoTratamento/${editandoId}` : "/api/planoTratamento";
      const method = editandoId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          paciente: pacienteId,
          exerciciosIds: exerciciosSelecionados,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro);
        return;
      }

      setModalAberto(false);
      buscarPlanos();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-slate-800">Plano de Tratamento</h2>

        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button onClick={abrirNovo}>
              <Plus size={16} className="mr-2" />
              Novo plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editandoId ? "Editar plano de tratamento" : "Cadastrar plano de tratamento"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Queixa principal *</Label>
                <Textarea name="queixa" value={form.queixa} onChange={handleChange} placeholder="Descreva a queixa principal" />
              </div>

              <div className="space-y-2">
                <Label>Histórico clínico</Label>
                <Textarea name="historico" value={form.historico} onChange={handleChange} placeholder="Histórico relevante" />
              </div>

              <div className="space-y-2">
                <Label>Diagnóstico</Label>
                <Input name="diagnostico" value={form.diagnostico} onChange={handleChange} placeholder="Diagnóstico" />
              </div>

              <div className="space-y-2">
                <Label>Objetivo</Label>
                <Textarea name="objetivo" value={form.objetivo} onChange={handleChange} placeholder="Objetivos do tratamento" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frequência semanal</Label>
                  <Input name="frequenciaSemanal" type="number" value={form.frequenciaSemanal} onChange={handleChange} placeholder="Ex: 3" />
                </div>
                <div className="space-y-2">
                  <Label>Sessões previstas</Label>
                  <Input name="sessoesPrevistas" type="number" value={form.sessoesPrevistas} onChange={handleChange} placeholder="Ex: 20" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de início</Label>
                  <Input name="dataInicio" type="date" value={form.dataInicio} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Previsão de alta</Label>
                  <Input name="previsaoAlta" type="date" value={form.previsaoAlta} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Exercícios</Label>
                <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                  {exercicios.length === 0 && (
                    <p className="text-sm text-slate-400">
                      Nenhum exercício cadastrado. Rode <code>/api/seed</code> para popular.
                    </p>
                  )}
                  {exercicios.map((ex) => (
                    <label key={ex._id} className="flex items-start gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exerciciosSelecionados.includes(ex._id)}
                        onChange={() => toggleExercicio(ex._id)}
                        className="mt-1"
                      />
                      <span>
                        <span className="font-medium">{ex.nome}</span>
                        <span className="block text-slate-500">{ex.descricao}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {erro && <p className="text-sm text-red-500">{erro}</p>}

              <Button className="w-full" onClick={handleSalvar} disabled={carregando}>
                {carregando ? "Salvando..." : editandoId ? "Salvar alterações" : "Salvar plano"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {planoAtivo ? (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">ativo</span>
            <button
              onClick={() => abrirEditar(planoAtivo)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
            >
              <Pencil size={13} />
              Editar plano
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Queixa principal</p>
              <p className="font-medium">{planoAtivo.queixa}</p>
            </div>
            <div>
              <p className="text-slate-400">Diagnóstico</p>
              <p className="font-medium">{planoAtivo.diagnostico || "—"}</p>
            </div>
            <div>
              <p className="text-slate-400">Objetivo</p>
              <p className="font-medium">{planoAtivo.objetivo || "—"}</p>
            </div>
            <div>
              <p className="text-slate-400">Frequência semanal</p>
              <p className="font-medium">{planoAtivo.frequenciaSemanal ? `${planoAtivo.frequenciaSemanal}x` : "—"}</p>
            </div>
            <div>
              <p className="text-slate-400">Sessões previstas</p>
              <p className="font-medium">{planoAtivo.sessoesPrevistas || "—"}</p>
            </div>
            <div>
              <p className="text-slate-400">Previsão de alta</p>
              <p className="font-medium">{planoAtivo.previsaoAlta ? new Date(planoAtivo.previsaoAlta).toLocaleDateString("pt-BR") : "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400">Histórico clínico</p>
              <p className="font-medium">{planoAtivo.historico || "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400">Exercícios prescritos</p>
              {planoAtivo.exercicios && planoAtivo.exercicios.length > 0 ? (
                <ol className="list-decimal pl-5 space-y-1 mt-1">
                  {planoAtivo.exercicios.map((item) => (
                    <li key={item._id}>
                      <span className="font-medium">{item.exercicio.nome}</span>
                      <span className="text-slate-500"> — {item.exercicio.descricao}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="font-medium">—</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-slate-400 text-sm">Nenhum plano ativo. Crie um novo plano de tratamento.</p>
      )}
    </div>
  );
}
