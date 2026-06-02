import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não está definido.");
}

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 dias

type Tentativa = { count: number; bloqueadoAte: number };
const tentativas = new Map<string, Tentativa>();
const LIMITE_TENTATIVAS = 5;
const JANELA_MS = 5 * 60_000;
const BLOQUEIO_MS = 10 * 60_000;

function ipDaRequest(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function checarBloqueio(ip: string): { bloqueado: boolean; restamMs?: number } {
  const t = tentativas.get(ip);
  if (!t) return { bloqueado: false };
  if (t.bloqueadoAte > Date.now()) {
    return { bloqueado: true, restamMs: t.bloqueadoAte - Date.now() };
  }
  return { bloqueado: false };
}

function registrarFalha(ip: string) {
  const agora = Date.now();
  const t = tentativas.get(ip);
  if (!t || agora - (t.bloqueadoAte - BLOQUEIO_MS) > JANELA_MS) {
    tentativas.set(ip, { count: 1, bloqueadoAte: agora + BLOQUEIO_MS });
    return;
  }
  t.count += 1;
  if (t.count >= LIMITE_TENTATIVAS) {
    t.bloqueadoAte = agora + BLOQUEIO_MS;
  }
}

function limparTentativas(ip: string) {
  tentativas.delete(ip);
}

function setarCookieToken(response: NextResponse, token: string) {
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

function limparCookieToken(response: NextResponse) {
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { acao } = body;

    if (acao === "logout") {
      const res = NextResponse.json({ ok: true });
      limparCookieToken(res);
      return res;
    }

    if (acao === "register") {
      const nome = String(body.nome || "").trim();
      const sobrenome = String(body.sobrenome || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const senha = String(body.senha || "");
      const celular = body.celular ? String(body.celular) : undefined;

      if (!nome || !sobrenome || !email) {
        return NextResponse.json({ erro: "Preencha nome, sobrenome e e-mail." }, { status: 400 });
      }
      if (senha.length < 8) {
        return NextResponse.json({ erro: "Senha deve ter no mínimo 8 caracteres." }, { status: 400 });
      }

      const existe = await User.findOne({ email });
      if (existe) {
        return NextResponse.json({ erro: "E-mail já cadastrado" }, { status: 400 });
      }

      const hash = await bcrypt.hash(senha, 10);
      const user = await User.create({ nome, sobrenome, email, senha: hash, celular });
      const token = jwt.sign({ id: user._id }, JWT_SECRET as string, { expiresIn: "7d" });

      const res = NextResponse.json({ user: { nome, email } }, { status: 201 });
      setarCookieToken(res, token);
      return res;
    }

    if (acao === "login") {
      const ip = ipDaRequest(request);
      const bloqueio = checarBloqueio(ip);
      if (bloqueio.bloqueado) {
        const min = Math.ceil((bloqueio.restamMs || 0) / 60_000);
        return NextResponse.json(
          { erro: `Muitas tentativas. Tente novamente em ${min} min.` },
          { status: 429 }
        );
      }

      const email = String(body.email || "").trim().toLowerCase();
      const senha = String(body.senha || "");

      const user = await User.findOne({ email }).select("+senha");
      if (!user) {
        registrarFalha(ip);
        return NextResponse.json({ erro: "Credenciais inválidas" }, { status: 401 });
      }

      const senhaCorreta = await bcrypt.compare(senha, user.senha);
      if (!senhaCorreta) {
        registrarFalha(ip);
        return NextResponse.json({ erro: "Credenciais inválidas" }, { status: 401 });
      }

      limparTentativas(ip);
      const token = jwt.sign({ id: user._id }, JWT_SECRET as string, { expiresIn: "7d" });

      const res = NextResponse.json({ user: { nome: user.nome, email } });
      setarCookieToken(res, token);
      return res;
    }

    return NextResponse.json({ erro: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Erro interno do servidor" }, { status: 500 });
  }
}
