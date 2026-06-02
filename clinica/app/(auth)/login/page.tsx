"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, EmailOutlined, LockOutlined } from "@mui/icons-material";
import { emailValido } from "@/lib/utils/mascaras";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.50",
        p: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 440, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h1" fontWeight={600}>
              Entrar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Acesse sua conta para continuar
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              required
              fullWidth
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (erros.email) setErros({ ...erros, email: "" });
              }}
              error={!!erros.email}
              helperText={erros.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Senha"
              type={mostrarSenha ? "text" : "password"}
              placeholder="••••••••"
              required
              fullWidth
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                if (erros.senha) setErros({ ...erros, senha: "" });
              }}
              error={!!erros.senha}
              helperText={erros.senha}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setMostrarSenha((v) => !v)}
                      edge="end"
                      size="small"
                    >
                      {mostrarSenha ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {erro && <Alert severity="error">{erro}</Alert>}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={carregando}
              sx={{ mt: 1, py: 1.25 }}
            >
              {carregando ? <CircularProgress size={22} color="inherit" /> : "Entrar"}
            </Button>

            <Typography variant="body2" align="center" color="text.secondary">
              Não tem conta?{" "}
              <MuiLink href="/register" underline="hover" color="text.primary" fontWeight={500}>
                Cadastre-se
              </MuiLink>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
