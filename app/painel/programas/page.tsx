"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { useFetch, useDebounce } from "@/lib/hooks";
import type { PagedResult, Programa, ProgramaResumo, ProgramaRequest } from "@/lib/types";
import { moeda, paraInputDate } from "@/lib/format";
import {
  CabecalhoPagina,
  Botao,
  Entrada,
  Selecao,
  Campo,
  AreaTexto,
  Badge,
  Tabela,
  Th,
  Td,
  Paginacao,
  CarregandoBloco,
  AlertaErro,
  Vazio,
} from "@/components/ui";
import { Modal } from "@/components/Modal";
import { RequerPerfil } from "@/components/painel/RequerPerfil";
import { useToast } from "@/components/Toast";
import { GESTAO } from "@/lib/auth";
import { IconPlus, IconSearch } from "@/components/icons";

function Conteudo() {
  const toast = useToast();
  const [busca, setBusca] = useState("");
  const [ativo, setAtivo] = useState("");
  const [pagina, setPagina] = useState(1);
  const buscaD = useDebounce(busca);

  const { dados, carregando, erro, recarregar } = useFetch<PagedResult<ProgramaResumo>>("/api/programas", {
    busca: buscaD || undefined,
    ativo: ativo || undefined,
    pagina,
    tamanhoPagina: 20,
  });

  const [modal, setModal] = useState(false);
  const [editar, setEditar] = useState<Programa | null>(null);

  async function abrirEdicao(id: number) {
    try {
      setEditar(await apiFetch<Programa>(`/api/programas/${id}`));
      setModal(true);
    } catch {
      toast.erro("Não foi possível carregar o programa.");
    }
  }

  async function inativar(id: number, nome: string) {
    if (!confirm(`Inativar o programa "${nome}"?`)) return;
    try {
      await apiFetch(`/api/programas/${id}`, { method: "DELETE" });
      toast.sucesso("Programa inativado.");
      recarregar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao inativar.");
    }
  }

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Programas sociais"
        descricao="Iniciativas que originam os benefícios concedidos."
        acao={
          <Botao onClick={() => { setEditar(null); setModal(true); }}>
            <IconPlus className="h-4 w-4" /> Novo programa
          </Botao>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Entrada value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(1); }} placeholder="Buscar programa..." className="pl-9" />
        </div>
        <Selecao value={ativo} onChange={(e) => { setAtivo(e.target.value); setPagina(1); }} className="w-44">
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </Selecao>
      </div>

      <AlertaErro mensagem={erro} />

      {carregando ? (
        <CarregandoBloco />
      ) : !dados || dados.itens.length === 0 ? (
        <Vazio titulo="Nenhum programa encontrado" />
      ) : (
        <>
          <Tabela>
            <thead>
              <tr>
                <Th>Programa</Th>
                <Th>Órgão responsável</Th>
                <Th>Valor padrão</Th>
                <Th>Situação</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dados.itens.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <Td className="font-medium">{p.nome}</Td>
                  <Td>{p.orgaoResponsavel}</Td>
                  <Td>{moeda(p.valorPadrao)}</Td>
                  <Td><Badge className={p.ativo ? "bg-accent-100 text-accent-700" : "bg-slate-100 text-slate-500"}>{p.ativo ? "Ativo" : "Inativo"}</Badge></Td>
                  <Td className="text-right">
                    <button onClick={() => abrirEdicao(p.id)} className="text-sm font-medium text-brand-600 hover:text-brand-700">Editar</button>
                    {p.ativo && (
                      <button onClick={() => inativar(p.id, p.nome)} className="ml-3 text-sm font-medium text-rose-600 hover:text-rose-700">Inativar</button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabela>
          <Paginacao pagina={dados.pagina} totalPaginas={dados.totalPaginas} totalItens={dados.totalItens} aoMudar={setPagina} />
        </>
      )}

      {modal && (
        <ProgramaModal programa={editar} aoFechar={() => { setModal(false); setEditar(null); }} aoSalvar={() => { setModal(false); setEditar(null); recarregar(); }} />
      )}
    </div>
  );
}

function ProgramaModal({ programa, aoFechar, aoSalvar }: { programa: Programa | null; aoFechar: () => void; aoSalvar: () => void }) {
  const toast = useToast();
  const [nome, setNome] = useState(programa?.nome ?? "");
  const [orgao, setOrgao] = useState(programa?.orgaoResponsavel ?? "");
  const [descricao, setDescricao] = useState(programa?.descricao ?? "");
  const [requisitos, setRequisitos] = useState(programa?.requisitos ?? "");
  const [valor, setValor] = useState(programa?.valorPadrao != null ? String(programa.valorPadrao) : "");
  const [duracao, setDuracao] = useState(programa?.duracaoMesesPadrao != null ? String(programa.duracaoMesesPadrao) : "");
  const [vigInicio, setVigInicio] = useState(paraInputDate(programa?.vigenciaInicio));
  const [vigFim, setVigFim] = useState(paraInputDate(programa?.vigenciaFim));
  const [ativo, setAtivo] = useState(programa?.ativo ?? true);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const body: ProgramaRequest = {
      nome: nome.trim(),
      orgaoResponsavel: orgao.trim(),
      descricao: descricao.trim() || null,
      requisitos: requisitos.trim() || null,
      valorPadrao: valor ? Number(valor) : null,
      duracaoMesesPadrao: duracao ? Number(duracao) : null,
      vigenciaInicio: vigInicio ? new Date(vigInicio).toISOString() : null,
      vigenciaFim: vigFim ? new Date(vigFim).toISOString() : null,
    };
    try {
      if (programa) {
        await apiFetch(`/api/programas/${programa.id}`, { method: "PUT", body: { ...body, ativo } });
        toast.sucesso("Programa atualizado.");
      } else {
        await apiFetch("/api/programas", { method: "POST", body });
        toast.sucesso("Programa cadastrado.");
      }
      aoSalvar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao salvar.");
      setSalvando(false);
    }
  }

  return (
    <Modal aberto aoFechar={aoFechar} titulo={programa ? "Editar programa" : "Novo programa"} largura="max-w-2xl">
      <form onSubmit={salvar} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Nome" obrigatorio><Entrada value={nome} onChange={(e) => setNome(e.target.value)} required /></Campo>
          <Campo label="Órgão responsável" obrigatorio><Entrada value={orgao} onChange={(e) => setOrgao(e.target.value)} required /></Campo>
        </div>
        <Campo label="Descrição"><AreaTexto value={descricao} onChange={(e) => setDescricao(e.target.value)} /></Campo>
        <Campo label="Requisitos"><AreaTexto value={requisitos} onChange={(e) => setRequisitos(e.target.value)} /></Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Valor padrão (R$)"><Entrada type="number" step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value)} /></Campo>
          <Campo label="Duração padrão (meses)"><Entrada type="number" min="0" value={duracao} onChange={(e) => setDuracao(e.target.value)} /></Campo>
          <Campo label="Vigência início"><Entrada type="date" value={vigInicio} onChange={(e) => setVigInicio(e.target.value)} /></Campo>
          <Campo label="Vigência fim"><Entrada type="date" value={vigFim} onChange={(e) => setVigFim(e.target.value)} /></Campo>
        </div>
        {programa && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
            Programa ativo
          </label>
        )}
        <div className="flex justify-end gap-3">
          <Botao type="button" variante="contorno" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" carregando={salvando}>Salvar</Botao>
        </div>
      </form>
    </Modal>
  );
}

export default function ProgramasPage() {
  return (
    <RequerPerfil perfis={GESTAO}>
      <Conteudo />
    </RequerPerfil>
  );
}
