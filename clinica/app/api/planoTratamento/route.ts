import { NextResponse } from "next/server";
import PlanoTratamento from "@/lib/models/PlanoTratamento";
import { apiHandler } from "@/lib/apiHandler";

// Listar planos de um paciente
export const GET = apiHandler(async (request, userId) => {
  const { searchParams } = new URL(request.url);
  const pacienteId = searchParams.get("pacienteId");

  const planos = await PlanoTratamento.find({ paciente: pacienteId }).sort({ createdAt: -1 });
  return NextResponse.json(planos);
});

// Criar novo plano
export const POST = apiHandler(async (request, userId) => {
  const body = await request.json();

  // Garante que só existe um plano ativo por paciente
  await PlanoTratamento.updateMany(
    { paciente: body.paciente, status: "ativo" },
    { status: "finalizado" }
  );

  const plano = await PlanoTratamento.create(body);
  return NextResponse.json(plano, { status: 201 });
});