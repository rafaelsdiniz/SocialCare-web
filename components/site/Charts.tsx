"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cx } from "@/components/ui";

/** Pares [cor principal, cor clara] nas cores do Brasil, para os gradientes. */
const SERIE: [string, string][] = [
  ["#009c3b", "#51cd82"],
  ["#143f8e", "#356ec9"],
  ["#d99e00", "#fbc014"],
  ["#006626", "#1fb55f"],
  ["#0a2356", "#143f8e"],
  ["#a87a00", "#ffcf33"],
];

export const PALETA = SERIE.map((s) => s[0]);

export interface DadoGrafico {
  rotulo: string;
  valor: number;
}

/** Anima de 0 → 1 quando o elemento entra na viewport (uma vez). */
function useEntradaAnimada<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [ativo, setAtivo] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAtivo(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, ativo };
}

/** Conta de 0 → valor (ease-out) assim que `ativo` vira true. */
export function useContador(valor: number, ativo: boolean, duracao = 1100) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!ativo) {
      setN(0);
      return;
    }
    let raf = 0;
    const inicio = performance.now();
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / duracao);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(valor * eased));
      if (t < 1) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [valor, ativo, duracao]);
  return n;
}

/** Mantém os N maiores e agrega o restante em "Outros". */
function aplicarLimite(dados: DadoGrafico[], limite?: number): DadoGrafico[] {
  const ordenado = [...dados].sort((a, b) => b.valor - a.valor);
  if (!limite || ordenado.length <= limite) return ordenado;
  const principais = ordenado.slice(0, limite - 1);
  const resto = ordenado.slice(limite - 1).reduce((s, d) => s + d.valor, 0);
  return resto > 0 ? [...principais, { rotulo: "Outros", valor: resto }] : principais;
}

function TituloTile({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{children}</h3>;
}

function Cartao({ children, refEl }: { children: React.ReactNode; refEl?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={refEl}
      className="h-full rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.02]"
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Donut compacto
// ---------------------------------------------------------------------------

export function GraficoDonut({
  titulo,
  dados,
  limite,
  cores,
}: {
  titulo: string;
  dados: DadoGrafico[];
  limite?: number;
  cores?: [string, string][];
}) {
  const { ref, ativo } = useEntradaAnimada<HTMLDivElement>();
  const [destaque, setDestaque] = useState<number | null>(null);
  const uid = useId().replace(/[:]/g, "");
  const paleta = cores ?? SERIE;

  const itens = aplicarLimite(dados, limite);
  const total = itens.reduce((s, d) => s + d.valor, 0);
  const totalAnim = useContador(total, ativo, 900);
  const size = 148;
  const stroke = 18;
  const r = (size - stroke) / 2 - 2;
  const c = 2 * Math.PI * r;
  const gap = itens.length > 1 ? 3 : 0;

  const segmentos = itens.map((d, i) => {
    const fracao = total > 0 ? d.valor / total : 0;
    const len = Math.max(0, fracao * c - gap);
    const offset = itens
      .slice(0, i)
      .reduce((soma, anterior) => soma + (total > 0 ? anterior.valor / total : 0) * c, 0);
    return { d, i, len, offset, par: paleta[i % paleta.length], fracao };
  });

  const ativoSeg = destaque != null ? segmentos[destaque] : null;

  return (
    <Cartao refEl={ref}>
      <TituloTile>{titulo}</TituloTile>
      {total === 0 ? (
        <p className="mt-3 text-xs text-slate-400">Sem dados.</p>
      ) : (
        <div className="mt-3 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-5">
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
              <defs>
                {segmentos.map((s) => (
                  <linearGradient key={s.i} id={`g-${uid}-${s.i}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={s.par[1]} />
                    <stop offset="100%" stopColor={s.par[0]} />
                  </linearGradient>
                ))}
              </defs>
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f4" strokeWidth={stroke} />
              {segmentos.map((s) => (
                <circle
                  key={s.i}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={`url(#g-${uid}-${s.i})`}
                  strokeWidth={destaque === s.i ? stroke + 4 : stroke}
                  strokeDasharray={ativo ? `${s.len} ${c - s.len}` : `0 ${c}`}
                  strokeDashoffset={-s.offset}
                  strokeLinecap="round"
                  className="cursor-pointer transition-all duration-700 ease-out"
                  style={{ transitionDelay: `${s.i * 90}ms`, opacity: destaque == null || destaque === s.i ? 1 : 0.25 }}
                  onMouseEnter={() => setDestaque(s.i)}
                  onMouseLeave={() => setDestaque(null)}
                />
              ))}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[28px] font-bold leading-none tabular-nums text-ink">
                {(ativoSeg ? ativoSeg.d.valor : totalAnim).toLocaleString("pt-BR")}
              </span>
              <span className="mt-1 max-w-[88px] truncate text-center text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {ativoSeg ? ativoSeg.d.rotulo : "Total"}
              </span>
            </div>
          </div>

          <ul className="w-full min-w-0 flex-1 space-y-0.5">
            {segmentos.map((s) => (
              <li
                key={s.i}
                onMouseEnter={() => setDestaque(s.i)}
                onMouseLeave={() => setDestaque(null)}
                className={cx(
                  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition",
                  destaque === s.i ? "bg-slate-50" : "",
                )}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.par[0] }} />
                <span className="min-w-0 flex-1 truncate text-slate-600">{s.d.rotulo}</span>
                <span className="font-semibold tabular-nums text-ink">{s.d.valor.toLocaleString("pt-BR")}</span>
                <span className="w-8 text-right text-[10px] tabular-nums text-slate-400">
                  {Math.round(s.fracao * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Cartao>
  );
}

// ---------------------------------------------------------------------------
// Ranking — barras horizontais em duas linhas (estilo BI)
// ---------------------------------------------------------------------------

export function GraficoBarrasH({
  titulo,
  dados,
  limite,
}: {
  titulo: string;
  dados: DadoGrafico[];
  limite?: number;
}) {
  const { ref, ativo } = useEntradaAnimada<HTMLDivElement>();
  const [destaque, setDestaque] = useState<number | null>(null);
  const itens = aplicarLimite(dados, limite);
  const max = Math.max(1, ...itens.map((d) => d.valor));

  return (
    <Cartao refEl={ref}>
      <TituloTile>{titulo}</TituloTile>
      {itens.length === 0 ? (
        <p className="mt-3 text-xs text-slate-400">Sem dados.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {itens.map((d, i) => {
            const par = SERIE[i % SERIE.length];
            const realce = destaque == null || destaque === i;
            return (
              <li
                key={d.rotulo}
                onMouseEnter={() => setDestaque(i)}
                onMouseLeave={() => setDestaque(null)}
                className="group"
              >
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="w-4 shrink-0 text-[10px] font-bold tabular-nums text-slate-300">
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                  <span
                    className={cx(
                      "min-w-0 flex-1 truncate text-xs transition-colors",
                      realce ? "text-slate-700" : "text-slate-400",
                    )}
                    title={d.rotulo}
                  >
                    {d.rotulo}
                  </span>
                  <span className="shrink-0 text-xs font-bold tabular-nums text-ink">
                    {d.valor.toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="ml-6 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-out"
                    style={{
                      width: ativo ? `${(d.valor / max) * 100}%` : "0%",
                      transitionDelay: `${i * 60}ms`,
                      background: `linear-gradient(90deg, ${par[0]}, ${par[1]})`,
                      filter: realce ? "none" : "saturate(0.6) opacity(0.7)",
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Cartao>
  );
}
