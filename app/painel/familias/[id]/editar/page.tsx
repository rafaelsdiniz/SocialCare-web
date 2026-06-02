"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/hooks";
import type { Familia } from "@/lib/types";
import { statusFamiliaOpcoes, statusFamiliaValor } from "@/lib/enums";
import { soDigitos } from "@/lib/format";
import { EnderecoForm, enderecoVazio, enderecoParaRequest, type EnderecoState } from "@/components/painel/EnderecoForm";
import { Botao, Campo, Cartao, Entrada, AreaTexto, Selecao, AlertaErro, CarregandoBloco } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { IconChevronLeft } from "@/components/icons";

export default function EditarFamiliaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { dados, carregando } = useFetch<Familia>(`/api/familias/${id}`);

  const [responsavel, setResponsavel] = useState("");
  const [status, setStatus] = useState(1);
  const [observacoes, setObservacoes] = useState("");
  const [endereco, setEndereco] = useState<EnderecoState>(enderecoVazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!dados) return;
    setResponsavel(dados.nomeResponsavel);
    setStatus(statusFamiliaValor[dados.status] ?? 1);
    setObservacoes(dados.observacoes ?? "");
    if (dados.endereco) {
      setEndereco({
        cep: soDigitos(dados.endereco.cep),
        logradouro: dados.endereco.logradouro,
        numero: dados.endereco.numero,
        complemento: dados.endereco.complemento ?? "",
        bairro: dados.endereco.bairro,
        pontoReferencia: dados.endereco.pontoReferencia ?? "",
        uf: dados.endereco.uf ?? "",
        municipioId: dados.endereco.municipioId,
      });
    }
  }, [dados]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!endereco.municipioId) {
      setErro("Selecione o município do endereço.");
      return;
    }
    setSalvando(true);
    try {
      await apiFetch(`/api/familias/${id}`, {
        method: "PUT",
        body: {
          nomeResponsavel: responsavel.trim(),
          status,
          observacoes: observacoes.trim() || null,
          endereco: enderecoParaRequest(endereco),
        },
      });
      toast.sucesso("Família atualizada.");
      router.push(`/painel/familias/${id}`);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Erro ao atualizar.");
      setSalvando(false);
    }
  }

  if (carregando) return <CarregandoBloco />;

  return (
    <div className="space-y-6">
      <Link href={`/painel/familias/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <IconChevronLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Editar família</h1>

      <form onSubmit={salvar} className="space-y-6">
        <AlertaErro mensagem={erro} />
        <Cartao className="p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Identificação</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Código familiar">
              <Entrada value={dados?.codigoFamiliar ?? ""} disabled />
            </Campo>
            <Campo label="Nome do responsável" obrigatorio>
              <Entrada value={responsavel} onChange={(e) => setResponsavel(e.target.value)} required />
            </Campo>
            <Campo label="Status" obrigatorio>
              <Selecao value={status} onChange={(e) => setStatus(Number(e.target.value))}>
                {statusFamiliaOpcoes.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.rotulo}
                  </option>
                ))}
              </Selecao>
            </Campo>
          </div>
          <Campo label="Observações" className="mt-4">
            <AreaTexto value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
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
            Salvar alterações
          </Botao>
        </div>
      </form>
    </div>
  );
}
