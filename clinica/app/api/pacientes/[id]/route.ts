import { NextResponse } from "next/server";
import Paciente from "@/lib/models/Paciente";
import { apiHandler } from "@/lib/apiHandler";

// Buscar paciente por ID
export const GET = apiHandler(async (request, userId, params) => {
  const paciente = await Paciente.findOne({ _id: params.id, fisio: userId });
  if (!paciente) return NextResponse.json({ erro: "Paciente não encontrado" }, { status: 404 });
  return NextResponse.json(paciente);
});

// Editar paciente
export const PUT = apiHandler(async (request, userId, params) => {
  const body = await request.json();
  const paciente = await Paciente.findOneAndUpdate(
    { _id: params.id, fisio: userId },
    body,
    { new: true, runValidators: true }
  );
  if (!paciente) return NextResponse.json({ erro: "Paciente não encontrado" }, { status: 404 });
  return NextResponse.json(paciente);
});

// Deletar paciente
export const DELETE = apiHandler(async (request, userId, params) => {
  const paciente = await Paciente.findOneAndDelete({ _id: params.id, fisio: userId });
  if (!paciente) return NextResponse.json({ erro: "Paciente não encontrado" }, { status: 404 });
  return NextResponse.json({ mensagem: "Paciente removido com sucesso" });
});