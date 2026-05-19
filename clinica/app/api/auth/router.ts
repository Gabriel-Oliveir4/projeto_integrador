import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { acao } = body;

    // registro/cadastro
    if (acao === "register") {
      const { nome, sobrenome, email, senha, celular } = body;

      // Verifica se já existe usuário com esse e-mail
      const existe = await User.findOne({ email });
      if (existe) {
        return NextResponse.json({ erro: "E-mail já cadastrado" }, { status: 400 });
      }

      // Transforma a senha em hash
      const hash = await bcrypt.hash(senha, 10);

      const user = await User.create({ nome, sobrenome, email, senha: hash, celular });

      // Gera o token JWT no cadastro
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

      return NextResponse.json({ token, user: { nome, email } }, { status: 201 });
    }

    if (acao === "login") {
      const { email, senha } = body;

      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ erro: "Credenciais inválidas" }, { status: 401 });
      }

      const senhaCorreta = await bcrypt.compare(senha, user.senha);
      if (!senhaCorreta) {
        return NextResponse.json({ erro: "Credenciais inválidas" }, { status: 401 });
      }

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

      return NextResponse.json({ token, user: { nome: user.nome, email } });
    }

    return NextResponse.json({ erro: "Ação inválida" }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ erro: "Erro interno do servidor" }, { status: 500 });
  }
}