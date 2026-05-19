"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPage() {
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    celular: "",
    senha: "",
    confirmarSenha: "",
  });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    setCarregando(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "register", ...form }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro);
        return;
      }

      localStorage.setItem("token", data.token);
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
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  placeholder="João"
                  value={form.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sobrenome">Sobrenome</Label>
                <Input
                  id="sobrenome"
                  name="sobrenome"
                  placeholder="Silva"
                  value={form.sobrenome}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="celular">Celular</Label>
              <Input
                id="celular"
                name="celular"
                placeholder="(00) 00000-0000"
                value={form.celular}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                name="senha"
                type="password"
                placeholder="••••••••"
                value={form.senha}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar senha</Label>
              <Input
                id="confirmarSenha"
                name="confirmarSenha"
                type="password"
                placeholder="••••••••"
                value={form.confirmarSenha}
                onChange={handleChange}
                required
              />
            </div>

            {erro && <p className="text-sm text-red-500">{erro}</p>}

            <Button type="submit" className="w-full" disabled={carregando}>
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