"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { moeda } from "@/lib/format";
import type { Indicadores, ProgramaPublico } from "@/lib/types";
import { Spinner } from "@/components/ui";
import { IconArrowRight } from "@/components/icons";

export function ResumoIndicadores() {
  const [dados, setDados] = useState<Indicadores | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    apiFetch<Indicadores>("/api/publico/indicadores", { auth: false })
      .then(setDados)
      .catch(() => setErro(true));
  }, []);

  if (erro) return null;
  if (!dados)
    return (
      <div className="flex justify-center py-8 text-slate-400">
        <Spinner />
      </div>
    );

  const cards = [
    { rotulo: "Famílias ativas", valor: dados.totalFamiliasAtivas },
    { rotulo: "Pessoas acompanhadas", valor: dados.totalMembros },
    { rotulo: "Benefícios ativos", valor: dados.totalBeneficiosAtivos },
    { rotulo: "Visitas (30 dias)", valor: dados.totalVisitasUltimos30Dias },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.rotulo} className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-brand-600">{c.valor.toLocaleString("pt-BR")}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">{c.rotulo}</p>
        </div>
      ))}
    </div>
  );
}

export function DestaqueProgramas({ limite = 3 }: { limite?: number }) {
  const [programas, setProgramas] = useState<ProgramaPublico[] | null>(null);

  useEffect(() => {
    apiFetch<ProgramaPublico[]>("/api/publico/programas", { auth: false })
      .then(setProgramas)
      .catch(() => setProgramas([]));
  }, []);

  if (!programas)
    return (
      <div className="flex justify-center py-8 text-slate-400">
        <Spinner />
      </div>
    );

  if (programas.length === 0)
    return <p className="text-center text-sm text-slate-500">Nenhum programa disponível no momento.</p>;

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {programas.slice(0, limite).map((p) => (
        <div key={p.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <span className="inline-flex w-fit rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-700">
            {p.orgaoResponsavel}
          </span>
          <h3 className="mt-3 text-lg font-semibold text-ink">{p.nome}</h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-500">{p.descricao ?? "Programa social disponível."}</p>
          {p.valorPadrao != null && (
            <p className="mt-3 text-sm font-medium text-brand-600">{moeda(p.valorPadrao)} / mês</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function ListaProgramas() {
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
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
        Nenhum programa social ativo no momento.
      </div>
    );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {programas.map((p) => (
        <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-semibold text-ink">{p.nome}</h3>
            <span className="shrink-0 rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-700">
              {p.orgaoResponsavel}
            </span>
          </div>
          {p.descricao && <p className="mt-3 text-sm text-slate-600">{p.descricao}</p>}
          {p.requisitos && (
            <div className="mt-4 rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requisitos</p>
              <p className="mt-1 text-sm text-slate-600">{p.requisitos}</p>
            </div>
          )}
          {p.valorPadrao != null && (
            <p className="mt-4 text-base font-semibold text-brand-600">{moeda(p.valorPadrao)} / mês</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function LinkSaibaMais({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
      {children} <IconArrowRight className="h-4 w-4" />
    </Link>
  );
}
