"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { moeda } from "@/lib/format";
import type { Indicadores, ContextoFederal } from "@/lib/types";
import { Spinner } from "@/components/ui";
import { GraficoDonut, GraficoBarrasH, useContador } from "@/components/site/Charts";
import { IconUsers, IconUser, IconGift, IconLayers, IconCalendar, IconMap, IconChart } from "@/components/icons";

const CARDS = [
  { chave: "totalFamiliasAtivas", rotulo: "Famílias ativas", icone: IconUsers, cor: "#009c3b", suave: "#e8f8ee" },
  { chave: "totalMembros", rotulo: "Pessoas", icone: IconUser, cor: "#143f8e", suave: "#eaf0fb" },
  { chave: "totalBeneficiosAtivos", rotulo: "Benefícios ativos", icone: IconGift, cor: "#d99e00", suave: "#fff8e1" },
  { chave: "totalProgramas", rotulo: "Programas", icone: IconLayers, cor: "#006626", suave: "#e8f8ee" },
  { chave: "totalVisitasUltimos30Dias", rotulo: "Visitas (30d)", icone: IconCalendar, cor: "#0a2356", suave: "#eaf0fb" },
] as const;

/** Cores semânticas por situação da família. */
const CORES_STATUS: [string, string][] = [
  ["#009c3b", "#51cd82"], // Ativa — verde
  ["#d99e00", "#fbc014"], // Em acompanhamento — âmbar
  ["#64748b", "#94a3b8"], // Inativa — cinza
];

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function CartaoContexto({
  icone: Icone,
  cor,
  suave,
  titulo,
  valor,
  unidade,
  detalhe,
}: {
  icone: typeof IconUsers;
  cor: string;
  suave: string;
  titulo: string;
  valor: string;
  unidade: string;
  detalhe: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.02]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: suave, color: cor }}>
        <Icone className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{titulo}</p>
        <p className="mt-1 text-2xl font-bold leading-none tabular-nums text-ink">
          {valor} <span className="text-xs font-medium text-slate-400">{unidade}</span>
        </p>
        <p className="mt-1.5 text-xs text-slate-500">{detalhe}</p>
      </div>
    </div>
  );
}

function CartaoKpi({
  rotulo,
  valor,
  icone: Icone,
  cor,
  suave,
}: {
  rotulo: string;
  valor: number;
  icone: typeof IconUsers;
  cor: string;
  suave: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setAtivo(true), obs.disconnect()),
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const n = useContador(valor, ativo, 1100);

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.02] transition-transform duration-300 hover:-translate-y-0.5"
    >
      <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: cor }} />
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ background: suave, color: cor }}
      >
        <Icone className="h-[18px] w-[18px]" />
      </span>
      <p className="mt-3 text-[26px] font-bold leading-none tabular-nums text-ink">
        {n.toLocaleString("pt-BR")}
      </p>
      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{rotulo}</p>
    </div>
  );
}

export function PainelIndicadores({ resumo = false }: { resumo?: boolean }) {
  const [dados, setDados] = useState<Indicadores | null>(null);
  const [federal, setFederal] = useState<ContextoFederal | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    apiFetch<Indicadores>("/api/publico/indicadores", { auth: false })
      .then(setDados)
      .catch(() => setErro(true));
    apiFetch<ContextoFederal>("/api/publico/indicadores/contexto-federal", { auth: false })
      .then(setFederal)
      .catch(() => setFederal(null));
  }, []);

  if (erro)
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-center text-sm text-rose-700">
        Não foi possível carregar os indicadores. Verifique se a API está no ar.
      </div>
    );

  if (!dados)
    return (
      <div className="flex justify-center py-16 text-slate-400">
        <Spinner />
      </div>
    );

  const porPrograma = dados.beneficiosPorPrograma.map((p) => ({ rotulo: p.programa, valor: p.quantidade }));
  const porMunicipio = (dados.familiasPorMunicipio ?? []).map((m) => ({ rotulo: m.municipio, valor: m.quantidade }));
  const porStatus = (dados.familiasPorStatus ?? []).map((s) => ({ rotulo: s.status, valor: s.quantidade }));

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CARDS.map((c) => (
          <CartaoKpi
            key={c.chave}
            rotulo={c.rotulo}
            valor={dados[c.chave]}
            icone={c.icone}
            cor={c.cor}
            suave={c.suave}
          />
        ))}
      </div>

      {!resumo && (
        <>
          {/* Gráficos — situação das famílias + ranking de programas */}
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <GraficoDonut titulo="Famílias por situação" dados={porStatus} cores={CORES_STATUS} />
            </div>
            <div className="lg:col-span-3">
              <GraficoBarrasH titulo="Programas com mais benefícios ativos" dados={porPrograma} limite={8} />
            </div>
          </div>

          {/* Municípios — só faz sentido como gráfico com mais de um */}
          {porMunicipio.length > 1 && (
            <GraficoBarrasH titulo="Famílias por município" dados={porMunicipio} limite={8} />
          )}

          {/* Contexto territorial — cobertura (IBGE) + Bolsa Família (Portal da Transparência) */}
          {(dados.populacaoAbrangida > 0 || federal?.disponivel) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {dados.populacaoAbrangida > 0 && (
                <CartaoContexto
                  icone={IconChart}
                  cor="#143f8e"
                  suave="#eaf0fb"
                  titulo="Cobertura nos municípios atendidos"
                  valor={dados.populacaoAbrangida.toLocaleString("pt-BR")}
                  unidade="habitantes (IBGE)"
                  detalhe={`${dados.totalMembros.toLocaleString("pt-BR")} pessoas acompanhadas${
                    dados.populacaoAbrangida > 0
                      ? ` · ${((dados.totalMembros / dados.populacaoAbrangida) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% da população`
                      : ""
                  }`}
                />
              )}
              {federal?.disponivel && (
                <CartaoContexto
                  icone={IconGift}
                  cor="#009c3b"
                  suave="#e8f8ee"
                  titulo="Bolsa Família no território"
                  valor={federal.beneficiarios.toLocaleString("pt-BR")}
                  unidade="famílias beneficiadas"
                  detalhe={`${moeda(federal.valorTotal)} repassados${
                    federal.mes && federal.ano ? ` · ref. ${MESES[federal.mes - 1]}/${federal.ano}` : ""
                  } · Portal da Transparência`}
                />
              )}
            </div>
          )}
        </>
      )}

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <IconMap className="h-3.5 w-3.5" />
        Dados agregados e anonimizados · atualizados continuamente
      </p>
    </div>
  );
}
