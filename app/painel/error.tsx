"use client";

import { useEffect } from "react";
import { Botao, BotaoLink } from "@/components/ui";
import { IconAlert } from "@/components/icons";

export default function PainelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <IconAlert className="h-7 w-7" />
      </span>
      <h2 className="mt-2 text-lg font-semibold text-ink">Não foi possível carregar</h2>
      <p className="max-w-sm text-sm text-slate-500">
        Ocorreu um erro inesperado nesta seção. Tente novamente; se persistir, recarregue a página.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Botao onClick={reset}>Tentar novamente</Botao>
        <BotaoLink href="/painel" variante="contorno">Ir para o painel</BotaoLink>
      </div>
    </div>
  );
}
