"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CampoErro } from "@/components/ui/campo-erro";
import { mascaraCelular, celularValido, emailValido, senhaForte } from "@/lib/utils/mascaras";

export default function RegisterPage() {
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    celular: "",
    senha: "",
    confirmarSenha: "",
  });
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const novo = name === "celular" ? mascaraCelular(value) : value;
    setForm({ ...form, [name]: novo });
    if (erros[name]) setErros({ ...erros, [name]: "" });
  }

  function validar(): boolean {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = "Campo obrigatório";
    if (!form.sobrenome.trim()) e.sobrenome = "Campo obrigatório";
    if (!form.email.trim()) e.email = "Campo obrigatório";
    else if (!emailValido(form.email)) e.email = "E-mail inválido";
    if (form.celular && !celularValido(form.celular)) e.celular = "Celular inválido";
    const checkSenha = senhaForte(form.senha);
    if (!checkSenha.ok) e.senha = checkSenha.msg!;
    if (form.senha !== form.confirmarSenha) e.confirmarSenha = "Senhas não coincidem";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    setErro("");
    if (!validar()) return;
    setCarregando(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ acao: "register", ...form }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro);
        return;
      }

      window.location.href = "/dashboard";
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Preencha os dados para se cadastrar</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome <span className="text-red-500">*</span></Label>
                <Input id="nome" name="nome" placeholder="João" value={form.nome} onChange={handleChange} />
                <CampoErro msg={erros.nome} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sobrenome">Sobrenome <span className="text-red-500">*</span></Label>
                <Input id="sobrenome" name="sobrenome" placeholder="Silva" value={form.sobrenome} onChange={handleChange} />
                <CampoErro msg={erros.sobrenome} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail <span className="text-red-500">*</span></Label>
              <Input id="email" name="email" type="email" placeholder="seu@email.com" value={form.email} onChange={handleChange} />
              <CampoErro msg={erros.email} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="celular">Celular</Label>
              <Input id="celular" name="celular" placeholder="(00) 00000-0000" value={form.celular} onChange={handleChange} inputMode="numeric" />
              <CampoErro msg={erros.celular} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha <span className="text-red-500">*</span></Label>
              <Input id="senha" name="senha" type="password" placeholder="••••••••" value={form.senha} onChange={handleChange} />
              <CampoErro msg={erros.senha} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar senha <span className="text-red-500">*</span></Label>
              <Input id="confirmarSenha" name="confirmarSenha" type="password" placeholder="••••••••" value={form.confirmarSenha} onChange={handleChange} />
              <CampoErro msg={erros.confirmarSenha} />
            </div>

            {erro && <p className="text-sm text-red-500">{erro}</p>}

            <Button type="button" onClick={handleRegister} className="w-full" disabled={carregando}>
              {carregando ? "Cadastrando..." : "Criar conta"}
            </Button>

            <p className="text-sm text-center text-slate-500">
              Já tem conta?{" "}
              <a href="/login" className="text-slate-900 underline">
                Entrar
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
