import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  titulo: string;
  descricao: string;
  onConfirmar: () => void;
  carregando?: boolean;
  variant?: "default" | "destrutivo";
}

export function DialogConfirmar({
  open,
  onOpenChange,
  titulo,
  descricao,
  onConfirmar,
  carregando,
  variant = "default",
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={carregando}>
            Cancelar
          </Button>
          <Button
            variant={variant === "destrutivo" ? "destructive" : "default"}
            onClick={onConfirmar}
            disabled={carregando}
          >
            {carregando ? "Aguarde..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
