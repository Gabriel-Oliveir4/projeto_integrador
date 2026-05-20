"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CampoErro } from "@/components/ui/campo-erro";
import { emailValido } from "@/lib/utils/mascaras";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function validar(): boolean {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Campo obrigatório";
    else if (!emailValido(email)) e.email = "E-mail inválido";
    if (!senha) e.senha = "Campo obrigatório";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    setErro("");
    if (!validar()) return;
    setCarregando(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ acao: "login", email, senha }),
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
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Acesse sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (erros.email) setErros({ ...erros, email: "" });
                }}
              />
              <CampoErro msg={erros.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha <span className="text-red-500">*</span></Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  if (erros.senha) setErros({ ...erros, senha: "" });
                }}
              />
              <CampoErro msg={erros.senha} />
            </div>

            {erro && <p className="text-sm text-red-500">{erro}</p>}

            <Button className="w-full" onClick={handleLogin} disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
            </Button>

            <p className="text-sm text-center text-slate-500">
              Não tem conta?{" "}
              <a href="/register" className="text-slate-900 underline">
                Cadastre-se
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
