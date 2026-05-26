import { Loader2 } from "lucide-react";

interface LoadingProps {
  mensagem?: string;
  className?: string;
}

export function Loading({ mensagem = "Carregando...", className }: LoadingProps) {
  return (
    <div className={`flex items-center gap-2 text-sm text-slate-500 py-6 ${className ?? ""}`}>
      <Loader2 className="animate-spin" size={16} />
      <span>{mensagem}</span>
    </div>
  );
}
