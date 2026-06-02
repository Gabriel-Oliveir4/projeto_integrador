import { NextResponse } from "next/server";
import Paciente from "@/lib/models/Paciente";
import Exercicio from "@/lib/models/Exercicio";
import { apiHandler } from "@/lib/apiHandler";

export const GET = apiHandler(async (_request, userId, params) => {
  const paciente = await Paciente.findOne(
    { fisio: userId, "planos._id": params.id },
    { "planos.$": 1 }
  ).lean();
  if (!paciente || !paciente.planos?.[0]) {
    return NextResponse.json({ erro: "Plano não encontrado" }, { status: 404 });
  }
  const p: any = paciente.planos[0];
  const plano = {
    _id: p._id,
    paciente: paciente._id,
    queixa: p.queixa,
    historico: p.historico,
    diagnostico: p.diagnostico,
    objetivo: p.objetivo,
    frequenciaSemanal: p.frequenciaSemanal,
    sessoesPrevistas: p.sessoesPrevistas,
    dataInicio: p.dataInicio,
    previsaoAlta: p.previsaoAlta,
    status: p.status,
  };
  const exercicios = (p.exercicios || []).map((e: any) => ({
    _id: e._id,
    ordem: e.ordem,
    exercicio: { _id: e.exercicio, nome: e.nome, descricao: e.descricao },
  }));
  return NextResponse.json({ plano, exercicios });
});

export const PUT = apiHandler(async (request, userId, params) => {
  const body = await request.json();
  const { exerciciosIds, ...dados } = body;

  const paciente = await Paciente.findOne({ fisio: userId, "planos._id": params.id });
  if (!paciente) return NextResponse.json({ erro: "Plano não encontrado" }, { status: 404 });

  const plano: any = paciente.planos.id(params.id);
  if (!plano) return NextResponse.json({ erro: "Plano não encontrado" }, { status: 404 });

  Object.assign(plano, dados);

  if (Array.isArray(exerciciosIds)) {
    if (exerciciosIds.length === 0) {
      plano.exercicios = [];
    } else {
      const exs = await Exercicio.find({ _id: { $in: exerciciosIds } }).lean();
      const mapa = new Map(exs.map((e: any) => [String(e._id), e]));
      plano.exercicios = exerciciosIds
        .map((id: string, i: number) => {
          const ex = mapa.get(String(id));
          if (!ex) return null;
          return { exercicio: ex._id, nome: ex.nome, descricao: ex.descricao, ordem: i + 1 };
        })
        .filter(Boolean);
    }
  }

  await paciente.save();
  return NextResponse.json({ ...plano.toObject(), paciente: paciente._id });
});
