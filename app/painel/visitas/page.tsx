"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/hooks";
import type { AgendarVisitaRequest, FamiliaResumo, PagedResult, Visita, VisitaResumo } from "@/lib/types";
import { statusVisitaOpcoes, tipoVisitaOpcoes, tipoVisitaValor } from "@/lib/enums";
import { dataHora, paraIso, paraInputDateTime } from "@/lib/format";
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

function VisitasConteudo() {
  const params = useSearchParams();
  const familiaIdUrl = params.get("familiaId");
  const toast = useToast();

  const [status, setStatus] = useState("");
  const [pagina, setPagina] = useState(1);
  const { dados, carregando, erro, recarregar } = useFetch<PagedResult<VisitaResumo>>("/api/visitas", {
    familiaId: familiaIdUrl || undefined,
    status: status || undefined,
    pagina,
    tamanhoPagina: 20,
  });

  const [modalAgendar, setModalAgendar] = useState(false);
  const [editar, setEditar] = useState<Visita | null>(null);
  const [registrar, setRegistrar] = useState<Visita | null>(null);

  async function carregar(id: number): Promise<Visita | null> {
    try {
      return await apiFetch<Visita>(`/api/visitas/${id}`);
    } catch {
      toast.erro("Não foi possível carregar a visita.");
      return null;
    }
  }

  async function cancelar(id: number) {
    if (!confirm("Cancelar esta visita?")) return;
    try {
      await apiFetch(`/api/visitas/${id}/cancelar`, { method: "POST" });
      toast.sucesso("Visita cancelada.");
      recarregar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao cancelar.");
    }
  }

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Visitas"
        descricao="Visitas domiciliares agendadas e realizadas."
        acao={
          <Botao onClick={() => setModalAgendar(true)}>
            <IconPlus className="h-4 w-4" /> Agendar visita
          </Botao>
        }
      />

      <Selecao
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setPagina(1);
        }}
        className="w-56"
      >
        <option value="">Todos os status</option>
        {statusVisitaOpcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </Selecao>

      <AlertaErro mensagem={erro} />

      {carregando ? (
        <CarregandoBloco />
      ) : !dados || dados.itens.length === 0 ? (
        <Vazio titulo="Nenhuma visita encontrada" />
      ) : (
        <>
          <Tabela>
            <thead>
              <tr>
                <Th>Família</Th>
                <Th>Tipo</Th>
                <Th>Agendada para</Th>
                <Th>Realização</Th>
                <Th>Assistente</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dados.itens.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <Td className="font-medium text-brand-700">{v.familiaCodigo ?? `#${v.familiaId}`}</Td>
                  <Td>{v.tipo}</Td>
                  <Td>{dataHora(v.dataAgendada)}</Td>
                  <Td>{dataHora(v.dataRealizacao)}</Td>
                  <Td>{v.assistente ?? "—"}</Td>
                  <Td><StatusBadge status={v.status} /></Td>
                  <Td className="whitespace-nowrap text-right">
                    {v.status === "Agendada" && (
                      <>
                        <button onClick={async () => { const d = await carregar(v.id); if (d) setRegistrar(d); }} className="text-sm font-medium text-accent-600 hover:text-accent-700">
                          Registrar
                        </button>
                        <button onClick={async () => { const d = await carregar(v.id); if (d) setEditar(d); }} className="ml-3 text-sm font-medium text-brand-600 hover:text-brand-700">
                          Editar
                        </button>
                        <button onClick={() => cancelar(v.id)} className="ml-3 text-sm font-medium text-rose-600 hover:text-rose-700">
                          Cancelar
                        </button>
                      </>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabela>
          <Paginacao pagina={dados.pagina} totalPaginas={dados.totalPaginas} totalItens={dados.totalItens} aoMudar={setPagina} />
        </>
      )}

      {modalAgendar && (
        <AgendarModal
          familiaIdUrl={familiaIdUrl}
          aoFechar={() => setModalAgendar(false)}
          aoSalvar={() => {
            setModalAgendar(false);
            recarregar();
          }}
        />
      )}
      {editar && (
        <EditarModal visita={editar} aoFechar={() => setEditar(null)} aoSalvar={() => { setEditar(null); recarregar(); }} />
      )}
      {registrar && (
        <RegistrarModal visita={registrar} aoFechar={() => setRegistrar(null)} aoSalvar={() => { setRegistrar(null); recarregar(); }} />
      )}
    </div>
  );
}

function AgendarModal({ familiaIdUrl, aoFechar, aoSalvar }: { familiaIdUrl: string | null; aoFechar: () => void; aoSalvar: () => void }) {
  const toast = useToast();
  const [familiaId, setFamiliaId] = useState<number | null>(familiaIdUrl ? Number(familiaIdUrl) : null);
  const [dataAgendada, setDataAgendada] = useState("");
  const [tipo, setTipo] = useState(1);
  const [motivo, setMotivo] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!familiaId) return toast.erro("Selecione a família.");
    if (!dataAgendada) return toast.erro("Informe a data agendada.");
    setSalvando(true);
    try {
      const body: AgendarVisitaRequest = { familiaId, dataAgendada: paraIso(dataAgendada)!, tipo, motivo: motivo.trim() || null };
      await apiFetch("/api/visitas", { method: "POST", body });
      toast.sucesso("Visita agendada.");
      aoSalvar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao agendar.");
      setSalvando(false);
    }
  }

  return (
    <Modal aberto aoFechar={aoFechar} titulo="Agendar visita">
      <form onSubmit={salvar} className="space-y-4">
        {!familiaIdUrl && <SeletorFamilia valor={familiaId} aoSelecionar={(f: FamiliaResumo | null) => setFamiliaId(f?.id ?? null)} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Data e hora" obrigatorio>
            <Entrada type="datetime-local" value={dataAgendada} onChange={(e) => setDataAgendada(e.target.value)} required />
          </Campo>
          <Campo label="Tipo" obrigatorio>
            <Selecao value={tipo} onChange={(e) => setTipo(Number(e.target.value))}>
              {tipoVisitaOpcoes.map((o) => (
                <option key={o.valor} value={o.valor}>{o.rotulo}</option>
              ))}
            </Selecao>
          </Campo>
        </div>
        <Campo label="Motivo">
          <AreaTexto value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </Campo>
        <div className="flex justify-end gap-3">
          <Botao type="button" variante="contorno" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" carregando={salvando}>Agendar</Botao>
        </div>
      </form>
    </Modal>
  );
}

function EditarModal({ visita, aoFechar, aoSalvar }: { visita: Visita; aoFechar: () => void; aoSalvar: () => void }) {
  const toast = useToast();
  const [dataAgendada, setDataAgendada] = useState(paraInputDateTime(visita.dataAgendada));
  const [tipo, setTipo] = useState(tipoVisitaValor[visita.tipo] ?? 1);
  const [motivo, setMotivo] = useState(visita.motivo ?? "");
  const [observacoes, setObservacoes] = useState(visita.observacoes ?? "");
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await apiFetch(`/api/visitas/${visita.id}`, {
        method: "PUT",
        body: { dataAgendada: paraIso(dataAgendada)!, tipo, motivo: motivo.trim() || null, observacoes: observacoes.trim() || null },
      });
      toast.sucesso("Visita atualizada.");
      aoSalvar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao salvar.");
      setSalvando(false);
    }
  }

  return (
    <Modal aberto aoFechar={aoFechar} titulo="Editar visita">
      <form onSubmit={salvar} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Data e hora" obrigatorio>
            <Entrada type="datetime-local" value={dataAgendada} onChange={(e) => setDataAgendada(e.target.value)} required />
          </Campo>
          <Campo label="Tipo" obrigatorio>
            <Selecao value={tipo} onChange={(e) => setTipo(Number(e.target.value))}>
              {tipoVisitaOpcoes.map((o) => (
                <option key={o.valor} value={o.valor}>{o.rotulo}</option>
              ))}
            </Selecao>
          </Campo>
        </div>
        <Campo label="Motivo"><AreaTexto value={motivo} onChange={(e) => setMotivo(e.target.value)} /></Campo>
        <Campo label="Observações"><AreaTexto value={observacoes} onChange={(e) => setObservacoes(e.target.value)} /></Campo>
        <div className="flex justify-end gap-3">
          <Botao type="button" variante="contorno" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" carregando={salvando}>Salvar</Botao>
        </div>
      </form>
    </Modal>
  );
}

function RegistrarModal({ visita, aoFechar, aoSalvar }: { visita: Visita; aoFechar: () => void; aoSalvar: () => void }) {
  const toast = useToast();
  const [dataRealizacao, setDataRealizacao] = useState(paraInputDateTime(new Date().toISOString()));
  const [observacoes, setObservacoes] = useState("");
  const [encaminhamentos, setEncaminhamentos] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await apiFetch(`/api/visitas/${visita.id}/registrar`, {
        method: "POST",
        body: {
          dataRealizacao: paraIso(dataRealizacao),
          observacoes: observacoes.trim() || null,
          encaminhamentos: encaminhamentos.trim() || null,
        },
      });
      toast.sucesso("Visita registrada.");
      aoSalvar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao registrar.");
      setSalvando(false);
    }
  }

  return (
    <Modal aberto aoFechar={aoFechar} titulo="Registrar realização da visita">
      <form onSubmit={salvar} className="space-y-4">
        <Campo label="Data de realização">
          <Entrada type="datetime-local" value={dataRealizacao} onChange={(e) => setDataRealizacao(e.target.value)} />
        </Campo>
        <Campo label="Observações"><AreaTexto value={observacoes} onChange={(e) => setObservacoes(e.target.value)} /></Campo>
        <Campo label="Encaminhamentos"><AreaTexto value={encaminhamentos} onChange={(e) => setEncaminhamentos(e.target.value)} /></Campo>
        <div className="flex justify-end gap-3">
          <Botao type="button" variante="contorno" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" variante="secundario" carregando={salvando}>Registrar</Botao>
        </div>
      </form>
    </Modal>
  );
}

export default function VisitasPage() {
  return (
    <Suspense fallback={<CarregandoBloco />}>
      <VisitasConteudo />
    </Suspense>
  );
}
