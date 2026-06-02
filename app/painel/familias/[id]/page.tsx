"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/hooks";
import { useAuth, GESTAO } from "@/lib/auth";
import type { Familia, Membro, MembroResumo, MembroRequest } from "@/lib/types";
import { moeda, data, cep as fmtCep } from "@/lib/format";
import {
  CabecalhoPagina,
  Botao,
  BotaoLink,
  Cartao,
  StatusBadge,
  Tabela,
  Th,
  Td,
  CarregandoBloco,
  AlertaErro,
  Vazio,
} from "@/components/ui";
import { Modal } from "@/components/Modal";
import { MembroForm } from "@/components/painel/MembroForm";
import { useToast } from "@/components/Toast";
import { IconChevronLeft, IconPlus, IconCalendar, IconClipboard, IconGift, IconShare } from "@/components/icons";

export default function FamiliaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { temPerfil } = useAuth();
  const podeGerir = temPerfil(...GESTAO);

  const { dados: familia, carregando, erro, recarregar } = useFetch<Familia>(`/api/familias/${id}`);
  const { dados: membros, recarregar: recarregarMembros } = useFetch<MembroResumo[]>(`/api/familias/${id}/membros`);

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Membro | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function abrirEdicao(membroId: number) {
    try {
      const m = await apiFetch<Membro>(`/api/familias/${id}/membros/${membroId}`);
      setEditando(m);
      setModal(true);
    } catch {
      toast.erro("Não foi possível carregar o membro.");
    }
  }

  async function salvarMembro(req: MembroRequest) {
    setSalvando(true);
    try {
      if (editando) {
        await apiFetch(`/api/familias/${id}/membros/${editando.id}`, { method: "PUT", body: req });
        toast.sucesso("Membro atualizado.");
      } else {
        await apiFetch(`/api/familias/${id}/membros`, { method: "POST", body: req });
        toast.sucesso("Membro adicionado.");
      }
      setModal(false);
      setEditando(null);
      recarregarMembros();
      recarregar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao salvar membro.");
    } finally {
      setSalvando(false);
    }
  }

  async function removerMembro(membroId: number, nome: string) {
    if (!confirm(`Remover o membro "${nome}"?`)) return;
    try {
      await apiFetch(`/api/familias/${id}/membros/${membroId}`, { method: "DELETE" });
      toast.sucesso("Membro removido.");
      recarregarMembros();
      recarregar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao remover.");
    }
  }

  async function inativarFamilia() {
    if (!confirm("Inativar esta família? Ela deixará de aparecer nas listas ativas.")) return;
    try {
      await apiFetch(`/api/familias/${id}`, { method: "DELETE" });
      toast.sucesso("Família inativada.");
      router.push("/painel/familias");
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao inativar.");
    }
  }

  if (carregando) return <CarregandoBloco />;
  if (erro || !familia) return <AlertaErro mensagem={erro ?? "Família não encontrada."} />;

  const e = familia.endereco;
  const atalhos = [
    { href: `/painel/visitas?familiaId=${id}`, rotulo: "Visitas", icone: IconCalendar },
    { href: `/painel/atendimentos?familiaId=${id}`, rotulo: "Atendimentos", icone: IconClipboard },
    { href: `/painel/encaminhamentos?familiaId=${id}`, rotulo: "Encaminhamentos", icone: IconShare },
    ...(podeGerir ? [{ href: `/painel/beneficios?familiaId=${id}`, rotulo: "Benefícios", icone: IconGift }] : []),
  ];

  return (
    <div className="space-y-6">
      <Link href="/painel/familias" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <IconChevronLeft className="h-4 w-4" /> Famílias
      </Link>

      <CabecalhoPagina
        titulo={familia.nomeResponsavel}
        descricao={`Código ${familia.codigoFamiliar}`}
        acao={
          <div className="flex gap-2">
            <BotaoLink href={`/painel/familias/${id}/editar`} variante="contorno">
              Editar
            </BotaoLink>
            {podeGerir && (
              <Botao variante="perigo" onClick={inativarFamilia}>
                Inativar
              </Botao>
            )}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Info rotulo="Status"><StatusBadge status={familia.status} /></Info>
        <Info rotulo="Membros">{familia.quantidadeMembros}</Info>
        <Info rotulo="Renda total">{moeda(familia.rendaTotalMensal)}</Info>
        <Info rotulo="Renda per capita">{moeda(familia.rendaPerCapita)}</Info>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Cartao className="p-6 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Endereço</h2>
          {e ? (
            <p className="text-sm leading-relaxed text-slate-700">
              {e.logradouro}, {e.numero}
              {e.complemento ? ` — ${e.complemento}` : ""}
              <br />
              {e.bairro} · {e.municipio}/{e.uf} · CEP {fmtCep(e.cep)}
              {e.pontoReferencia ? <><br /><span className="text-slate-500">Ref.: {e.pontoReferencia}</span></> : null}
            </p>
          ) : (
            <p className="text-sm text-slate-400">Sem endereço cadastrado.</p>
          )}
          {familia.observacoes && (
            <>
              <h2 className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wide text-slate-400">Observações</h2>
              <p className="text-sm text-slate-700">{familia.observacoes}</p>
            </>
          )}
          <p className="mt-5 text-xs text-slate-400">Cadastrada em {data(familia.dataCadastro)}</p>
        </Cartao>

        <Cartao className="p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Atalhos</h2>
          <div className="space-y-2">
            {atalhos.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-brand-300 hover:bg-brand-50"
              >
                <a.icone className="h-4 w-4 text-brand-600" /> {a.rotulo}
              </Link>
            ))}
          </div>
        </Cartao>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Membros</h2>
          <Botao
            onClick={() => {
              setEditando(null);
              setModal(true);
            }}
          >
            <IconPlus className="h-4 w-4" /> Adicionar membro
          </Botao>
        </div>

        {!membros || membros.length === 0 ? (
          <Vazio titulo="Nenhum membro cadastrado" descricao="Adicione os integrantes desta família." />
        ) : (
          <Tabela>
            <thead>
              <tr>
                <Th>Nome</Th>
                <Th>Idade</Th>
                <Th>Sexo</Th>
                <Th>Parentesco</Th>
                <Th>Renda considerada</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {membros.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <Td className="font-medium">{m.nome}</Td>
                  <Td>{m.idade} anos</Td>
                  <Td>{m.sexo}</Td>
                  <Td>{m.parentesco ?? "—"}</Td>
                  <Td>{moeda(m.rendaMensalConsiderada)}</Td>
                  <Td className="text-right">
                    <button onClick={() => abrirEdicao(m.id)} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                      Editar
                    </button>
                    <button onClick={() => removerMembro(m.id, m.nome)} className="ml-4 text-sm font-medium text-rose-600 hover:text-rose-700">
                      Remover
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabela>
        )}
      </div>

      <Modal
        aberto={modal}
        aoFechar={() => {
          setModal(false);
          setEditando(null);
        }}
        titulo={editando ? "Editar membro" : "Adicionar membro"}
        largura="max-w-3xl"
      >
        <MembroForm
          inicial={editando}
          salvando={salvando}
          aoSalvar={salvarMembro}
          aoCancelar={() => {
            setModal(false);
            setEditando(null);
          }}
        />
      </Modal>
    </div>
  );
}

function Info({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <Cartao className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{rotulo}</p>
      <div className="mt-1 text-lg font-semibold text-ink">{children}</div>
    </Cartao>
  );
}
