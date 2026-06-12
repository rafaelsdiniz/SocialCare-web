"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useFetch } from "@/lib/hooks";
import { soDigitos } from "@/lib/format";
import type { CepResponse, Estado, Municipio } from "@/lib/types";
import { Botao, Campo, Entrada, Selecao } from "@/components/ui";
import { useToast } from "@/components/Toast";

export interface EnderecoState {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  pontoReferencia: string;
  uf: string;
  municipioId: number | "";
}

export const enderecoVazio: EnderecoState = {
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  pontoReferencia: "",
  uf: "",
  municipioId: "",
};

export function EnderecoForm({
  valor,
  aoMudar,
}: {
  valor: EnderecoState;
  aoMudar: (e: EnderecoState) => void;
}) {
  const toast = useToast();
  const { dados: estados } = useFetch<Estado[]>("/api/publico/estados");
  const { dados: municipios } = useFetch<Municipio[]>(
    valor.uf ? `/api/publico/municipios/${valor.uf}` : null,
  );
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [municipioAlvo, setMunicipioAlvo] = useState<string | null>(null);

  // Após carregar municípios da UF, casa o nome vindo do ViaCEP com o ID.
  useEffect(() => {
    if (!municipioAlvo || !municipios) return;
    const achado = municipios.find(
      (m) => m.nome.localeCompare(municipioAlvo, "pt-BR", { sensitivity: "base" }) === 0,
    );
    if (achado) aoMudar({ ...valor, municipioId: achado.id });
    setMunicipioAlvo(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [municipios, municipioAlvo]);

  function set<K extends keyof EnderecoState>(chave: K, v: EnderecoState[K]) {
    aoMudar({ ...valor, [chave]: v });
  }

  async function buscarCep() {
    const cep = soDigitos(valor.cep);
    if (cep.length !== 8) {
      toast.erro("Informe um CEP com 8 dígitos.");
      return;
    }
    setBuscandoCep(true);
    try {
      const r = await apiFetch<CepResponse>(`/api/publico/cep/${cep}`, { auth: false });
      aoMudar({
        ...valor,
        cep,
        logradouro: r.logradouro || valor.logradouro,
        bairro: r.bairro || valor.bairro,
        complemento: r.complemento || valor.complemento,
        uf: r.uf || valor.uf,
        municipioId: "",
      });
      if (r.localidade) setMunicipioAlvo(r.localidade);
    } catch {
      toast.erro("CEP não encontrado.");
    } finally {
      setBuscandoCep(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo label="CEP" obrigatorio className="sm:col-span-1">
          <div className="flex gap-2">
            <Entrada
              value={valor.cep}
              onChange={(e) => set("cep", e.target.value)}
              placeholder="00000-000"
              maxLength={9}
            />
            <Botao type="button" variante="contorno" onClick={buscarCep} carregando={buscandoCep}>
              Buscar
            </Botao>
          </div>
        </Campo>
        <Campo label="Logradouro" obrigatorio className="sm:col-span-2">
          <Entrada value={valor.logradouro} onChange={(e) => set("logradouro", e.target.value)} placeholder="Rua, avenida..." />
        </Campo>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Campo label="Número" obrigatorio>
          <Entrada value={valor.numero} onChange={(e) => set("numero", e.target.value)} placeholder="123" />
        </Campo>
        <Campo label="Complemento">
          <Entrada value={valor.complemento} onChange={(e) => set("complemento", e.target.value)} placeholder="Apto, bloco..." />
        </Campo>
        <Campo label="Bairro" obrigatorio>
          <Entrada value={valor.bairro} onChange={(e) => set("bairro", e.target.value)} />
        </Campo>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Campo label="UF" obrigatorio>
          <Selecao
            value={valor.uf}
            onChange={(e) => aoMudar({ ...valor, uf: e.target.value, municipioId: "" })}
          >
            <option value="">Selecione</option>
            {estados?.map((e) => (
              <option key={e.id} value={e.sigla}>
                {e.sigla} — {e.nome}
              </option>
            ))}
          </Selecao>
        </Campo>
        <Campo label="Município" obrigatorio className="sm:col-span-2">
          <Selecao
            value={valor.municipioId}
            onChange={(e) => set("municipioId", e.target.value ? Number(e.target.value) : "")}
            disabled={!valor.uf}
          >
            <option value="">{valor.uf ? "Selecione" : "Selecione a UF primeiro"}</option>
            {municipios?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </Selecao>
        </Campo>
      </div>

      <Campo label="Ponto de referência">
        <Entrada value={valor.pontoReferencia} onChange={(e) => set("pontoReferencia", e.target.value)} placeholder="Próximo a..." />
      </Campo>
    </div>
  );
}

export function enderecoParaRequest(e: EnderecoState) {
  return {
    cep: soDigitos(e.cep),
    logradouro: e.logradouro.trim(),
    numero: e.numero.trim(),
    complemento: e.complemento.trim() || null,
    bairro: e.bairro.trim(),
    pontoReferencia: e.pontoReferencia.trim() || null,
    municipioId: Number(e.municipioId),
  };
}
