"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Paciente {
  _id: string;
  nome: string;
  sobrenome: string;
}

interface Sessao {
  _id: string;
  data: string;
  status: string;
  paciente: Paciente | string;
}

const STATUS_COR: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-700 border-blue-200",
  em_andamento: "bg-amber-100 text-amber-700 border-amber-200",
  concluido: "bg-green-100 text-green-700 border-green-200",
  cancelado: "bg-slate-200 text-slate-600 border-slate-300",
  nao_compareceu: "bg-red-100 text-red-700 border-red-200",
};

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function nomePaciente(p: Paciente | string): string {
  if (typeof p === "string") return "";
  return `${p.nome} ${p.sobrenome}`.trim();
}

export default function AgendamentosPage() {
  const router = useRouter();
  const hoje = new Date();
  const [cursor, setCursor] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [carregando, setCarregando] = useState(false);

  const { primeiroDia, diasNoMes } = useMemo(() => {
    const primeiro = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const ultimo = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    return { primeiroDia: primeiro.getDay(), diasNoMes: ultimo.getDate() };
  }, [cursor]);

  useEffect(() => {
    buscar();
  }, [cursor]);

  async function buscar() {
    setCarregando(true);
    try {
      const de = new Date(cursor.getFullYear(), cursor.getMonth(), 1).toISOString();
      const ate = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59).toISOString();
      const res = await fetch(`/api/sessoes?de=${de}&ate=${ate}`, {
        credentials: "include",
      });
      const data = await res.json();
      setSessoes(Array.isArray(data) ? data : []);
    } finally {
      setCarregando(false);
    }
  }

  function sessoesDoDia(dia: number): Sessao[] {
    return sessoes
      .filter((s) => {
        const d = new Date(s.data);
        return (
          d.getFullYear() === cursor.getFullYear() &&
          d.getMonth() === cursor.getMonth() &&
          d.getDate() === dia
        );
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }

  function podeIniciar(s: Sessao) {
    if (s.status !== "agendado") return false;
    const agora = Date.now();
    const data = new Date(s.data).getTime();
    // janela de 15 min antes até 4 h depois
    return agora >= data - 15 * 60_000 && agora <= data + 4 * 60 * 60_000;
  }

  async function iniciarSessao(s: Sessao) {
    const res = await fetch(`/api/sessoes/${s._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: "em_andamento" }),
    });
    if (res.ok) {
      const pacienteId =
        typeof s.paciente === "string" ? s.paciente : (s.paciente as Paciente)._id;
      router.push(`/pacientes/${pacienteId}/sessoes/${s._id}`);
    }
  }

  function navegar(passos: number) {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + passos, 1));
  }

  const hojeAno = hoje.getFullYear();
  const hojeMes = hoje.getMonth();
  const hojeDia = hoje.getDate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Agendamentos</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navegar(-1)}>
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {MESES[cursor.getMonth()]} {cursor.getFullYear()}
          </span>
          <Button variant="outline" size="sm" onClick={() => navegar(1)}>
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(new Date(hoje.getFullYear(), hoje.getMonth(), 1))}
          >
            Hoje
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 border rounded-lg overflow-hidden text-sm">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="bg-slate-50 text-center py-2 font-medium text-slate-500 text-xs">
            {d}
          </div>
        ))}

        {Array.from({ length: primeiroDia }).map((_, i) => (
          <div key={`pad-${i}`} className="bg-white min-h-[110px]" />
        ))}

        {Array.from({ length: diasNoMes }).map((_, i) => {
          const dia = i + 1;
          const lista = sessoesDoDia(dia);
          const eHoje =
            cursor.getFullYear() === hojeAno &&
            cursor.getMonth() === hojeMes &&
            dia === hojeDia;
          return (
            <div key={dia} className="bg-white min-h-[110px] p-1.5 space-y-1">
              <div
                className={`text-xs font-medium ${
                  eHoje ? "text-blue-600" : "text-slate-500"
                }`}
              >
                {dia}
              </div>
              {lista.map((s) => {
                const hora = new Date(s.data).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const iniciavel = podeIniciar(s);
                return (
                  <div
                    key={s._id}
                    className={`text-[11px] border rounded px-1.5 py-1 ${
                      STATUS_COR[s.status] || "bg-slate-100 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <button
                        onClick={() => {
                          const pid =
                            typeof s.paciente === "string"
                              ? s.paciente
                              : (s.paciente as Paciente)._id;
                          router.push(`/pacientes/${pid}/sessoes/${s._id}`);
                        }}
                        className="text-left flex-1 truncate hover:underline"
                      >
                        <span className="font-medium">{hora}</span>{" "}
                        <span>{nomePaciente(s.paciente)}</span>
                      </button>
                      {iniciavel && (
                        <button
                          title="Iniciar sessão"
                          onClick={(e) => {
                            e.stopPropagation();
                            iniciarSessao(s);
                          }}
                          className="text-green-700 hover:text-green-900"
                        >
                          <Play size={12} fill="currentColor" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {carregando && <p className="text-xs text-slate-400">Carregando...</p>}
    </div>
  );
}
