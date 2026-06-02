"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/hooks";
import type { AbrirAtendimentoRequest, Atendimento, AtendimentoResumo, FamiliaResumo, PagedResult } from "@/lib/types";
import { statusAtendimentoOpcoes, statusAtendimentoValor } from "@/lib/enums";
import { dataHora, paraIso, paraInputDateTime } from "@/lib/format";
import {
  CabecalhoPagina,
  Botao,
  Selecao,
  Campo,
  Entrada,
  AreaTexto,
  Badge,
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

function AtendimentosConteudo() {
  const params = useSearchParams();
  const familiaIdUrl = params.get("familiaId");
  const toast = useToast();

  const [status, setStatus] = useState("");
  const [pagina, setPagina] = useState(1);
  const { dados, carregando, erro, recarregar } = useFetch<PagedResult<AtendimentoResumo>>("/api/atendimentos", {
    familiaId: familiaIdUrl || undefined,
    status: status || undefined,
    pagina,
    tamanhoPagina: 20,
  });

  const [abrir, setAbrir] = useState(false);
  const [editar, setEditar] = useState<Atendimento | null>(null);

  async function carregar(id: number) {
    try {
      setEditar(await apiFetch<Atendimento>(`/api/atendimentos/${id}`));
    } catch {
      toast.erro("Não foi possível carregar o atendimento.");
    }
  }

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Atendimentos"
        descricao="Atendimentos presenciais e remotos registrados."
        acao={
          <Botao onClick={() => setAbrir(true)}>
            <IconPlus className="h-4 w-4" /> Abrir atendimento
          </Botao>
        }
      />

      <Selecao value={status} onChange={(e) => { setStatus(e.target.value); setPagina(1); }} className="w-56">
        <option value="">Todos os status</option>
        {statusAtendimentoOpcoes.map((o) => (
          <option key={o.valor} value={o.valor}>{o.rotulo}</option>
        ))}
      </Selecao>

      <AlertaErro mensagem={erro} />

      {carregando ? (
        <CarregandoBloco />
      ) : !dados || dados.itens.length === 0 ? (
        <Vazio titulo="Nenhum atendimento encontrado" />
      ) : (
        <>
          <Tabela>
            <thead>
              <tr>
                <Th>Família</Th>
                <Th>Motivo</Th>
                <Th>Modalidade</Th>
                <Th>Data</Th>
                <Th>Assistente</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dados.itens.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <Td className="font-medium text-brand-700">{a.familiaCodigo ?? `#${a.familiaId}`}</Td>
                  <Td className="max-w-xs truncate">{a.motivo}</Td>
                  <Td><Badge className={a.remoto ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-600"}>{a.remoto ? "Remoto" : "Presencial"}</Badge></Td>
                  <Td>{dataHora(a.dataAtendimento)}</Td>
                  <Td>{a.assistente ?? "—"}</Td>
                  <Td><StatusBadge status={a.status} /></Td>
                  <Td className="text-right">
                    <button onClick={() => carregar(a.id)} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                      Detalhes
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabela>
          <Paginacao pagina={dados.pagina} totalPaginas={dados.totalPaginas} totalItens={dados.totalItens} aoMudar={setPagina} />
        </>
      )}

      {abrir && (
        <AbrirModal familiaIdUrl={familiaIdUrl} aoFechar={() => setAbrir(false)} aoSalvar={() => { setAbrir(false); recarregar(); }} />
      )}
      {editar && (
        <EditarModal atendimento={editar} aoFechar={() => setEditar(null)} aoSalvar={() => { setEditar(null); recarregar(); }} />
      )}
    </div>
  );
}

function AbrirModal({ familiaIdUrl, aoFechar, aoSalvar }: { familiaIdUrl: string | null; aoFechar: () => void; aoSalvar: () => void }) {
  const toast = useToast();
  const [familiaId, setFamiliaId] = useState<number | null>(familiaIdUrl ? Number(familiaIdUrl) : null);
  const [dataAtendimento, setDataAtendimento] = useState(paraInputDateTime(new Date().toISOString()));
  const [motivo, setMotivo] = useState("");
  const [demanda, setDemanda] = useState("");
  const [remoto, setRemoto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!familiaId) return toast.erro("Selecione a família.");
    setSalvando(true);
    try {
      const body: AbrirAtendimentoRequest = {
        familiaId,
        dataAtendimento: paraIso(dataAtendimento),
        motivo: motivo.trim(),
        demanda: demanda.trim() || null,
        remoto,
      };
      await apiFetch("/api/atendimentos", { method: "POST", body });
      toast.sucesso("Atendimento aberto.");
      aoSalvar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao abrir atendimento.");
      setSalvando(false);
    }
  }

  return (
    <Modal aberto aoFechar={aoFechar} titulo="Abrir atendimento">
      <form onSubmit={salvar} className="space-y-4">
        {!familiaIdUrl && <SeletorFamilia valor={familiaId} aoSelecionar={(f: FamiliaResumo | null) => setFamiliaId(f?.id ?? null)} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Data e hora"><Entrada type="datetime-local" value={dataAtendimento} onChange={(e) => setDataAtendimento(e.target.value)} /></Campo>
          <Campo label="Modalidade">
            <Selecao value={remoto ? "1" : "0"} onChange={(e) => setRemoto(e.target.value === "1")}>
              <option value="0">Presencial</option>
              <option value="1">Remoto</option>
            </Selecao>
          </Campo>
        </div>
        <Campo label="Motivo" obrigatorio><Entrada value={motivo} onChange={(e) => setMotivo(e.target.value)} required /></Campo>
        <Campo label="Demanda"><AreaTexto value={demanda} onChange={(e) => setDemanda(e.target.value)} /></Campo>
        <div className="flex justify-end gap-3">
          <Botao type="button" variante="contorno" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" carregando={salvando}>Abrir</Botao>
        </div>
      </form>
    </Modal>
  );
}

function EditarModal({ atendimento, aoFechar, aoSalvar }: { atendimento: Atendimento; aoFechar: () => void; aoSalvar: () => void }) {
  const toast = useToast();
  const [motivo, setMotivo] = useState(atendimento.motivo);
  const [demanda, setDemanda] = useState(atendimento.demanda ?? "");
  const [parecer, setParecer] = useState(atendimento.parecer ?? "");
  const [remoto, setRemoto] = useState(atendimento.remoto);
  const [status, setStatus] = useState(statusAtendimentoValor[atendimento.status] ?? 1);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await apiFetch(`/api/atendimentos/${atendimento.id}`, {
        method: "PUT",
        body: { motivo: motivo.trim(), demanda: demanda.trim() || null, parecer: parecer.trim() || null, remoto, status },
      });
      toast.sucesso("Atendimento atualizado.");
      aoSalvar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao salvar.");
      setSalvando(false);
    }
  }

  return (
    <Modal aberto aoFechar={aoFechar} titulo={`Atendimento · ${atendimento.familiaCodigo ?? ""}`}>
      <form onSubmit={salvar} className="space-y-4">
        <p className="text-xs text-slate-400">Aberto em {dataHora(atendimento.dataAtendimento)} por {atendimento.assistente ?? "—"}</p>
        <Campo label="Motivo" obrigatorio><Entrada value={motivo} onChange={(e) => setMotivo(e.target.value)} required /></Campo>
        <Campo label="Demanda"><AreaTexto value={demanda} onChange={(e) => setDemanda(e.target.value)} /></Campo>
        <Campo label="Parecer técnico"><AreaTexto value={parecer} onChange={(e) => setParecer(e.target.value)} placeholder="Obrigatório para concluir." /></Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Modalidade">
            <Selecao value={remoto ? "1" : "0"} onChange={(e) => setRemoto(e.target.value === "1")}>
              <option value="0">Presencial</option>
              <option value="1">Remoto</option>
            </Selecao>
          </Campo>
          <Campo label="Status">
            <Selecao value={status} onChange={(e) => setStatus(Number(e.target.value))}>
              {statusAtendimentoOpcoes.map((o) => (
                <option key={o.valor} value={o.valor}>{o.rotulo}</option>
              ))}
            </Selecao>
          </Campo>
        </div>
        <div className="flex justify-end gap-3">
          <Botao type="button" variante="contorno" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" carregando={salvando}>Salvar</Botao>
        </div>
      </form>
    </Modal>
  );
}

export default function AtendimentosPage() {
  return (
    <Suspense fallback={<CarregandoBloco />}>
      <AtendimentosConteudo />
    </Suspense>
  );
}
