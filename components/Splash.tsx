"use client";

import { useEffect, useState } from "react";
import { TelaCarregando } from "@/components/TelaCarregando";
import { cx } from "@/components/ui";

/** Tela de loader exibida por 2,5s no carregamento da aplicação. */
export function Splash() {
  const [visivel, setVisivel] = useState(true);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    const inicioSaida = setTimeout(() => setSaindo(true), 2200);
    const fim = setTimeout(() => setVisivel(false), 2500);
    return () => {
      clearTimeout(inicioSaida);
      clearTimeout(fim);
    };
  }, []);

  if (!visivel) return null;

  return (
    <div
      className={cx(
        "fixed inset-0 z-[100] flex items-center justify-center bg-mist transition-opacity duration-300",
        saindo && "pointer-events-none opacity-0",
      )}
    >
      <TelaCarregando />
    </div>
  );
}
