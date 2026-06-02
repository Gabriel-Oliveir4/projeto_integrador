import { NextResponse } from "next/server";
import Paciente from "@/lib/models/Paciente";
import Exercicio from "@/lib/models/Exercicio";
import { apiHandler } from "@/lib/apiHandler";

export const GET = apiHandler(async (request, userId) => {
  const { searchParams } = new URL(request.url);
  const pacienteId = searchParams.get("pacienteId");
  if (!pacienteId) return NextResponse.json([]);

  const paciente = await Paciente.findOne(
    { _id: pacienteId, fisio: userId },
    { planos: 1 }
  ).lean();
  if (!paciente) return NextResponse.json([]);

  const planos = (paciente.planos || [])
    .slice()
    .sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .map((p: any) => ({
      _id: p._id,
      paciente: pacienteId,
      queixa: p.queixa,
      historico: p.historico,
      diagnostico: p.diagnostico,
      objetivo: p.objetivo,
      frequenciaSemanal: p.frequenciaSemanal,
      sessoesPrevistas: p.sessoesPrevistas,
      dataInicio: p.dataInicio,
      previsaoAlta: p.previsaoAlta,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      exercicios: (p.exercicios || []).map((e: any) => ({
        _id: e._id,
        ordem: e.ordem,
        exercicio: { _id: e.exercicio, nome: e.nome, descricao: e.descricao },
      })),
      anexos: p.anexos || [],
    }));

  return NextResponse.json(planos);
});

export const POST = apiHandler(async (request, userId) => {
  const body = await request.json();
  const { paciente: pacienteId, exerciciosIds = [], ...dados } = body;

  const paciente = await Paciente.findOne({ _id: pacienteId, fisio: userId });
  if (!paciente) return NextResponse.json({ erro: "Paciente não encontrado" }, { status: 404 });

  paciente.planos.forEach((p: any) => {
    if (p.status === "ativo") p.status = "finalizado";
  });

  let exerciciosEmbed: any[] = [];
  if (Array.isArray(exerciciosIds) && exerciciosIds.length > 0) {
    const exs = await Exercicio.find({ _id: { $in: exerciciosIds } }).lean();
    const mapa = new Map(exs.map((e: any) => [String(e._id), e]));
    exerciciosEmbed = exerciciosIds
      .map((id: string, i: number) => {
        const ex = mapa.get(String(id));
        if (!ex) return null;
        return { exercicio: ex._id, nome: ex.nome, descricao: ex.descricao, ordem: i + 1 };
      })
      .filter(Boolean);
  }

  paciente.planos.push({ ...dados, exercicios: exerciciosEmbed, anexos: [] } as any);
  await paciente.save();

  const novo = paciente.planos[paciente.planos.length - 1];
  return NextResponse.json({ ...novo.toObject(), paciente: pacienteId }, { status: 201 });
});
