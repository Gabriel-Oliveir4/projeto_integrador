"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DetalheSessao from "../../DetalheSessao";

export default function SessaoPage({
  params,
}: {
  params: Promise<{ id: string; sessaoId: string }>;
}) {
  const { id, sessaoId } = use(params);

  return (
    <div className="space-y-4">
      <Link
        href={`/pacientes/${id}`}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={14} />
        Voltar ao paciente
      </Link>

      <DetalheSessao sessaoId={sessaoId} />
    </div>
  );
}
