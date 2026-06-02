import { NextResponse } from "next/server";
import Sessao from "@/lib/models/sessao";
import { apiHandler } from "@/lib/apiHandler";

export const PUT = apiHandler(async (request, userId, params) => {
  const body = await request.json();
  const set: any = {};
  if (body.status !== undefined) set["exercicios.$.status"] = body.status;
  if (body.comentario !== undefined) set["exercicios.$.comentario"] = body.comentario;

  const sessao = await Sessao.findOneAndUpdate(
    { _id: params.id, fisio: userId, "exercicios._id": params.exercicioId },
    { $set: set },
    { new: true, runValidators: true }
  ).lean();

  if (!sessao) return NextResponse.json({ erro: "Exercício da sessão não encontrado" }, { status: 404 });

  const item = ((sessao as any).exercicios || []).find(
    (e: any) => String(e._id) === String(params.exercicioId)
  );
  return NextResponse.json(item);
});
