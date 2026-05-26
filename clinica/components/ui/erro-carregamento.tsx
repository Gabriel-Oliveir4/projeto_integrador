import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErroCarregamentoProps {
  mensagem?: string;
  onTentarNovamente?: () => void;
  className?: string;
}

export function ErroCarregamento({
  mensagem = "Não foi possível carregar.",
  onTentarNovamente,
  className,
}: ErroCarregamentoProps) {
  return (
    <div className={`flex flex-col items-start gap-3 py-6 ${className ?? ""}`}>
      <div className="flex items-center gap-2 text-sm text-red-600">
        <AlertCircle size={16} />
        <span>{mensagem}</span>
      </div>
      {onTentarNovamente && (
        <Button variant="outline" size="sm" onClick={onTentarNovamente}>
          <RefreshCw size={14} className="mr-2" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
