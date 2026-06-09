"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/lib/hooks";
import type { Indicadores } from "@/lib/types";
import { navItens } from "@/components/painel/nav";
import { CarregandoBloco, AlertaErro } from "@/components/ui";
import { GraficoDonut, GraficoBarrasH, useContador } from "@/components/site/Charts";
import {
  IconArrowRight,
  IconUsers,
  IconUser,
  IconGift,
  IconLayers,
  IconCalendar,
  IconMap,
} from "@/components/icons";
import type { ComponentType, SVGProps } from "react";

/** Cores por situação da família (verde / âmbar / cinza). */
const CORES_STATUS: [string, string][] = [
  ["#009c3b", "#51cd82"],
  ["#d99e00", "#fbc014"],
  ["#64748b", "#94a3b8"],
];

interface Metrica {
  rotulo: string;
  valor: number;
  icone: ComponentType<SVGProps<SVGSVGElement>>;
  cor: string;
  suave: string;
}

export default function DashboardPage() {
  const { usuario, temPerfil } = useAuth();
  const { dados, carregando, erro } = useFetch<Indicadores>("/api/publico/indicadores");

  const metricas: Metrica[] = [
    { rotulo: "Famílias ativas", valor: dados?.totalFamiliasAtivas ?? 0, icone: IconUsers, cor: "#009c3b", suave: "#e8f8ee" },
    { rotulo: "Pessoas acompanhadas", valor: dados?.totalMembros ?? 0, icone: IconUser, cor: "#143f8e", suave: "#eaf0fb" },
    { rotulo: "Benefícios ativos", valor: dados?.totalBeneficiosAtivos ?? 0, icone: IconGift, cor: "#d99e00", suave: "#fff8e1" },
    { rotulo: "Programas", valor: dados?.totalProgramas ?? 0, icone: IconLayers, cor: "#006626", suave: "#e8f8ee" },
    { rotulo: "Visitas (30 dias)", valor: dados?.totalVisitasUltimos30Dias ?? 0, icone: IconCalendar, cor: "#0a2356", suave: "#eaf0fb" },
    { rotulo: "População abrangida", valor: dados?.populacaoAbrangida ?? 0, icone: IconMap, cor: "#a87a00", suave: "#fff8e1" },
  ];

  const atalhos = navItens.filter(
    (i) => i.href !== "/painel" && i.href !== "/painel/conta" && (!i.perfis || temPerfil(...i.perfis)),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Olá, {usuario?.nome.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">Um panorama da operação da rede em tempo real.</p>
      </div>

      <AlertaErro mensagem={erro} />

      {carregando ? (
        <CarregandoBloco />
      ) : (
        <>
          {/* Métricas */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {metricas.map((m) => (
              <CartaoMetrica key={m.rotulo} metrica={m} ativo={!!dados} />
            ))}
          </div>

          {/* Gráficos */}
          {dados && (
            <div className="grid gap-5 lg:grid-cols-2">
              <GraficoDonut
                titulo="Famílias por situação"
                dados={dados.familiasPorStatus.map((s) => ({ rotulo: s.status, valor: s.quantidade }))}
                cores={CORES_STATUS}
              />
              <GraficoBarrasH
                titulo="Benefícios por programa"
                dados={dados.beneficiosPorPrograma.map((p) => ({ rotulo: p.programa, valor: p.quantidade }))}
                limite={6}
              />
              <GraficoBarrasH
                titulo="Famílias por município"
                dados={dados.familiasPorMunicipio.map((m) => ({ rotulo: m.municipio, valor: m.quantidade }))}
                limite={8}
              />
              <GraficoDonut
                titulo="Famílias por UF"
                dados={dados.familiasPorUf.map((u) => ({ rotulo: u.uf, valor: u.quantidade }))}
                limite={6}
              />
            </div>
          )}
        </>
      )}

      {/* Acesso rápido */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Acesso rápido</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {atalhos.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <a.icone />
              </span>
              <span className="flex-1 font-medium text-ink">{a.rotulo}</span>
              <IconArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function CartaoMetrica({ metrica, ativo }: { metrica: Metrica; ativo: boolean }) {
  const valor = useContador(metrica.valor, ativo, 900);
  const Icone = metrica.icone;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.02] transition hover:shadow-md">
      <span
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: `linear-gradient(90deg, ${metrica.cor}, ${metrica.cor}55)` }}
      />
      <span
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: metrica.suave, color: metrica.cor }}
      >
        <Icone className="h-5 w-5" />
      </span>
      <p className="mt-3 text-2xl font-bold leading-none tabular-nums text-ink">
        {valor.toLocaleString("pt-BR")}
      </p>
      <p className="mt-1.5 text-xs font-medium text-slate-500">{metrica.rotulo}</p>
    </div>
  );
}
