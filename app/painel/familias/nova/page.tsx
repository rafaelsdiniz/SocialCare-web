"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import type { Familia } from "@/lib/types";
import { EnderecoForm, enderecoVazio, enderecoParaRequest, type EnderecoState } from "@/components/painel/EnderecoForm";
import { Botao, Campo, Cartao, Entrada, AreaTexto, AlertaErro } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { IconChevronLeft } from "@/components/icons";

export default function NovaFamiliaPage() {
  const router = useRouter();
  const toast = useToast();
  const [codigo, setCodigo] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [endereco, setEndereco] = useState<EnderecoState>(enderecoVazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!endereco.municipioId) {
      setErro("Selecione o município do endereço.");
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
              <Entrada value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex.: FAM-0001" required />
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
