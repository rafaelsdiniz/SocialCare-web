"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/hooks";
import type {
  Beneficio,
  BeneficioResumo,
  ConcederBeneficioRequest,
  FamiliaResumo,
  PagedResult,
  ProgramaResumo,
} from "@/lib/types";
import { statusBeneficioOpcoes } from "@/lib/enums";
import { moeda, data, paraInputDate } from "@/lib/format";
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
import { RequerPerfil } from "@/components/painel/RequerPerfil";
import { useToast } from "@/components/Toast";
import { GESTAO } from "@/lib/auth";
import { IconPlus } from "@/components/icons";

function Conteudo() {
  const params = useSearchParams();
  const familiaIdUrl = params.get("familiaId");
  const toast = useToast();

  const [status, setStatus] = useState("");
  const [pagina, setPagina] = useState(1);
  const { dados, carregando, erro, recarregar } = useFetch<PagedResult<BeneficioResumo>>("/api/beneficios", {
    familiaId: familiaIdUrl || undefined,
    status: status || undefined,
    pagina,
    tamanhoPagina: 20,
  });

  const [conceder, setConceder] = useState(false);
  const [editar, setEditar] = useState<Beneficio | null>(null);
  const [motivoAcao, setMotivoAcao] = useState<{ id: number; tipo: "indeferir" | "encerrar" } | null>(null);

  async function carregarEditar(id: number) {
    try {
      setEditar(await apiFetch<Beneficio>(`/api/beneficios/${id}`));
    } catch {
      toast.erro("Não foi possível carregar o benefício.");
    }
  }

  async function aprovar(id: number) {
    if (!confirm("Aprovar este benefício?")) return;
    try {
      await apiFetch(`/api/beneficios/${id}/aprovar`, { method: "POST" });
      toast.sucesso("Benefício aprovado.");
      recarregar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao aprovar.");
    }
  }

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Benefícios"
        descricao="Concessões de programas sociais às famílias."
        acao={
          <Botao onClick={() => setConceder(true)}>
            <IconPlus className="h-4 w-4" /> Conceder benefício
          </Botao>
        }
      />

      <Selecao value={status} onChange={(e) => { setStatus(e.target.value); setPagina(1); }} className="w-56">
        <option value="">Todos os status</option>
        {statusBeneficioOpcoes.map((o) => (
          <option key={o.valor} value={o.valor}>{o.rotulo}</option>
        ))}
      </Selecao>

      <AlertaErro mensagem={erro} />

      {carregando ? (
        <CarregandoBloco />
      ) : !dados || dados.itens.length === 0 ? (
        <Vazio titulo="Nenhum benefício encontrado" />
      ) : (
        <>
          <Tabela>
            <thead>
              <tr>
                <Th>Família</Th>
                <Th>Programa</Th>
                <Th>Valor</Th>
                <Th>Início</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dados.itens.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <Td className="font-medium text-brand-700">{b.familiaCodigo ?? `#${b.familiaId}`}</Td>
                  <Td>{b.programa}</Td>
                  <Td>{moeda(b.valor)}</Td>
                  <Td>{data(b.dataInicio)}</Td>
                  <Td><StatusBadge status={b.status} /></Td>
                  <Td className="whitespace-nowrap text-right">
                    {b.status === "EmAnalise" && (
                      <>
                        <button onClick={() => carregarEditar(b.id)} className="text-sm font-medium text-brand-600 hover:text-brand-700">Editar</button>
                        <button onClick={() => aprovar(b.id)} className="ml-3 text-sm font-medium text-accent-600 hover:text-accent-700">Aprovar</button>
                        <button onClick={() => setMotivoAcao({ id: b.id, tipo: "indeferir" })} className="ml-3 text-sm font-medium text-rose-600 hover:text-rose-700">Indeferir</button>
                      </>
                    )}
                    {(b.status === "Aprovado" || b.status === "Ativo" || b.status === "Suspenso") && (
                      <button onClick={() => setMotivoAcao({ id: b.id, tipo: "encerrar" })} className="text-sm font-medium text-rose-600 hover:text-rose-700">Encerrar</button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabela>
          <Paginacao pagina={dados.pagina} totalPaginas={dados.totalPaginas} totalItens={dados.totalItens} aoMudar={setPagina} />
        </>
      )}

      {conceder && (
        <ConcederModal familiaIdUrl={familiaIdUrl} aoFechar={() => setConceder(false)} aoSalvar={() => { setConceder(false); recarregar(); }} />
      )}
      {editar && (
        <EditarModal beneficio={editar} aoFechar={() => setEditar(null)} aoSalvar={() => { setEditar(null); recarregar(); }} />
      )}
      {motivoAcao && (
        <MotivoModal
          acao={motivoAcao}
          aoFechar={() => setMotivoAcao(null)}
          aoSalvar={() => { setMotivoAcao(null); recarregar(); }}
        />
      )}
    </div>
  );
}

function ConcederModal({ familiaIdUrl, aoFechar, aoSalvar }: { familiaIdUrl: string | null; aoFechar: () => void; aoSalvar: () => void }) {
  const toast = useToast();
  const { dados: programas } = useFetch<PagedResult<ProgramaResumo>>("/api/programas", { ativo: true, tamanhoPagina: 100 });
  const [familiaId, setFamiliaId] = useState<number | null>(familiaIdUrl ? Number(familiaIdUrl) : null);
  const [programaId, setProgramaId] = useState<number | "">("");
  const [valor, setValor] = useState("");
  const [dataInicio, setDataInicio] = useState(paraInputDate(new Date().toISOString()));
  const [dataFim, setDataFim] = useState("");
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  function aoEscolherPrograma(id: number | "") {
    setProgramaId(id);
    const p = programas?.itens.find((x) => x.id === id);
    if (p?.valorPadrao != null && !valor) setValor(String(p.valorPadrao));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!familiaId) return toast.erro("Selecione a família.");
    if (!programaId) return toast.erro("Selecione o programa.");
    setSalvando(true);
    try {
      const body: ConcederBeneficioRequest = {
        familiaId,
        programaSocialId: Number(programaId),
        dataInicio: new Date(dataInicio).toISOString(),
        dataFim: dataFim ? new Date(dataFim).toISOString() : null,
        valor: Number(valor),
        observacao: observacao.trim() || null,
      };
      await apiFetch("/api/beneficios", { method: "POST", body });
      toast.sucesso("Benefício registrado (em análise).");
      aoSalvar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao conceder.");
      setSalvando(false);
    }
  }

  return (
    <Modal aberto aoFechar={aoFechar} titulo="Conceder benefício">
      <form onSubmit={salvar} className="space-y-4">
        {!familiaIdUrl && <SeletorFamilia valor={familiaId} aoSelecionar={(f: FamiliaResumo | null) => setFamiliaId(f?.id ?? null)} />}
        <Campo label="Programa" obrigatorio>
          <Selecao value={programaId} onChange={(e) => aoEscolherPrograma(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Selecione</option>
            {programas?.itens.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </Selecao>
        </Campo>
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo label="Valor (R$)" obrigatorio><Entrada type="number" step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value)} required /></Campo>
          <Campo label="Início" obrigatorio><Entrada type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required /></Campo>
          <Campo label="Fim"><Entrada type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} /></Campo>
        </div>
        <Campo label="Observação"><AreaTexto value={observacao} onChange={(e) => setObservacao(e.target.value)} /></Campo>
        <div className="flex justify-end gap-3">
          <Botao type="button" variante="contorno" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" carregando={salvando}>Conceder</Botao>
        </div>
      </form>
    </Modal>
  );
}

function EditarModal({ beneficio, aoFechar, aoSalvar }: { beneficio: Beneficio; aoFechar: () => void; aoSalvar: () => void }) {
  const toast = useToast();
  const [valor, setValor] = useState(String(beneficio.valor));
  const [dataInicio, setDataInicio] = useState(paraInputDate(beneficio.dataInicio));
  const [dataFim, setDataFim] = useState(paraInputDate(beneficio.dataFim));
  const [observacao, setObservacao] = useState(beneficio.observacao ?? "");
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await apiFetch(`/api/beneficios/${beneficio.id}`, {
        method: "PUT",
        body: {
          valor: Number(valor),
          dataInicio: new Date(dataInicio).toISOString(),
          dataFim: dataFim ? new Date(dataFim).toISOString() : null,
          observacao: observacao.trim() || null,
        },
      });
      toast.sucesso("Benefício atualizado.");
      aoSalvar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao salvar.");
      setSalvando(false);
    }
  }

  return (
    <Modal aberto aoFechar={aoFechar} titulo={`Editar benefício · ${beneficio.programa ?? ""}`}>
      <form onSubmit={salvar} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo label="Valor (R$)" obrigatorio><Entrada type="number" step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value)} required /></Campo>
          <Campo label="Início" obrigatorio><Entrada type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required /></Campo>
          <Campo label="Fim"><Entrada type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} /></Campo>
        </div>
        <Campo label="Observação"><AreaTexto value={observacao} onChange={(e) => setObservacao(e.target.value)} /></Campo>
        <div className="flex justify-end gap-3">
          <Botao type="button" variante="contorno" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" carregando={salvando}>Salvar</Botao>
        </div>
      </form>
    </Modal>
  );
}

function MotivoModal({ acao, aoFechar, aoSalvar }: { acao: { id: number; tipo: "indeferir" | "encerrar" }; aoFechar: () => void; aoSalvar: () => void }) {
  const toast = useToast();
  const [motivo, setMotivo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const indeferir = acao.tipo === "indeferir";

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await apiFetch(`/api/beneficios/${acao.id}/${acao.tipo}`, { method: "POST", body: { motivo: motivo.trim() || null } });
      toast.sucesso(indeferir ? "Benefício indeferido." : "Benefício encerrado.");
      aoSalvar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro na operação.");
      setSalvando(false);
    }
  }

  return (
    <Modal aberto aoFechar={aoFechar} titulo={indeferir ? "Indeferir benefício" : "Encerrar benefício"}>
      <form onSubmit={salvar} className="space-y-4">
        <Campo label="Motivo">
          <AreaTexto value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Descreva o motivo..." />
        </Campo>
        <div className="flex justify-end gap-3">
          <Botao type="button" variante="contorno" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" variante="perigo" carregando={salvando}>{indeferir ? "Indeferir" : "Encerrar"}</Botao>
        </div>
      </form>
    </Modal>
  );
}

export default function BeneficiosPage() {
  return (
    <RequerPerfil perfis={GESTAO}>
      <Suspense fallback={<CarregandoBloco />}>
        <Conteudo />
      </Suspense>
    </RequerPerfil>
  );
}
