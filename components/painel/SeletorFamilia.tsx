"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useDebounce } from "@/lib/hooks";
import type { FamiliaResumo, PagedResult } from "@/lib/types";
import { Campo, Entrada, Spinner } from "@/components/ui";

export function SeletorFamilia({
  valor,
  aoSelecionar,
  rotuloInicial,
}: {
  valor: number | null;
  aoSelecionar: (familia: FamiliaResumo | null) => void;
  rotuloInicial?: string;
}) {
  const [texto, setTexto] = useState(rotuloInicial ?? "");
  const [aberto, setAberto] = useState(false);
  const [resultados, setResultados] = useState<FamiliaResumo[]>([]);
  const [buscando, setBuscando] = useState(false);
  const busca = useDebounce(texto, 350);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, []);

  useEffect(() => {
    if (!aberto) return;
    setBuscando(true);
    apiFetch<PagedResult<FamiliaResumo>>("/api/familias", {
      query: { busca: busca || undefined, tamanhoPagina: 8, pagina: 1 },
    })
      .then((r) => setResultados(r.itens))
      .catch(() => setResultados([]))
      .finally(() => setBuscando(false));
  }, [busca, aberto]);

  return (
    <Campo label="Família" obrigatorio>
      <div className="relative" ref={ref}>
        <Entrada
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setAberto(true);
            if (valor) aoSelecionar(null);
          }}
          onFocus={() => setAberto(true)}
          placeholder="Buscar por responsável ou código..."
          autoComplete="off"
        />
        {aberto && (
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
            {buscando ? (
              <div className="flex justify-center py-4 text-slate-400">
                <Spinner className="h-4 w-4" />
              </div>
            ) : resultados.length === 0 ? (
              <p className="px-3 py-3 text-sm text-slate-400">Nenhuma família encontrada.</p>
            ) : (
              resultados.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    aoSelecionar(f);
                    setTexto(`${f.codigoFamiliar} — ${f.nomeResponsavel}`);
                    setAberto(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-brand-50"
                >
                  <span className="font-medium text-brand-700">{f.codigoFamiliar}</span>{" "}
                  <span className="text-slate-600">{f.nomeResponsavel}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </Campo>
  );
}
