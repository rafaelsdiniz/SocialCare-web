"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/lib/hooks";
import type { Indicadores } from "@/lib/types";
import { navItens } from "@/components/painel/nav";
import { CarregandoBloco, AlertaErro } from "@/components/ui";
import { IconArrowRight, IconUsers, IconGift, IconCalendar, IconLayers } from "@/components/icons";

export default function DashboardPage() {
  const { usuario, temPerfil } = useAuth();
  const { dados, carregando, erro } = useFetch<Indicadores>("/api/publico/indicadores");

  const cards = [
    { rotulo: "Famílias ativas", valor: dados?.totalFamiliasAtivas, icone: IconUsers, cor: "text-brand-600 bg-brand-50" },
    { rotulo: "Pessoas acompanhadas", valor: dados?.totalMembros, icone: IconUsers, cor: "text-accent-600 bg-accent-50" },
    { rotulo: "Benefícios ativos", valor: dados?.totalBeneficiosAtivos, icone: IconGift, cor: "text-amber-600 bg-amber-50" },
    { rotulo: "Visitas (30 dias)", valor: dados?.totalVisitasUltimos30Dias, icone: IconCalendar, cor: "text-rose-600 bg-rose-50" },
  ];

  const atalhos = navItens.filter(
    (i) => i.href !== "/painel" && (!i.perfis || temPerfil(...i.perfis)),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Olá, {usuario?.nome.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">Aqui está um resumo da operação da rede.</p>
      </div>

      <AlertaErro mensagem={erro} />

      {carregando ? (
        <CarregandoBloco />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.rotulo} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.cor}`}>
                <c.icone className="h-5 w-5" />
              </span>
              <p className="mt-3 text-2xl font-bold text-ink">
                {(c.valor ?? 0).toLocaleString("pt-BR")}
              </p>
              <p className="text-xs font-medium text-slate-500">{c.rotulo}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Acesso rápido</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {atalhos.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <a.icone />
              </span>
              <span className="flex-1 font-medium text-ink">{a.rotulo}</span>
              <IconArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
            </Link>
          ))}
        </div>
      </div>

      {dados && (dados.familiasPorUf.length > 0 || dados.beneficiosPorPrograma.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          <MiniBarras titulo="Famílias por UF" itens={dados.familiasPorUf.map((u) => ({ r: u.uf, v: u.quantidade }))} />
          <MiniBarras
            titulo="Benefícios por programa"
            itens={dados.beneficiosPorPrograma.map((p) => ({ r: p.programa, v: p.quantidade }))}
          />
        </div>
      )}
    </div>
  );
}

function MiniBarras({ titulo, itens }: { titulo: string; itens: { r: string; v: number }[] }) {
  const max = Math.max(1, ...itens.map((i) => i.v));
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-slate-700">
        <IconLayers className="h-4 w-4 text-brand-600" />
        <h3 className="text-sm font-semibold">{titulo}</h3>
      </div>
      {itens.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">Sem dados.</p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {itens.slice(0, 6).map((i) => (
            <li key={i.r}>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">{i.r}</span>
                <span className="font-medium text-ink">{i.v}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${(i.v / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
