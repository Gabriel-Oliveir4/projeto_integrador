import { NextResponse } from "next/server";
import Sessao from "@/lib/models/sessao";
import SessaoExercicio from "@/lib/models/SessaoExercicio";
import PlanoExercicio from "@/lib/models/PlanoExercicio";
import "@/lib/models/Exercicio";
import { apiHandler } from "@/lib/apiHandler";

// Listar sessões do fisio logado (filtra opcionalmente por paciente/plano/range de datas)
export const GET = apiHandler(async (request, userId) => {
  const { searchParams } = new URL(request.url);
  const filtro: any = { fisio: userId };
  const pacienteId = searchParams.get("pacienteId");
  const planoId = searchParams.get("planoId");
  const de = searchParams.get("de");
  const ate = searchParams.get("ate");
  if (pacienteId) filtro.paciente = pacienteId;
  if (planoId) filtro.planoTratamento = planoId;
  if (de || ate) {
    filtro.data = {};
    if (de) filtro.data.$gte = new Date(de);
    if (ate) filtro.data.$lte = new Date(ate);
  }
  const sessoes = await Sessao.find(filtro).populate("paciente", "nome sobrenome").sort({ data: 1 });
  return NextResponse.json(sessoes);
});

// Agendar sessão — checa conflito de horário, cria Sessao + SessaoExercicio
export const POST = apiHandler(async (request, userId) => {
  const body = await request.json();
  // body: { paciente, planoTratamento, data, observacoesGerais? }

  const dataSessao = new Date(body.data);

  if (dataSessao < new Date()) {
    return NextResponse.json(
      { erro: "Não é possível agendar uma sessão em uma data que já passou." },
      { status: 400 }
    );
  }

  const conflito = await Sessao.findOne({
    fisio: userId,
    data: dataSessao,
    status: { $in: ["agendado", "em_andamento"] },
  });
  if (conflito) {
    return NextResponse.json(
      { erro: "Já existe uma sessão agendada neste horário." },
      { status: 409 }
    );
  }

  const sessao = await Sessao.create({ ...body, fisio: userId });

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
