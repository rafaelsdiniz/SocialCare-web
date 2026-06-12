"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { PontoMapa } from "@/lib/types";
import { TOCANTINS_RINGS } from "@/lib/tocantins-geo";
import { Spinner } from "@/components/ui";
import { IconMap } from "@/components/icons";

const LARGURA = 320;
const PAD = 14;

/** Projeção equiretangular simples (corrigida pela latitude média) para caber no viewBox. */
function useProjecao() {
  return useMemo(() => {
    const pontos = TOCANTINS_RINGS.flat();
    const lons = pontos.map((p) => p[0]);
    const lats = pontos.map((p) => p[1]);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const cos = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);

    const larguraGraus = (maxLon - minLon) * cos;
    const alturaGraus = maxLat - minLat;
    const escala = (LARGURA - PAD * 2) / larguraGraus;
    const altura = alturaGraus * escala + PAD * 2;

    const projetar = (lon: number, lat: number): [number, number] => [
      PAD + (lon - minLon) * cos * escala,
      PAD + (maxLat - lat) * escala,
    ];

    return { projetar, altura };
  }, []);
}

export function MapaTocantins() {
  const [pontos, setPontos] = useState<PontoMapa[] | null>(null);
  const [destaque, setDestaque] = useState<number | null>(null);
  const { projetar, altura } = useProjecao();

  useEffect(() => {
    apiFetch<PontoMapa[]>("/api/publico/mapa", { auth: false })
      .then(setPontos)
      .catch(() => setPontos([]));
  }, []);

  const contorno = useMemo(
    () =>
      TOCANTINS_RINGS.map(
        (anel) =>
          anel
            .map(([lon, lat], i) => {
              const [x, y] = projetar(lon, lat);
              return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
            })
            .join(" ") + " Z",
      ).join(" "),
    [projetar],
  );

  const maxFamilias = useMemo(() => Math.max(1, ...(pontos ?? []).map((p) => p.familias)), [pontos]);
  const totalFamilias = (pontos ?? []).reduce((s, p) => s + p.familias, 0);

  const topCidades = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const p of pontos ?? []) mapa.set(p.municipio, (mapa.get(p.municipio) ?? 0) + p.familias);
    return [...mapa.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [pontos]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        {/* Mapa */}
        <div className="relative mx-auto w-full max-w-[320px]">
          {!pontos && (
            <div className="flex items-center justify-center py-16 text-slate-300">
              <Spinner />
            </div>
          )}
          {pontos && (
            <svg viewBox={`0 0 ${LARGURA} ${altura}`} className="w-full" role="img" aria-label="Mapa do Tocantins com as famílias acompanhadas">
              <defs>
                <linearGradient id="to-fill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e8f8ee" />
                  <stop offset="100%" stopColor="#c6efd5" />
                </linearGradient>
              </defs>
              <path d={contorno} fill="url(#to-fill)" stroke="#00822f" strokeWidth={1.4} strokeLinejoin="round" />
              {pontos.map((p, i) => {
                const [x, y] = projetar(p.lng, p.lat);
                const r = 3 + (p.familias / maxFamilias) * 7;
                const ativo = destaque === i;
                return (
                  <g key={`${p.lat}-${p.lng}-${i}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={ativo ? r + 2 : r}
                      fill="#009c3b"
                      fillOpacity={0.7}
                      stroke="#fff"
                      strokeWidth={1}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setDestaque(i)}
                      onMouseLeave={() => setDestaque(null)}
                    >
                      <title>{`${p.municipio}: ${p.familias} ${p.familias === 1 ? "família" : "famílias"}`}</title>
                    </circle>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Legenda / ranking */}
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-ink">{totalFamilias.toLocaleString("pt-BR")}</span>
            <span className="text-sm text-slate-500">famílias geolocalizadas</span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <IconMap className="h-3.5 w-3.5" /> Tocantins · pontos agregados e anonimizados
          </p>

          {topCidades.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {topCidades.map(([cidade, qtd]) => (
                <li key={cidade} className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                  <span className="min-w-0 flex-1 truncate text-slate-600">{cidade}</span>
                  <span className="font-semibold tabular-nums text-ink">{qtd}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
