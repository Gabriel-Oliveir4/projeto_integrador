"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { getToken } from "@/lib/utils/token";

interface Paciente {
  _id: string;
  nome: string;
  sobrenome: string;
  celular?: string;
  status: string;
}

const formInicial = {
  nome: "",
  sobrenome: "",
  dataNascimento: "",
  sexo: "",
  celular: "",
  observacoes: "",
};

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [form, setForm] = useState(formInicial);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarPacientes();
  }, []);

  async function buscarPacientes() {
    const token = getToken();
    const res = await fetch("/api/pacientes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setPacientes(data);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCadastrar() {
    setErro("");
    setCarregando(true);

    try {
      const token = getToken();
      const res = await fetch("/api/pacientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro);
        return;
      }

      setModalAberto(false);
      setForm(formInicial);
      buscarPacientes();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Pacientes</h1>

        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger>
            <Button>
              <Plus size={16} className="mr-2" />
              Novo paciente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar paciente</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input name="nome" value={form.nome} onChange={handleChange} placeholder="João" />
                </div>
                <div className="space-y-2">
                  <Label>Sobrenome</Label>
                  <Input name="sobrenome" value={form.sobrenome} onChange={handleChange} placeholder="Silva" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de nascimento</Label>
                  <Input name="dataNascimento" type="date" value={form.dataNascimento} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Sexo</Label>
                  <select
                    name="sexo"
                    value={form.sexo}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Celular</Label>
                <Input name="celular" value={form.celular} onChange={handleChange} placeholder="(00) 00000-0000" />
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Input name="observacoes" value={form.observacoes} onChange={handleChange} placeholder="Opcional" />
              </div>

              {erro && <p className="text-sm text-red-500">{erro}</p>}

              <Button className="w-full" onClick={handleCadastrar} disabled={carregando}>
                {carregando ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Celular</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pacientes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                Nenhum paciente cadastrado
              </TableCell>
            </TableRow>
          ) : (
            pacientes.map((p) => (
              <TableRow key={p._id}>
                <TableCell>{p.nome} {p.sobrenome}</TableCell>
                <TableCell>{p.celular || "—"}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    p.status === "ativo" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {p.status}
                  </span>
                </TableCell>
                <TableCell>
                  <a href={`/pacientes/${p._id}`} className="text-sm text-slate-500 hover:text-slate-900 underline">
                    Ver
                  </a>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}