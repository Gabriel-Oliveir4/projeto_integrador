"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "login", email, senha }),
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
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Acesse sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            {erro && <p className="text-sm text-red-500">{erro}</p>}

            <Button type="submit" className="w-full" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
            </Button>

            <p className="text-sm text-center text-slate-500">
              Não tem conta?{" "}
              <a href="/register" className="text-slate-900 underline">
                Cadastre-se
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}