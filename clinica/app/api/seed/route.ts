import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Exercicio from "@/lib/models/Exercicio";

const exercicios = [
  { nome: "Alongamento de isquiotibiais", descricao: "Deitado, elevar a perna estendida até sentir o alongamento na parte posterior da coxa." },
  { nome: "Fortalecimento de quadríceps", descricao: "Sentado, estender o joelho contra resistência." },
  { nome: "Agachamento livre", descricao: "Em pé, flexionar os joelhos até 90° mantendo o tronco ereto." },
  { nome: "Ponte glútea", descricao: "Deitado, elevar o quadril contraindo os glúteos." },
  { nome: "Exercício de Kegel", descricao: "Contrair e relaxar a musculatura do assoalho pélvico." },
  { nome: "Mobilização cervical", descricao: "Movimentos suaves de flexão, extensão e rotação da cervical." },
  { nome: "Fortalecimento do manguito rotador", descricao: "Rotação externa do ombro com theraband." },
  { nome: "Exercício pendular", descricao: "Inclinado para frente, balançar o braço livremente em pequenos círculos." },
  { nome: "Alongamento de panturrilha", descricao: "Em pé, apoiar as mãos na parede e estender o joelho para sentir o alongamento." },
  { nome: "Fortalecimento de core", descricao: "Prancha isométrica em decúbito ventral por 30 segundos." },
  { nome: "Mobilização de tornozelo", descricao: "Movimentos circulares do tornozelo para ganho de amplitude." },
  { nome: "Exercício de equilíbrio unipodal", descricao: "Apoio unipodal por 30 segundos, progredindo com olhos fechados." },
  { nome: "Alongamento de piriforme", descricao: "Deitado, cruzar o tornozelo sobre o joelho oposto e puxar a perna." },
  { nome: "Fortalecimento de glúteo médio", descricao: "Deitado de lado, elevar a perna estendida lateralmente." },
  { nome: "Respiração diafragmática", descricao: "Inspiração profunda expandindo o abdômen, expiração lenta e controlada." },
];

export async function GET() {
  await connectDB();

  const total = await Exercicio.countDocuments();
  if (total > 0) {
    return NextResponse.json({ mensagem: "Exercícios já cadastrados!", total });
  }

  await Exercicio.insertMany(exercicios);
  return NextResponse.json({ mensagem: `${exercicios.length} exercícios cadastrados com sucesso!` });
}