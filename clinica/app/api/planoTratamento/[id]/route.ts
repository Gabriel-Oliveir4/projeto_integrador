import { NextResponse } from "next/server";
import PlanoTratamento from "@/lib/models/PlanoTratamento";
import "@/lib/models/Exercicio";
import { apiHandler } from "@/lib/apiHandler";

// Buscar plano por ID
export const GET = apiHandler(async (request, userId, params) => {
  const plano = await PlanoTratamento.findById(params.id);
  if (!plano) return NextResponse.json({ erro: "Plano não encontrado" }, { status: 404 });
  return NextResponse.json(plano);
});

// Editar plano
export const PUT = apiHandler(async (request, userId, params) => {
  const body = await request.json();
  const plano = await PlanoTratamento.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
  if (!plano) return NextResponse.json({ erro: "Plano não encontrado" }, { status: 404 });
  return NextResponse.json(plano);
});