"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type Query = Record<string, string | number | boolean | null | undefined>;

interface ResultadoFetch<T> {
  dados: T | null;
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
}

/** GET reativo: refaz a busca quando `path` ou `query` mudam. */
export function useFetch<T>(path: string | null, query?: Query): ResultadoFetch<T> {
  const [dados, setDados] = useState<T | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const recarregar = useCallback(() => setTick((t) => t + 1), []);
  const chaveQuery = JSON.stringify(query ?? {});

  useEffect(() => {
    if (path === null) {
      setCarregando(false);
      return;
    }
    let ativo = true;
    setCarregando(true);
    setErro(null);
    apiFetch<T>(path, { query })
      .then((d) => ativo && setDados(d))
      .catch((e) => ativo && setErro(e instanceof ApiError ? e.message : "Erro ao carregar."))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, chaveQuery, tick]);

  return { dados, carregando, erro, recarregar };
}

/** Debounce simples para campos de busca. */
export function useDebounce<T>(valor: T, ms = 400): T {
  const [v, setV] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setV(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return v;
}
