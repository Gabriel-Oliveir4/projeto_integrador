import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verificarToken } from "@/lib/auth";

//simplifica o router em cara router. verifica token, conecta no banco e executa a lógica da rota
export function apiHandler(
  handler: (request: Request, userId: string, params?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: { params?: any }) => {
    const auth = verificarToken(request);
    if (auth.erro) return auth.erro;

    try {
      await connectDB();
      return await handler(request, auth.userId!, context?.params);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ erro: "Erro interno do servidor" }, { status: 500 });
    }
  };
}