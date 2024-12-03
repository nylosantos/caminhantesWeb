import { useCallback } from "react";
import { toast } from "sonner";

function useClipboard() {
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(
        "Código copiado para a área de transferência, compartilhe com moderação! 🍺 ops... 👌"
      );
    } catch (err) {
      toast.error("Falha ao copiar o código... 🤯");
      console.error("Falha ao copiar o código", err);
    }
  }, []);

  return copyToClipboard;
}

export default useClipboard;
