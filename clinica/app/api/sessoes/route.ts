import { NextResponse } from "next/server";
import Sessao from "@/lib/models/sessao";
import Paciente from "@/lib/models/Paciente";
import { apiHandler } from "@/lib/apiHandler";

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

  const sessoes = await Sessao.find(filtro)
    .select("-exercicios")
    .sort({ data: 1 })
    .lean();

  const resposta = sessoes.map((s: any) => ({
    ...s,
    paciente: { _id: s.paciente, nome: s.pacienteNome?.split(" ")[0] || "", sobrenome: s.pacienteNome?.split(" ").slice(1).join(" ") || "" },
  }));

  return NextResponse.json(resposta);
});

export const POST = apiHandler(async (request, userId) => {
  const body = await request.json();
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
  }).select("_id").lean();
  if (conflito) {
    return NextResponse.json(
      { erro: "Já existe uma sessão agendada neste horário." },
      { status: 409 }
    );
  }

  const paciente = await Paciente.findOne(
    { _id: body.paciente, fisio: userId, "planos._id": body.planoTratamento },
    { nome: 1, sobrenome: 1, "planos.$": 1 }
  ).lean();
  if (!paciente) {
    return NextResponse.json({ erro: "Paciente ou plano não encontrado." }, { status: 404 });
  }

  const plano: any = paciente.planos[0];
  const exerciciosEmbed = (plano.exercicios || []).map((e: any) => ({
    exercicio: e.exercicio,
    nome: e.nome,
    descricao: e.descricao,
    ordem: e.ordem,
    status: "realizado",
  }));

  const sessao = await Sessao.create({
    fisio: userId,
    paciente: body.paciente,
    pacienteNome: `${paciente.nome} ${paciente.sobrenome}`.trim(),
    planoTratamento: body.planoTratamento,
    planoQueixa: plano.queixa,
    data: dataSessao,
    observacoesGerais: body.observacoesGerais,
    exercicios: exerciciosEmbed,
  });

  await Paciente.updateOne(
    { _id: body.paciente },
    {
      $set: {
        proximaSessao: dataSessao,
      },
    }
  );

  return NextResponse.json(sessao, { status: 201 });
});
