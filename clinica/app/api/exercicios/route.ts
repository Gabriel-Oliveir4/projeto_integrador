import { NextResponse } from "next/server";
import Exercicio from "@/lib/models/Exercicio";
import { apiHandler } from "@/lib/apiHandler";

// Listar todos os exercícios disponíveis
export const GET = apiHandler(async () => {
  const exercicios = await Exercicio.find().sort({ nome: 1 });
  return NextResponse.json(exercicios);
});