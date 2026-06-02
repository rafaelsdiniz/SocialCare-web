"use client";

import { useState } from "react";
import { useFetch, useDebounce } from "@/lib/hooks";
import type { LogAuditoria, PagedResult } from "@/lib/types";
import { tipoAuditoriaOpcoes } from "@/lib/enums";
import { dataHora } from "@/lib/format";
import {
  CabecalhoPagina,
  Entrada,
  Selecao,
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
import { ADMIN } from "@/lib/auth";
import { IconSearch } from "@/components/icons";

const corTipo: Record<string, string> = {
  Criacao: "bg-accent-100 text-accent-700",
  Alteracao: "bg-brand-100 text-brand-700",
  Exclusao: "bg-rose-100 text-rose-700",
  Login: "bg-slate-100 text-slate-600",
  Logout: "bg-slate-100 text-slate-600",
  AcessoNegado: "bg-amber-100 text-amber-700",
};

function Conteudo() {
  const [entidade, setEntidade] = useState("");
  const [tipo, setTipo] = useState("");
  const [pagina, setPagina] = useState(1);
  const entidadeD = useDebounce(entidade);

  const { dados, carregando, erro } = useFetch<PagedResult<LogAuditoria>>("/api/auditoria", {
    entidade: entidadeD || undefined,
    tipo: tipo || undefined,
    pagina,
    tamanhoPagina: 25,
  });

  const [detalhe, setDetalhe] = useState<LogAuditoria | null>(null);

  return (
    <div className="space-y-6">
      <CabecalhoPagina titulo="Auditoria" descricao="Trilha de operações realizadas no sistema." />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Entrada value={entidade} onChange={(e) => { setEntidade(e.target.value); setPagina(1); }} placeholder="Filtrar por entidade (ex.: Familia)..." className="pl-9" />
        </div>
        <Selecao value={tipo} onChange={(e) => { setTipo(e.target.value); setPagina(1); }} className="w-52">
          <option value="">Todos os tipos</option>
          {tipoAuditoriaOpcoes.map((o) => (
            <option key={o.valor} value={o.valor}>{o.rotulo}</option>
          ))}
        </Selecao>
      </div>

      <AlertaErro mensagem={erro} />

      {carregando ? (
        <CarregandoBloco />
      ) : !dados || dados.itens.length === 0 ? (
        <Vazio titulo="Nenhum registro de auditoria" />
      ) : (
        <>
          <Tabela>
            <thead>
              <tr>
                <Th>Data</Th>
                <Th>Usuário</Th>
                <Th>Tipo</Th>
                <Th>Entidade</Th>
                <Th>Registro</Th>
                <Th>IP</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dados.itens.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <Td className="whitespace-nowrap">{dataHora(l.criadoEm)}</Td>
                  <Td>{l.usuario ?? "—"}</Td>
                  <Td><Badge className={corTipo[l.tipo] ?? "bg-slate-100 text-slate-600"}>{l.tipo}</Badge></Td>
                  <Td>{l.entidade}</Td>
                  <Td>{l.entidadeId ?? "—"}</Td>
                  <Td className="text-slate-400">{l.enderecoIp ?? "—"}</Td>
                  <Td className="text-right">
                    {l.dadosDepois && (
                      <button onClick={() => setDetalhe(l)} className="text-sm font-medium text-brand-600 hover:text-brand-700">Ver</button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabela>
          <Paginacao pagina={dados.pagina} totalPaginas={dados.totalPaginas} totalItens={dados.totalItens} aoMudar={setPagina} />
        </>
      )}

      <Modal aberto={!!detalhe} aoFechar={() => setDetalhe(null)} titulo="Detalhe da auditoria" largura="max-w-2xl">
        {detalhe && (
          <div className="space-y-3 text-sm">
            <p><span className="font-medium text-slate-500">Usuário:</span> {detalhe.usuario ?? "—"}</p>
            <p><span className="font-medium text-slate-500">Operação:</span> {detalhe.tipo} em {detalhe.entidade} {detalhe.entidadeId ? `#${detalhe.entidadeId}` : ""}</p>
            <p><span className="font-medium text-slate-500">Quando:</span> {dataHora(detalhe.criadoEm)}</p>
            {detalhe.userAgent && <p className="break-words"><span className="font-medium text-slate-500">User agent:</span> {detalhe.userAgent}</p>}
            <div>
              <p className="mb-1 font-medium text-slate-500">Dados:</p>
              <pre className="max-h-80 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
                {formatarJson(detalhe.dadosDepois)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function formatarJson(texto?: string | null): string {
  if (!texto) return "—";
  try {
    return JSON.stringify(JSON.parse(texto), null, 2);
  } catch {
    return texto;
  }
}

export default function AuditoriaPage() {
  return (
    <RequerPerfil perfis={ADMIN}>
      <Conteudo />
    </RequerPerfil>
  );
}
