"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Indicadores } from "@/lib/types";
import { Spinner } from "@/components/ui";

function Barras({ titulo, itens }: { titulo: string; itens: { rotulo: string; valor: number }[] }) {
  const max = Math.max(1, ...itens.map((i) => i.valor));
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-ink">{titulo}</h3>
      {itens.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">Sem dados.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {itens.map((i) => (
            <li key={i.rotulo}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{i.rotulo}</span>
                <span className="font-medium text-ink">{i.valor.toLocaleString("pt-BR")}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${(i.valor / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PainelIndicadores() {
  const [dados, setDados] = useState<Indicadores | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    apiFetch<Indicadores>("/api/publico/indicadores", { auth: false })
      .then(setDados)
      .catch(() => setErro(true));
  }, []);

  if (erro)
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-center text-sm text-rose-700">
        Não foi possível carregar os indicadores. Verifique se a API está no ar.
      </div>
    );

  if (!dados)
    return (
      <div className="flex justify-center py-16 text-slate-400">
        <Spinner />
      </div>
    );

  const cards = [
    { rotulo: "Famílias ativas", valor: dados.totalFamiliasAtivas },
    { rotulo: "Pessoas acompanhadas", valor: dados.totalMembros },
    { rotulo: "Benefícios ativos", valor: dados.totalBeneficiosAtivos },
    { rotulo: "Programas", valor: dados.totalProgramas },
    { rotulo: "Visitas (30 dias)", valor: dados.totalVisitasUltimos30Dias },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.rotulo} className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-3xl font-bold text-brand-600">{c.valor.toLocaleString("pt-BR")}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{c.rotulo}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Barras
          titulo="Famílias por UF"
          itens={dados.familiasPorUf.map((u) => ({ rotulo: u.uf, valor: u.quantidade }))}
        />
        <Barras
          titulo="Benefícios ativos por programa"
          itens={dados.beneficiosPorPrograma.map((p) => ({ rotulo: p.programa, valor: p.quantidade }))}
        />
      </div>
    </div>
  );
}
