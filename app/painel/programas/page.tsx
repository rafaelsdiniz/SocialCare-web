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
import { useConfirmacao } from "@/components/Confirmacao";
import { GESTAO } from "@/lib/auth";
import { IconPlus, IconSearch, IconGift } from "@/components/icons";

/** Lê uma imagem, redimensiona (máx. 1100px) e devolve um data URL JPEG leve. */
async function arquivoParaIcone(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new window.Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Imagem inválida."));
    i.src = dataUrl;
  });
  const max = 1100;
  const escala = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * escala);
  const h = Math.round(img.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  // Fundo branco para fotos com transparência não virarem preto no JPEG.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function Conteudo() {
  const toast = useToast();
  const confirmar = useConfirmacao();
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
    if (!(await confirmar({ mensagem: `Inativar o programa "${nome}"?`, confirmar: "Inativar", perigo: true }))) return;
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
  const [icone, setIcone] = useState<string | null>(programa?.iconeBase64 ?? null);
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
      iconeBase64: icone,
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
        <Campo label="Imagem do programa">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            {icone ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={icone} alt="Imagem do programa" className="h-28 w-44 shrink-0 rounded-xl border border-slate-200 object-cover" />
            ) : (
              <div className="flex h-28 w-44 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-300">
                <IconGift className="h-8 w-8" />
              </div>
            )}
            <div className="flex flex-col items-start gap-1.5">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    try {
                      setIcone(await arquivoParaIcone(f));
                    } catch {
                      toast.erro("Não foi possível processar a imagem.");
                    }
                  }
                }}
                className="block text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
              />
              {icone && (
                <button type="button" onClick={() => setIcone(null)} className="text-xs font-medium text-rose-600 hover:text-rose-700">
                  Remover imagem
                </button>
              )}
              <p className="text-xs text-slate-400">Aparece em destaque nos cartões, no carrossel e na página do programa. Prefira uma foto na horizontal.</p>
            </div>
          </div>
        </Campo>
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
