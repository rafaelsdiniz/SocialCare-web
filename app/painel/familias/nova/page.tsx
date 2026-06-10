"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import type { Familia, FamiliaResumo, PagedResult } from "@/lib/types";
import { EnderecoForm, enderecoVazio, enderecoParaRequest, type EnderecoState } from "@/components/painel/EnderecoForm";
import { cepValido } from "@/lib/validacao";
import { Botao, Campo, Cartao, Entrada, AreaTexto, AlertaErro } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { IconChevronLeft } from "@/components/icons";

// Código familiar no formato FAM-0001 gerado a partir do maior número já existente.
const PREFIXO_CODIGO = "FAM-";
const LARGURA_CODIGO = 4;

function proximoCodigo(codigos: string[]): string {
  let maior = 0;
  for (const c of codigos) {
    const m = /^FAM-(\d+)$/i.exec(c.trim());
    if (m) maior = Math.max(maior, Number(m[1]));
  }
  return `${PREFIXO_CODIGO}${String(maior + 1).padStart(LARGURA_CODIGO, "0")}`;
}

export default function NovaFamiliaPage() {
  const router = useRouter();
  const toast = useToast();
  const [codigo, setCodigo] = useState("");
  const [gerandoCodigo, setGerandoCodigo] = useState(true);
  const [responsavel, setResponsavel] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [endereco, setEndereco] = useState<EnderecoState>(enderecoVazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Sugere o próximo código ao abrir a tela; o campo segue editável para ajustes/colisões.
  useEffect(() => {
    let ativo = true;
    apiFetch<PagedResult<FamiliaResumo>>("/api/familias", {
      query: { busca: PREFIXO_CODIGO, tamanhoPagina: 500, pagina: 1 },
    })
      .then((r) => {
        if (ativo) setCodigo(proximoCodigo(r.itens.map((f) => f.codigoFamiliar)));
      })
      .catch(() => {
        // Falha ao consultar: mantém o campo vazio para preenchimento manual.
      })
      .finally(() => {
        if (ativo) setGerandoCodigo(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!endereco.municipioId) {
      setErro("Selecione o município do endereço.");
      return;
    }
    if (!cepValido(endereco.cep)) {
      setErro("Informe um CEP válido (8 dígitos).");
      return;
    }
    setSalvando(true);
    try {
      const criada = await apiFetch<Familia>("/api/familias", {
        method: "POST",
        body: {
          codigoFamiliar: codigo.trim(),
          nomeResponsavel: responsavel.trim(),
          observacoes: observacoes.trim() || null,
          endereco: enderecoParaRequest(endereco),
        },
      });
      toast.sucesso("Família cadastrada.");
      router.push(`/painel/familias/${criada.id}`);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Erro ao cadastrar família.");
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/painel/familias" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <IconChevronLeft className="h-4 w-4" /> Famílias
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Nova família</h1>

      <form onSubmit={salvar} className="space-y-6">
        <AlertaErro mensagem={erro} />

        <Cartao className="p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Identificação</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Código familiar" obrigatorio>
              <Entrada
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder={gerandoCodigo ? "Gerando código..." : "Ex.: FAM-0001"}
                disabled={gerandoCodigo}
                required
              />
              <span className="text-xs text-slate-400">
                Sugerido automaticamente — você pode ajustar se necessário.
              </span>
            </Campo>
            <Campo label="Nome do responsável" obrigatorio>
              <Entrada value={responsavel} onChange={(e) => setResponsavel(e.target.value)} required />
            </Campo>
          </div>
          <Campo label="Observações" className="mt-4">
            <AreaTexto value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Anotações sobre a família..." />
          </Campo>
        </Cartao>

        <Cartao className="p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Endereço</h2>
          <EnderecoForm valor={endereco} aoMudar={setEndereco} />
        </Cartao>

        <div className="flex justify-end gap-3">
          <Botao type="button" variante="contorno" onClick={() => router.back()}>
            Cancelar
          </Botao>
          <Botao type="submit" carregando={salvando}>
            Cadastrar família
          </Botao>
        </div>
      </form>
    </div>
  );
}
