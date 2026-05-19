import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function verificarToken(request: Request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { erro: NextResponse.json({ erro: "Token não enviado" }, { status: 401 }) };
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return { userId: decoded.id };
  } catch {
    return { erro: NextResponse.json({ erro: "Token inválido ou expirado" }, { status: 401 }) };
  }
}