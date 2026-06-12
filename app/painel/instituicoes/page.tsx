"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { useFetch, useDebounce } from "@/lib/hooks";
import type { CnpjResponse, InstituicaoResumo, Instituicao, InstituicaoRequest, PagedResult } from "@/lib/types";
import { cnpj as fmtCnpj, soDigitos } from "@/lib/format";
import { cnpjValido, emailValido } from "@/lib/validacao";
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
import { useConfirmacao } from "@/components/Confirmacao";
import { GESTAO } from "@/lib/auth";
import { IconPlus, IconSearch } from "@/components/icons";

function Conteudo() {
  const toast = useToast();
  const confirmar = useConfirmacao();
  const [busca, setBusca] = useState("");
  const [ativo, setAtivo] = useState("");
  const [pagina, setPagina] = useState(1);
  const buscaD = useDebounce(busca);

  const { dados, carregando, erro, recarregar } = useFetch<PagedResult<InstituicaoResumo>>("/api/instituicoes-parceiras", {
    busca: buscaD || undefined,
    ativo: ativo || undefined,
    pagina,
    tamanhoPagina: 20,
  });

  const [modal, setModal] = useState(false);
  const [editar, setEditar] = useState<Instituicao | null>(null);

  async function abrirEdicao(id: number) {
    try {
      setEditar(await apiFetch<Instituicao>(`/api/instituicoes-parceiras/${id}`));
      setModal(true);
    } catch {
      toast.erro("Não foi possível carregar a instituição.");
    }
  }

  async function inativar(id: number, nome: string) {
    if (!(await confirmar({ mensagem: `Inativar "${nome}"?`, confirmar: "Inativar", perigo: true }))) return;
    try {
      await apiFetch(`/api/instituicoes-parceiras/${id}`, { method: "DELETE" });
      toast.sucesso("Instituição inativada.");
      recarregar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao inativar.");
    }
  }

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Instituições parceiras"
        descricao="Órgãos e organizações que recebem encaminhamentos."
        acao={
          <Botao onClick={() => { setEditar(null); setModal(true); }}>
            <IconPlus className="h-4 w-4" /> Nova instituição
          </Botao>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Entrada value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(1); }} placeholder="Buscar por nome ou área..." className="pl-9" />
        </div>
        <Selecao value={ativo} onChange={(e) => { setAtivo(e.target.value); setPagina(1); }} className="w-44">
          <option value="">Todas</option>
          <option value="true">Ativas</option>
          <option value="false">Inativas</option>
        </Selecao>
      </div>

      <AlertaErro mensagem={erro} />

      {carregando ? (
        <CarregandoBloco />
      ) : !dados || dados.itens.length === 0 ? (
        <Vazio titulo="Nenhuma instituição encontrada" />
      ) : (
        <>
          <Tabela>
            <thead>
              <tr>
                <Th>Nome</Th>
                <Th>CNPJ</Th>
                <Th>Área de atuação</Th>
                <Th>Situação</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dados.itens.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50">
                  <Td className="font-medium">{i.nome}</Td>
                  <Td>{fmtCnpj(i.cnpj)}</Td>
                  <Td>{i.areaAtuacao}</Td>
                  <Td><Badge className={i.ativo ? "bg-accent-100 text-accent-700" : "bg-slate-100 text-slate-500"}>{i.ativo ? "Ativa" : "Inativa"}</Badge></Td>
                  <Td className="text-right">
                    <button onClick={() => abrirEdicao(i.id)} className="text-sm font-medium text-brand-600 hover:text-brand-700">Editar</button>
                    {i.ativo && (
                      <button onClick={() => inativar(i.id, i.nome)} className="ml-3 text-sm font-medium text-rose-600 hover:text-rose-700">Inativar</button>
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
        <InstituicaoModal inst={editar} aoFechar={() => { setModal(false); setEditar(null); }} aoSalvar={() => { setModal(false); setEditar(null); recarregar(); }} />
      )}
    </div>
  );
}

function InstituicaoModal({ inst, aoFechar, aoSalvar }: { inst: Instituicao | null; aoFechar: () => void; aoSalvar: () => void }) {
  const toast = useToast();
  const [nome, setNome] = useState(inst?.nome ?? "");
  const [cnpj, setCnpj] = useState(inst?.cnpj ?? "");
  const [area, setArea] = useState(inst?.areaAtuacao ?? "");
  const [telefone, setTelefone] = useState(inst?.telefone ?? "");
  const [email, setEmail] = useState(inst?.email ?? "");
  const [responsavel, setResponsavel] = useState(inst?.responsavelContato ?? "");
  const [endereco, setEndereco] = useState(inst?.enderecoCompleto ?? "");
  const [ativo, setAtivo] = useState(inst?.ativo ?? true);
  const [salvando, setSalvando] = useState(false);
  const [consultando, setConsultando] = useState(false);

  async function consultarCnpj() {
    const d = soDigitos(cnpj);
    if (d.length !== 14) return toast.erro("Informe um CNPJ com 14 dígitos.");
    if (!cnpjValido(d)) return toast.erro("CNPJ inválido (dígitos verificadores não conferem).");
    setConsultando(true);
    try {
      const r = await apiFetch<CnpjResponse>(`/api/instituicoes-parceiras/consulta-cnpj/${d}`);
      setNome((n) => n || r.razaoSocial || r.nomeFantasia || "");
      setTelefone((t) => t || r.telefone || "");
      setEmail((e) => e || r.email || "");
      setEndereco((e) => e || r.enderecoCompleto || "");
      toast.sucesso("Dados do CNPJ carregados.");
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "CNPJ não encontrado.");
    } finally {
      setConsultando(false);
    }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!cnpjValido(cnpj)) return toast.erro("CNPJ inválido (dígitos verificadores não conferem).");
    if (email.trim() && !emailValido(email)) return toast.erro("E-mail em formato inválido.");
    setSalvando(true);
    const body: InstituicaoRequest = {
      nome: nome.trim(),
      cnpj: soDigitos(cnpj),
      areaAtuacao: area.trim(),
      telefone: telefone.trim() || null,
      email: email.trim() || null,
      responsavelContato: responsavel.trim() || null,
      enderecoCompleto: endereco.trim() || null,
    };
    try {
      if (inst) {
        await apiFetch(`/api/instituicoes-parceiras/${inst.id}`, { method: "PUT", body: { ...body, ativo } });
        toast.sucesso("Instituição atualizada.");
      } else {
        await apiFetch("/api/instituicoes-parceiras", { method: "POST", body });
        toast.sucesso("Instituição cadastrada.");
      }
      aoSalvar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao salvar.");
      setSalvando(false);
    }
  }

  return (
    <Modal aberto aoFechar={aoFechar} titulo={inst ? "Editar instituição" : "Nova instituição"} largura="max-w-2xl">
      <form onSubmit={salvar} className="space-y-4">
        <Campo label="CNPJ" obrigatorio>
          <div className="flex gap-2">
            <Entrada value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
            <Botao type="button" variante="contorno" onClick={consultarCnpj} carregando={consultando}>Consultar</Botao>
          </div>
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Nome" obrigatorio><Entrada value={nome} onChange={(e) => setNome(e.target.value)} required /></Campo>
          <Campo label="Área de atuação" obrigatorio><Entrada value={area} onChange={(e) => setArea(e.target.value)} placeholder="Saúde, Educação, Jurídico..." required /></Campo>
          <Campo label="Telefone"><Entrada value={telefone} onChange={(e) => setTelefone(e.target.value)} /></Campo>
          <Campo label="E-mail"><Entrada type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Campo>
          <Campo label="Responsável / contato"><Entrada value={responsavel} onChange={(e) => setResponsavel(e.target.value)} /></Campo>
        </div>
        <Campo label="Endereço completo"><AreaTexto value={endereco} onChange={(e) => setEndereco(e.target.value)} /></Campo>
        {inst && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
            Instituição ativa
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

export default function InstituicoesPage() {
  return (
    <RequerPerfil perfis={GESTAO}>
      <Conteudo />
    </RequerPerfil>
  );
}
