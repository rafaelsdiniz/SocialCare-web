"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { moeda } from "@/lib/format";
import { placeholderPrograma } from "@/lib/programa";
import type { ProgramaPublico } from "@/lib/types";
import { Spinner, Paginacao, Entrada, Vazio } from "@/components/ui";
import { IconSearch, IconGift, IconArrowRight } from "@/components/icons";

const POR_PAGINA = 9;

export function VitrineProgramas() {
  const [programas, setProgramas] = useState<ProgramaPublico[] | null>(null);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    apiFetch<ProgramaPublico[]>("/api/publico/programas", { auth: false })
      .then(setProgramas)
      .catch(() => setProgramas([]));
  }, []);

  const filtrados = useMemo(() => {
    if (!programas) return [];
    const termo = busca.trim().toLowerCase();
    if (!termo) return programas;
    return programas.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.orgaoResponsavel.toLowerCase().includes(termo) ||
        (p.descricao ?? "").toLowerCase().includes(termo),
    );
  }, [programas, busca]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  if (!programas)
    return (
      <div className="flex justify-center py-16 text-slate-400">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Entrada
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPagina(1);
          }}
          placeholder="Buscar por nome, órgão ou descrição..."
          className="pl-9"
        />
      </div>

      {filtrados.length === 0 ? (
        <Vazio titulo="Nenhum programa encontrado" descricao="Tente outro termo de busca." />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visiveis.map((p) => (
              <CartaoVitrine key={p.id} programa={p} />
            ))}
          </div>
          <Paginacao
            pagina={paginaAtual}
            totalPaginas={totalPaginas}
            totalItens={filtrados.length}
            aoMudar={setPagina}
          />
        </>
      )}
    </div>
  );
}

function CartaoVitrine({ programa: p }: { programa: ProgramaPublico }) {
  return (
    <Link
      href={`/programas/${p.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg"
    >
      {/* Foto em capa */}
      <div className="relative h-48 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.iconeBase64 || placeholderPrograma(p.id, 600, 384)}
          alt={p.nome}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {!p.iconeBase64 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <IconGift className="h-10 w-10 text-white/70" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-navy-800 shadow-sm backdrop-blur">
          {p.orgaoResponsavel}
        </span>
      </div>

      {/* Corpo */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-ink group-hover:text-brand-700">{p.nome}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-500">
          {p.descricao ?? "Programa social disponível para as famílias acompanhadas."}
        </p>
        <div className="mt-4 flex items-center justify-between">
          {p.valorPadrao != null ? (
            <span className="text-sm font-bold text-brand-600">
              {moeda(p.valorPadrao)} <span className="text-xs font-medium text-slate-400">/ mês</span>
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 group-hover:gap-2">
            Ver detalhes <IconArrowRight className="h-4 w-4 transition-all" />
          </span>
        </div>
      </div>
    </Link>
  );
}
