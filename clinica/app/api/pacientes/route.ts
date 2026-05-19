import { NextResponse } from "next/server";
import Paciente from "@/lib/models/Paciente";
import { apiHandler } from "@/lib/apiHandler";

// Listar todos os pacientes do fisio logado
export const GET = apiHandler(async (request, userId) => {
  const pacientes = await Paciente.find({ fisio: userId }).sort({ nome: 1 });
  return NextResponse.json(pacientes);
});

// Criar novo paciente
export const POST = apiHandler(async (request, userId) => {
  const body = await request.json();
  const paciente = await Paciente.create({ ...body, fisio: userId });
  return NextResponse.json(paciente, { status: 201 });
});