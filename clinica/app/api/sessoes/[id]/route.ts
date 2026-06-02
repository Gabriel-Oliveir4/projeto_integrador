import { NextResponse } from "next/server";
import Sessao from "@/lib/models/sessao";
import Paciente from "@/lib/models/Paciente";
import { apiHandler } from "@/lib/apiHandler";

export const GET = apiHandler(async (_req, userId, params) => {
  const sessao = await Sessao.findOne({ _id: params.id, fisio: userId }).lean();
  if (!sessao) return NextResponse.json({ erro: "Sessão não encontrada" }, { status: 404 });

  const exercicios = ((sessao as any).exercicios || []).map((e: any) => ({
    _id: e._id,
    status: e.status,
    comentario: e.comentario,
    exercicio: { _id: e.exercicio, nome: e.nome, descricao: e.descricao },
  }));

  return NextResponse.json({ sessao, exercicios });
});

export const PUT = apiHandler(async (request, userId, params) => {
  const body = await request.json();

  if (body.data) {
    const conflito = await Sessao.findOne({
      _id: { $ne: params.id },
      fisio: userId,
      data: new Date(body.data),
      status: { $in: ["agendado", "em_andamento"] },
    }).select("_id").lean();
    if (conflito) {
      return NextResponse.json(
        { erro: "Já existe uma sessão agendada neste horário." },
        { status: 409 }
      );
    }
  }

  const anterior = await Sessao.findOne({ _id: params.id, fisio: userId }).select("status paciente data").lean();
  if (!anterior) return NextResponse.json({ erro: "Sessão não encontrada" }, { status: 404 });

  const sessao = await Sessao.findOneAndUpdate(
    { _id: params.id, fisio: userId },
    body,
    { new: true, runValidators: true }
  );
  if (!sessao) return NextResponse.json({ erro: "Sessão não encontrada" }, { status: 404 });

  const eraConcluida = (anterior as any).status === "concluido";
  const agoraConcluida = sessao.status === "concluido";
  if (!eraConcluida && agoraConcluida) {
    await Paciente.updateOne(
      { _id: sessao.paciente },
      { $inc: { sessoesRealizadas: 1 }, $set: { ultimaSessao: sessao.data } }
    );
  } else if (eraConcluida && !agoraConcluida) {
    await Paciente.updateOne(
      { _id: sessao.paciente },
      { $inc: { sessoesRealizadas: -1 } }
    );
  }

  return NextResponse.json(sessao);
});

export const DELETE = apiHandler(async (_req, userId, params) => {
  const sessao = await Sessao.findOneAndDelete({ _id: params.id, fisio: userId });
  if (!sessao) return NextResponse.json({ erro: "Sessão não encontrada" }, { status: 404 });
  return NextResponse.json({ mensagem: "Sessão removida" });
});
