import { NextResponse } from "next/server";
import PlanoTratamento from "@/lib/models/PlanoTratamento";
import PlanoExercicio from "@/lib/models/PlanoExercicio";
import "@/lib/models/Exercicio";
import { apiHandler } from "@/lib/apiHandler";

// Buscar plano por ID + seus exercícios
export const GET = apiHandler(async (_request, _userId, params) => {
  const plano = await PlanoTratamento.findById(params.id);
  if (!plano) return NextResponse.json({ erro: "Plano não encontrado" }, { status: 404 });

  const exercicios = await PlanoExercicio.find({ planotratamento: params.id })
    .populate("exercicio")
    .sort({ ordem: 1 });

  return NextResponse.json({ plano, exercicios });
});

// Editar plano (se vier exerciciosIds, recria as linhas)
export const PUT = apiHandler(async (request, _userId, params) => {
  const body = await request.json();
  const { exerciciosIds, ...dados } = body;

  const plano = await PlanoTratamento.findByIdAndUpdate(params.id, dados, {
    new: true,
    runValidators: true,
  });
  if (!plano) return NextResponse.json({ erro: "Plano não encontrado" }, { status: 404 });

  if (Array.isArray(exerciciosIds)) {
    await PlanoExercicio.deleteMany({ planotratamento: params.id });
    if (exerciciosIds.length > 0) {
      await PlanoExercicio.insertMany(
        exerciciosIds.map((id: string, i: number) => ({
          planotratamento: plano._id,
          exercicio: id,
          ordem: i + 1,
        }))
      );
    }
  }

  return NextResponse.json(plano);
});
