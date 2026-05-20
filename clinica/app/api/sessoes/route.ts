import { NextResponse } from "next/server";
import Sessao from "@/lib/models/sessao";
import SessaoExercicio from "@/lib/models/SessaoExercicio";
import PlanoExercicio from "@/lib/models/PlanoExercicio";
import "@/lib/models/Exercicio";
import { apiHandler } from "@/lib/apiHandler";

// Listar sessões (filtra por paciente ou plano)
export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const filtro: any = {};
  const pacienteId = searchParams.get("pacienteId");
  const planoId = searchParams.get("planoId");
  if (pacienteId) filtro.paciente = pacienteId;
  if (planoId) filtro.planoTratamento = planoId;
  const sessoes = await Sessao.find(filtro).sort({ data: -1 });
  return NextResponse.json(sessoes);
});

// Agendar sessão — cria Sessao + N SessaoExercicio (1 por PlanoExercicio do plano)
export const POST = apiHandler(async (request) => {
  const body = await request.json();
  // body: { paciente, planoTratamento, data, observacoesGerais? }

  const sessao = await Sessao.create(body);

  const planoExs = await PlanoExercicio.find({ planotratamento: body.planoTratamento }).sort({ ordem: 1 });
  if (planoExs.length > 0) {
    await SessaoExercicio.insertMany(
      planoExs.map((pe) => ({
        sessao: sessao._id,
        exercicio: pe.exercicio,
        status: "realizado",
      }))
    );
  }

  return NextResponse.json(sessao, { status: 201 });
});
