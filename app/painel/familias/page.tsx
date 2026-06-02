"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFetch, useDebounce } from "@/lib/hooks";
import type { FamiliaResumo, PagedResult } from "@/lib/types";
import { statusFamiliaOpcoes } from "@/lib/enums";
import { moeda } from "@/lib/format";
import {
  CabecalhoPagina,
  BotaoLink,
  Entrada,
  Selecao,
  Tabela,
  Th,
  Td,
  StatusBadge,
  Paginacao,
  CarregandoBloco,
  AlertaErro,
  Vazio,
} from "@/components/ui";
import { IconPlus, IconSearch } from "@/components/icons";

export default function FamiliasPage() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");
  const [pagina, setPagina] = useState(1);
  const buscaDebounce = useDebounce(busca);

  const { dados, carregando, erro } = useFetch<PagedResult<FamiliaResumo>>("/api/familias", {
    busca: buscaDebounce || undefined,
    status: status || undefined,
    pagina,
    tamanhoPagina: 20,
  });

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Famílias"
        descricao="Núcleos familiares acompanhados pela rede."
        acao={
          <BotaoLink href="/painel/familias/nova">
            <IconPlus className="h-4 w-4" /> Nova família
          </BotaoLink>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Entrada
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
            placeholder="Buscar por responsável ou código..."
            className="pl-9"
          />
        </div>
        <Selecao
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPagina(1);
          }}
          className="w-48"
        >
          <option value="">Todos os status</option>
          {statusFamiliaOpcoes.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </Selecao>
      </div>

      <AlertaErro mensagem={erro} />

      {carregando ? (
        <CarregandoBloco />
      ) : !dados || dados.itens.length === 0 ? (
        <Vazio titulo="Nenhuma família encontrada" descricao="Ajuste os filtros ou cadastre uma nova família." />
      ) : (
        <>
          <Tabela>
            <thead>
              <tr>
                <Th>Código</Th>
                <Th>Responsável</Th>
                <Th>Membros</Th>
                <Th>Renda per capita</Th>
                <Th>Município</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dados.itens.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => router.push(`/painel/familias/${f.id}`)}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <Td className="font-medium text-brand-700">{f.codigoFamiliar}</Td>
                  <Td className="font-medium">{f.nomeResponsavel}</Td>
                  <Td>{f.quantidadeMembros}</Td>
                  <Td>{moeda(f.rendaPerCapita)}</Td>
                  <Td>{f.municipio ? `${f.municipio}/${f.uf}` : "—"}</Td>
                  <Td>
                    <StatusBadge status={f.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabela>
          <Paginacao
            pagina={dados.pagina}
            totalPaginas={dados.totalPaginas}
            totalItens={dados.totalItens}
            aoMudar={setPagina}
          />
        </>
      )}
    </div>
  );
}
