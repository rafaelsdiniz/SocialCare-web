"use client";

import { useFetch } from "@/lib/hooks";
import type { BeneficiosPorPrograma, FamiliasPorVulnerabilidade, VisitasPorAssistente } from "@/lib/types";
import { moeda } from "@/lib/format";
import {
  CabecalhoPagina,
  Cartao,
  Tabela,
  Th,
  Td,
  Badge,
  CarregandoBloco,
  AlertaErro,
  Vazio,
} from "@/components/ui";
import { RequerPerfil } from "@/components/painel/RequerPerfil";
import { GESTAO } from "@/lib/auth";

function Barra({ valor, max }: { valor: number; max: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-brand-500" style={{ width: `${(valor / Math.max(1, max)) * 100}%` }} />
    </div>
  );
}

function Conteudo() {
  const vuln = useFetch<FamiliasPorVulnerabilidade[]>("/api/relatorios/familias-por-vulnerabilidade");
  const ben = useFetch<BeneficiosPorPrograma[]>("/api/relatorios/beneficios-por-programa");
  const vis = useFetch<VisitasPorAssistente[]>("/api/relatorios/visitas-por-assistente");

  const maxVuln = Math.max(1, ...(vuln.dados?.map((v) => v.quantidadeFamilias) ?? []));

  return (
    <div className="space-y-8">
      <CabecalhoPagina titulo="Relatórios" descricao="Indicadores gerenciais da operação." />

      {/* Famílias por vulnerabilidade */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Famílias por vulnerabilidade</h2>
        {vuln.carregando ? (
          <CarregandoBloco />
        ) : vuln.erro ? (
          <AlertaErro mensagem={vuln.erro} />
        ) : !vuln.dados || vuln.dados.length === 0 ? (
          <Vazio titulo="Sem dados" />
        ) : (
          <Cartao className="divide-y divide-slate-100">
            {vuln.dados.map((v) => (
              <div key={v.vulnerabilidadeId} className="flex items-center gap-4 px-5 py-3">
                <div className="w-64 shrink-0">
                  <p className="text-sm font-medium text-slate-700">{v.vulnerabilidade}</p>
                  <p className="text-xs text-slate-400">Severidade {v.severidade}</p>
                </div>
                <div className="flex-1"><Barra valor={v.quantidadeFamilias} max={maxVuln} /></div>
                <span className="w-12 text-right text-sm font-semibold text-ink">{v.quantidadeFamilias}</span>
              </div>
            ))}
          </Cartao>
        )}
      </section>

      {/* Benefícios por programa */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Benefícios por programa</h2>
        {ben.carregando ? (
          <CarregandoBloco />
        ) : ben.erro ? (
          <AlertaErro mensagem={ben.erro} />
        ) : !ben.dados || ben.dados.length === 0 ? (
          <Vazio titulo="Sem dados" />
        ) : (
          <Tabela>
            <thead>
              <tr>
                <Th>Programa</Th>
                <Th>Total</Th>
                <Th>Ativos</Th>
                <Th>Valor mensal (ativos)</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ben.dados.map((b) => (
                <tr key={b.programaSocialId}>
                  <Td className="font-medium">{b.programa}</Td>
                  <Td>{b.quantidadeTotal}</Td>
                  <Td><Badge className="bg-accent-100 text-accent-700">{b.quantidadeAtivos}</Badge></Td>
                  <Td className="font-medium">{moeda(b.valorTotalAtivos)}</Td>
                </tr>
              ))}
            </tbody>
          </Tabela>
        )}
      </section>

      {/* Visitas por assistente */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Visitas por assistente</h2>
        {vis.carregando ? (
          <CarregandoBloco />
        ) : vis.erro ? (
          <AlertaErro mensagem={vis.erro} />
        ) : !vis.dados || vis.dados.length === 0 ? (
          <Vazio titulo="Sem dados" />
        ) : (
          <Tabela>
            <thead>
              <tr>
                <Th>Assistente</Th>
                <Th>Total</Th>
                <Th>Realizadas</Th>
                <Th>Agendadas</Th>
                <Th>Canceladas</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vis.dados.map((v) => (
                <tr key={v.assistenteId}>
                  <Td className="font-medium">{v.assistente}</Td>
                  <Td>{v.total}</Td>
                  <Td><Badge className="bg-accent-100 text-accent-700">{v.realizadas}</Badge></Td>
                  <Td><Badge className="bg-brand-100 text-brand-700">{v.agendadas}</Badge></Td>
                  <Td><Badge className="bg-rose-100 text-rose-700">{v.canceladas}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Tabela>
        )}
      </section>
    </div>
  );
}

export default function RelatoriosPage() {
  return (
    <RequerPerfil perfis={GESTAO}>
      <Conteudo />
    </RequerPerfil>
  );
}
