"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/hooks";
import { useAuth, GESTAO } from "@/lib/auth";
import type {
  CriarEncaminhamentoRequest,
  Encaminhamento,
  EncaminhamentoResumo,
  FamiliaResumo,
  InstituicaoResumo,
  MembroResumo,
  PagedResult,
} from "@/lib/types";
import { statusEncaminhamentoOpcoes } from "@/lib/enums";
import { data, paraIso, paraInputDate } from "@/lib/format";
import {
  CabecalhoPagina,
  Botao,
  Selecao,
  Campo,
  Entrada,
  AreaTexto,
  Tabela,
  Th,
  Td,
  StatusBadge,
  Paginacao,
  CarregandoBloco,
  AlertaErro,
  Vazio,
} from "@/components/ui";
import { Modal } from "@/components/Modal";
import { SeletorFamilia } from "@/components/painel/SeletorFamilia";
import { useToast } from "@/components/Toast";
import { IconPlus } from "@/components/icons";

function EncaminhamentosConteudo() {
  const params = useSearchParams();
  const familiaIdUrl = params.get("familiaId");
  const toast = useToast();

  const [status, setStatus] = useState("");
  const [pagina, setPagina] = useState(1);
  const { dados, carregando, erro, recarregar } = useFetch<PagedResult<EncaminhamentoResumo>>("/api/encaminhamentos", {
    familiaId: familiaIdUrl || undefined,
    status: status || undefined,
    pagina,
    tamanhoPagina: 20,
  });

  const [criar, setCriar] = useState(false);
  const [retorno, setRetorno] = useState<Encaminhamento | null>(null);

  async function abrirRetorno(id: number) {
    try {
      setRetorno(await apiFetch<Encaminhamento>(`/api/encaminhamentos/${id}`));
    } catch {
      toast.erro("Não foi possível carregar o encaminhamento.");
    }
  }

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Encaminhamentos"
        descricao="Direcionamentos para instituições parceiras."
        acao={
          <Botao onClick={() => setCriar(true)}>
            <IconPlus className="h-4 w-4" /> Novo encaminhamento
          </Botao>
        }
      />

      <Selecao value={status} onChange={(e) => { setStatus(e.target.value); setPagina(1); }} className="w-56">
        <option value="">Todos os status</option>
        {statusEncaminhamentoOpcoes.map((o) => (
          <option key={o.valor} value={o.valor}>{o.rotulo}</option>
        ))}
      </Selecao>

      <AlertaErro mensagem={erro} />

      {carregando ? (
        <CarregandoBloco />
      ) : !dados || dados.itens.length === 0 ? (
        <Vazio titulo="Nenhum encaminhamento encontrado" />
      ) : (
        <>
          <Tabela>
            <thead>
              <tr>
                <Th>Família</Th>
                <Th>Instituição</Th>
                <Th>Motivo</Th>
                <Th>Data</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dados.itens.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <Td className="font-medium text-brand-700">{e.familiaCodigo ?? `#${e.familiaId}`}</Td>
                  <Td>{e.instituicao ?? "—"}</Td>
                  <Td className="max-w-xs truncate">{e.motivo}</Td>
                  <Td>{data(e.dataEncaminhamento)}</Td>
                  <Td><StatusBadge status={e.status} /></Td>
                  <Td className="text-right">
                    <button onClick={() => abrirRetorno(e.id)} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                      Registrar retorno
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabela>
          <Paginacao pagina={dados.pagina} totalPaginas={dados.totalPaginas} totalItens={dados.totalItens} aoMudar={setPagina} />
        </>
      )}

      {criar && (
        <CriarModal familiaIdUrl={familiaIdUrl} aoFechar={() => setCriar(false)} aoSalvar={() => { setCriar(false); recarregar(); }} />
      )}
      {retorno && (
        <RetornoModal enc={retorno} aoFechar={() => setRetorno(null)} aoSalvar={() => { setRetorno(null); recarregar(); }} />
      )}
    </div>
  );
}

function CriarModal({ familiaIdUrl, aoFechar, aoSalvar }: { familiaIdUrl: string | null; aoFechar: () => void; aoSalvar: () => void }) {
  const toast = useToast();
  const { temPerfil } = useAuth();
  const podeListarInst = temPerfil(...GESTAO);

  const [familiaId, setFamiliaId] = useState<number | null>(familiaIdUrl ? Number(familiaIdUrl) : null);
  const [instId, setInstId] = useState<number | "">("");
  const [membroId, setMembroId] = useState<number | "">("");
  const [motivo, setMotivo] = useState("");
  const [demanda, setDemanda] = useState("");
  const [dataEnc, setDataEnc] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Instituições só são listáveis por Gestão; assistentes informam o ID.
  const { dados: instituicoes } = useFetch<PagedResult<InstituicaoResumo>>(
    podeListarInst ? "/api/instituicoes-parceiras" : null,
    { ativo: true, tamanhoPagina: 100 },
  );
  const { dados: membros } = useFetch<MembroResumo[]>(familiaId ? `/api/familias/${familiaId}/membros` : null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!familiaId) return toast.erro("Selecione a família.");
    if (!instId) return toast.erro("Informe a instituição parceira.");
    setSalvando(true);
    try {
      const body: CriarEncaminhamentoRequest = {
        familiaId,
        instituicaoParceiraId: Number(instId),
        membroId: membroId ? Number(membroId) : null,
        motivo: motivo.trim(),
        demanda: demanda.trim() || null,
        dataEncaminhamento: paraIso(dataEnc),
      };
      await apiFetch("/api/encaminhamentos", { method: "POST", body });
      toast.sucesso("Encaminhamento registrado.");
      aoSalvar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao registrar.");
      setSalvando(false);
    }
  }

  return (
    <Modal aberto aoFechar={aoFechar} titulo="Novo encaminhamento">
      <form onSubmit={salvar} className="space-y-4">
        {!familiaIdUrl && (
          <SeletorFamilia
            valor={familiaId}
            aoSelecionar={(f: FamiliaResumo | null) => {
              setFamiliaId(f?.id ?? null);
              setMembroId("");
            }}
          />
        )}

        <Campo label="Instituição parceira" obrigatorio>
          {podeListarInst ? (
            <Selecao value={instId} onChange={(e) => setInstId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Selecione</option>
              {instituicoes?.itens.map((i) => (
                <option key={i.id} value={i.id}>{i.nome} — {i.areaAtuacao}</option>
              ))}
            </Selecao>
          ) : (
            <Entrada
              type="number"
              min="1"
              value={instId}
              onChange={(e) => setInstId(e.target.value ? Number(e.target.value) : "")}
              placeholder="ID da instituição parceira"
            />
          )}
        </Campo>

        {familiaId && membros && membros.length > 0 && (
          <Campo label="Membro (opcional)">
            <Selecao value={membroId} onChange={(e) => setMembroId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Toda a família</option>
              {membros.map((m) => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </Selecao>
          </Campo>
        )}

        <Campo label="Motivo" obrigatorio><Entrada value={motivo} onChange={(e) => setMotivo(e.target.value)} required /></Campo>
        <Campo label="Demanda"><AreaTexto value={demanda} onChange={(e) => setDemanda(e.target.value)} /></Campo>
        <Campo label="Data do encaminhamento"><Entrada type="date" value={dataEnc} onChange={(e) => setDataEnc(e.target.value)} /></Campo>

        <div className="flex justify-end gap-3">
          <Botao type="button" variante="contorno" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" carregando={salvando}>Registrar</Botao>
        </div>
      </form>
    </Modal>
  );
}

function RetornoModal({ enc, aoFechar, aoSalvar }: { enc: Encaminhamento; aoFechar: () => void; aoSalvar: () => void }) {
  const toast = useToast();
  const [status, setStatus] = useState(2);
  const [retorno, setRetorno] = useState(enc.retorno ?? "");
  const [dataRetorno, setDataRetorno] = useState(paraInputDate(new Date().toISOString()));
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await apiFetch(`/api/encaminhamentos/${enc.id}/retorno`, {
        method: "PUT",
        body: { status, retorno: retorno.trim() || null, dataRetorno: paraIso(dataRetorno) },
      });
      toast.sucesso("Retorno registrado.");
      aoSalvar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao registrar retorno.");
      setSalvando(false);
    }
  }

  return (
    <Modal aberto aoFechar={aoFechar} titulo="Registrar retorno">
      <form onSubmit={salvar} className="space-y-4">
        <p className="text-sm text-slate-500">
          {enc.instituicao} · {enc.familiaCodigo}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Status" obrigatorio>
            <Selecao value={status} onChange={(e) => setStatus(Number(e.target.value))}>
              {statusEncaminhamentoOpcoes.map((o) => (
                <option key={o.valor} value={o.valor}>{o.rotulo}</option>
              ))}
            </Selecao>
          </Campo>
          <Campo label="Data do retorno"><Entrada type="date" value={dataRetorno} onChange={(e) => setDataRetorno(e.target.value)} /></Campo>
        </div>
        <Campo label="Retorno / parecer"><AreaTexto value={retorno} onChange={(e) => setRetorno(e.target.value)} /></Campo>
        <div className="flex justify-end gap-3">
          <Botao type="button" variante="contorno" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" carregando={salvando}>Salvar</Botao>
        </div>
      </form>
    </Modal>
  );
}

export default function EncaminhamentosPage() {
  return (
    <Suspense fallback={<CarregandoBloco />}>
      <EncaminhamentosConteudo />
    </Suspense>
  );
}
