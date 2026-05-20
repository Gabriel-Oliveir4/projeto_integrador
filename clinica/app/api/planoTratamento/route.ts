import { NextResponse } from "next/server";
import PlanoTratamento from "@/lib/models/PlanoTratamento";
import PlanoExercicio from "@/lib/models/PlanoExercicio";
import "@/lib/models/Exercicio";
import { apiHandler } from "@/lib/apiHandler";

// Listar planos de um paciente, com exercícios agrupados por plano
export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const pacienteId = searchParams.get("pacienteId");

  const planos = await PlanoTratamento.find({ paciente: pacienteId }).sort({ createdAt: -1 });
  if (planos.length === 0) return NextResponse.json([]);

  const planoIds = planos.map((p) => p._id);
  const pes = await PlanoExercicio.find({ planotratamento: { $in: planoIds } })
    .populate("exercicio")
    .sort({ ordem: 1 });

  const porPlano: Record<string, any[]> = {};
  for (const pe of pes) {
    const key = String(pe.planotratamento);
    if (!porPlano[key]) porPlano[key] = [];
    porPlano[key].push({ _id: pe._id, exercicio: pe.exercicio, ordem: pe.ordem });
  }

  const resposta = planos.map((p) => ({
    ...p.toObject(),
    exercicios: porPlano[String(p._id)] || [],
  }));

  return NextResponse.json(resposta);
});

// Criar novo plano + linhas de PlanoExercicio
export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { exerciciosIds = [], ...dados } = body;

  // Garante que só existe um plano ativo por paciente
  await PlanoTratamento.updateMany(
    { paciente: dados.paciente, status: "ativo" },
    { status: "finalizado" }
  );

  const plano = await PlanoTratamento.create(dados);

  if (Array.isArray(exerciciosIds) && exerciciosIds.length > 0) {
    await PlanoExercicio.insertMany(
      exerciciosIds.map((id: string, i: number) => ({
        planotratamento: plano._id,
        exercicio: id,
        ordem: i + 1,
      }))
    );
  }

  return NextResponse.json(plano, { status: 201 });
});
