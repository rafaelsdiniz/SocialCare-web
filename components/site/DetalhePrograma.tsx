"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import { moeda, data } from "@/lib/format";
import { placeholderPrograma } from "@/lib/programa";
import type { ProgramaPublicoDetalhe } from "@/lib/types";
import { Spinner } from "@/components/ui";
import {
  IconGift,
  IconArrowRight,
  IconChevronLeft,
  IconCheck,
  IconCalendar,
  IconBuilding,
  IconShield,
} from "@/components/icons";

export function DetalhePrograma({ id }: { id: number }) {
  const [programa, setPrograma] = useState<ProgramaPublicoDetalhe | null>(null);
  const [estado, setEstado] = useState<"carregando" | "ok" | "naoEncontrado">("carregando");

  useEffect(() => {
    apiFetch<ProgramaPublicoDetalhe>(`/api/publico/programas/${id}`, { auth: false })
      .then((p) => {
        setPrograma(p);
        setEstado("ok");
      })
      .catch((err) => setEstado(err instanceof ApiError && err.status === 404 ? "naoEncontrado" : "naoEncontrado"));
  }, [id]);

  if (estado === "carregando")
    return (
      <div className="flex justify-center py-24 text-slate-400">
        <Spinner />
      </div>
    );

  if (estado === "naoEncontrado" || !programa)
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-ink">Programa não encontrado</h1>
        <p className="mt-2 text-slate-500">Ele pode ter sido encerrado ou não estar mais disponível.</p>
        <Link href="/programas" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
          <IconChevronLeft className="h-4 w-4" /> Ver todos os programas
        </Link>
      </div>
    );

  const foto = programa.iconeBase64 || placeholderPrograma(programa.id, 1200, 700);

  const fatos = [
    programa.valorPadrao != null && { icone: IconGift, rotulo: "Valor padrão", valor: `${moeda(programa.valorPadrao)} / mês` },
    programa.duracaoMesesPadrao != null && { icone: IconCalendar, rotulo: "Duração padrão", valor: `${programa.duracaoMesesPadrao} meses` },
    programa.vigenciaInicio && {
      icone: IconCalendar,
      rotulo: "Vigência",
      valor: `${data(programa.vigenciaInicio)}${programa.vigenciaFim ? ` até ${data(programa.vigenciaFim)}` : ""}`,
    },
    { icone: IconBuilding, rotulo: "Órgão responsável", valor: programa.orgaoResponsavel },
  ].filter(Boolean) as { icone: typeof IconGift; rotulo: string; valor: string }[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/programas" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
        <IconChevronLeft className="h-4 w-4" /> Programas
      </Link>

      {/* Hero com foto */}
      <div className="relative mt-4 h-72 w-full overflow-hidden rounded-3xl sm:h-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foto} alt={programa.nome} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/45 to-transparent" />
        {!programa.iconeBase64 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <IconGift className="h-16 w-16 text-white/40" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy-800 shadow-sm">
            {programa.orgaoResponsavel}
          </span>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white drop-shadow-sm sm:text-4xl">
            {programa.nome}
          </h1>
        </div>
      </div>

      {/* Conteúdo + sidebar */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="text-lg font-semibold text-ink">Sobre o programa</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              {programa.descricao ?? "Programa social disponível para as famílias acompanhadas pela rede de assistência social."}
            </p>
          </section>

          {programa.requisitos && (
            <section className="rounded-2xl border border-brand-100 bg-brand-50/60 p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold text-brand-800">
                <IconCheck className="h-5 w-5" /> Quem pode participar
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{programa.requisitos}</p>
            </section>
          )}

          <section className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-mist p-5 text-sm text-slate-500">
            <IconShield className="mt-0.5 h-5 w-5 shrink-0 text-navy-500" />
            <p>
              As informações desta página são públicas. O acompanhamento e a concessão dos benefícios são feitos
              pelas equipes técnicas no sistema interno, conforme avaliação de cada família.
            </p>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Informações</h2>
            <dl className="mt-4 space-y-4">
              {fatos.map((f) => (
                <div key={f.rotulo} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <f.icone className="h-4 w-4" />
                  </span>
                  <div>
                    <dt className="text-xs font-medium text-slate-400">{f.rotulo}</dt>
                    <dd className="text-sm font-semibold text-ink">{f.valor}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-6 space-y-2 border-t border-slate-100 pt-5">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Acessar o sistema <IconArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contato"
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Falar com a equipe
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
