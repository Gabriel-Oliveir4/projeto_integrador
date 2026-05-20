import { NextResponse } from "next/server";
import Sessao from "@/lib/models/sessao";
import SessaoExercicio from "@/lib/models/SessaoExercicio";
import "@/lib/models/Exercicio";
import { apiHandler } from "@/lib/apiHandler";

// Detalhe da sessão + exercícios
export const GET = apiHandler(async (_req, _userId, params) => {
  const sessao = await Sessao.findById(params.id);
  if (!sessao) return NextResponse.json({ erro: "Sessão não encontrada" }, { status: 404 });

  const exercicios = await SessaoExercicio.find({ sessao: params.id }).populate("exercicio");
  return NextResponse.json({ sessao, exercicios });
});

// Editar sessão (data, status, observações)
export const PUT = apiHandler(async (request, userId, params) => {
  const body = await request.json();

  if (body.data) {
    const conflito = await Sessao.findOne({
      _id: { $ne: params.id },
      fisio: userId,
      data: new Date(body.data),
      status: { $in: ["agendado", "em_andamento"] },
    });
    if (conflito) {
      return NextResponse.json(
        { erro: "Já existe uma sessão agendada neste horário." },
        { status: 409 }
      );
    }
  }

  const sessao = await Sessao.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
  if (!sessao) return NextResponse.json({ erro: "Sessão não encontrada" }, { status: 404 });
  return NextResponse.json(sessao);
});

// Deletar sessão (cascata em SessaoExercicio)
export const DELETE = apiHandler(async (_req, _userId, params) => {
  const sessao = await Sessao.findByIdAndDelete(params.id);
  if (!sessao) return NextResponse.json({ erro: "Sessão não encontrada" }, { status: 404 });
  await SessaoExercicio.deleteMany({ sessao: params.id });
  return NextResponse.json({ mensagem: "Sessão removida" });
});
