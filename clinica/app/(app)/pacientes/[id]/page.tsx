"use client";

import { useState, useEffect, use } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getToken } from "@/lib/utils/token";
import AbaPlano from "./AbaPlano";

interface Paciente {
  _id: string;
  nome: string;
  sobrenome: string;
  dataNascimento?: string;
  sexo?: string;
  celular?: string;
  observacoes?: string;
  status: string;
}

export default function PacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [paciente, setPaciente] = useState<Paciente | null>(null);

  useEffect(() => {
    async function buscar() {
      const token = getToken();
      const res = await fetch(`/api/pacientes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPaciente(data);
    }
    buscar();
  }, [id]);

  if (!paciente) return <p className="text-slate-400">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">{paciente.nome} {paciente.sobrenome}</h1>
        <span className={`text-xs px-2 py-1 rounded-full ${
          paciente.status === "ativo" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
        }`}>
          {paciente.status}
        </span>
      </div>

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="plano">Plano de Tratamento</TabsTrigger>
          <TabsTrigger value="sessoes">Sessões</TabsTrigger>
          <TabsTrigger value="anexos">Anexos</TabsTrigger>
          <TabsTrigger value="prontuario">Prontuário</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Nome completo</p>
              <p className="font-medium">{paciente.nome} {paciente.sobrenome}</p>
            </div>
            <div>
              <p className="text-slate-400">Celular</p>
              <p className="font-medium">{paciente.celular || "—"}</p>
            </div>
            <div>
              <p className="text-slate-400">Data de nascimento</p>
              <p className="font-medium">{paciente.dataNascimento ? new Date(paciente.dataNascimento).toLocaleDateString("pt-BR") : "—"}</p>
            </div>
            <div>
              <p className="text-slate-400">Sexo</p>
              <p className="font-medium">{paciente.sexo || "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400">Observações</p>
              <p className="font-medium">{paciente.observacoes || "—"}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="plano" className="mt-4">
          <AbaPlano pacienteId={id} />
        </TabsContent>

        <TabsContent value="sessoes" className="mt-4">
          <p className="text-slate-400 text-sm">Em breve...</p>
        </TabsContent>

        <TabsContent value="anexos" className="mt-4">
          <p className="text-slate-400 text-sm">Em breve...</p>
        </TabsContent>

        <TabsContent value="prontuario" className="mt-4">
          <p className="text-slate-400 text-sm">Em breve...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}