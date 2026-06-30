import { Button } from "../ui/Button";

export function ConfirmDelete({ label, onConfirm }: { label?: string; onConfirm: () => void }) {
  return (
    <Button
      variant="danger"
      onClick={() => {
        if (window.confirm(label ?? "Confirmar exclusao?")) {
          onConfirm();
        }
      }}
    >
      Excluir
    </Button>
  );
}
