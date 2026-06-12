"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { placeholderPrograma } from "@/lib/programa";
import type { ProgramaPublico } from "@/lib/types";
import { Spinner } from "@/components/ui";
import { FocusRail, type FocusRailItem } from "@/components/ui/focus-rail";

export function CarrosselProgramas() {
  const [programas, setProgramas] = useState<ProgramaPublico[] | null>(null);

  useEffect(() => {
    apiFetch<ProgramaPublico[]>("/api/publico/programas", { auth: false })
      .then(setProgramas)
      .catch(() => setProgramas([]));
  }, []);

  if (!programas)
    return (
      <div className="flex justify-center py-16 text-slate-400">
        <Spinner />
      </div>
    );

  if (programas.length === 0)
    return <p className="py-10 text-center text-sm text-slate-500">Nenhum programa disponível no momento.</p>;

  const itens: FocusRailItem[] = programas.map((p) => ({
    id: p.id,
    title: p.nome,
    description: p.descricao ?? undefined,
    meta: p.orgaoResponsavel,
    imageSrc: p.iconeBase64 || placeholderPrograma(p.id, 600, 800),
    href: `/programas/${p.id}`,
  }));

  return (
    <section className="bg-navy-900">
      <div className="mx-auto max-w-6xl px-4 pt-16 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-white">Programas em destaque</h2>
        <p className="mt-2 text-navy-100/80">Arraste, role ou use as setas para percorrer as iniciativas.</p>
      </div>
      <FocusRail items={itens} loop autoPlay />
    </section>
  );
}
