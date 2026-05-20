import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não está definido nas variáveis de ambiente.");
}

function lerTokenDoCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function verificarToken(request: Request) {
  const token = lerTokenDoCookie(request);

  if (!token) {
    return { erro: NextResponse.json({ erro: "Não autenticado" }, { status: 401 }) };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as { id: string };
    return { userId: decoded.id };
  } catch {
    return { erro: NextResponse.json({ erro: "Token inválido ou expirado" }, { status: 401 }) };
  }
}
