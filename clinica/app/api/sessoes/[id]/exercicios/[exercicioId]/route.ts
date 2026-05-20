import { NextResponse } from "next/server";
import SessaoExercicio from "@/lib/models/SessaoExercicio";
import { apiHandler } from "@/lib/apiHandler";

// Atualizar status/comentário de um exercício dentro de uma sessão
export const PUT = apiHandler(async (request, _userId, params) => {
  const body = await request.json(); // { status?, comentario? }
  const updated = await SessaoExercicio.findOneAndUpdate(
    { sessao: params.id, _id: params.exercicioId },
    body,
    { new: true, runValidators: true }
  );
  if (!updated) return NextResponse.json({ erro: "Exercício da sessão não encontrado" }, { status: 404 });
  return NextResponse.json(updated);
});
