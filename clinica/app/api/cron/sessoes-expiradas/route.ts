import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Sessao from "@/lib/models/sessao";

// chamado pelo cron da Vercel (vercel.json) ou por qualquer scheduler externo.
// marca como "nao_compareceu" sessões agendadas que passaram 24h sem atualização de status
export async function GET(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  await dbConnect();

  const limite = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const resultado = await Sessao.updateMany(
    { status: "agendado", data: { $lt: limite } },
    { $set: { status: "nao_compareceu" } }
  );

  return NextResponse.json({ atualizadas: resultado.modifiedCount });
}
