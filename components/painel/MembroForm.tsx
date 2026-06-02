"use client";

import { useState } from "react";
import type { Membro, MembroRequest } from "@/lib/types";
import { sexoOpcoes, estadoCivilOpcoes } from "@/lib/enums";
import { parentescos, tiposDocumento, tiposRenda } from "@/lib/catalogos";
import { paraInputDate } from "@/lib/format";
import { Botao, Campo, Entrada, AreaTexto, Selecao } from "@/components/ui";
import { IconPlus, IconX } from "@/components/icons";

interface DocLinha {
  tipoDocumentoId: number;
  numero: string;
  orgaoEmissor: string;
}
interface RendaLinha {
  tipoRendaId: number;
  valor: string;
  mesReferencia: number;
  anoReferencia: number;
  fonte: string;
}

const agora = new Date();

export function MembroForm({
  inicial,
  aoSalvar,
  aoCancelar,
  salvando,
}: {
  inicial?: Membro | null;
  aoSalvar: (req: MembroRequest) => void;
  aoCancelar: () => void;
  salvando: boolean;
}) {
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [dataNascimento, setDataNascimento] = useState(paraInputDate(inicial?.dataNascimento) || "");
  const [sexo, setSexo] = useState<number>(inicial ? sexoValor(inicial.sexo) : 1);
  const [estadoCivil, setEstadoCivil] = useState<number>(inicial ? estadoCivilValor(inicial.estadoCivil) : 1);
  const [parentescoId, setParentescoId] = useState<number>(inicial?.parentescoId ?? 1);
  const [nomeMae, setNomeMae] = useState(inicial?.nomeMae ?? "");
  const [nomePai, setNomePai] = useState(inicial?.nomePai ?? "");
  const [escolaridade, setEscolaridade] = useState(inicial?.escolaridade ?? "");
  const [ocupacao, setOcupacao] = useState(inicial?.ocupacao ?? "");
  const [pcd, setPcd] = useState(inicial?.pessoaComDeficiencia ?? false);
  const [descPcd, setDescPcd] = useState(inicial?.descricaoDeficiencia ?? "");
  const [telefone, setTelefone] = useState(inicial?.telefone ?? "");
  const [docs, setDocs] = useState<DocLinha[]>(
    inicial?.documentos.map((d) => ({ tipoDocumentoId: d.tipoDocumentoId, numero: d.numero, orgaoEmissor: d.orgaoEmissor ?? "" })) ?? [],
  );
  const [rendas, setRendas] = useState<RendaLinha[]>(
    inicial?.rendas.map((r) => ({
      tipoRendaId: r.tipoRendaId,
      valor: String(r.valor),
      mesReferencia: r.mesReferencia,
      anoReferencia: r.anoReferencia,
      fonte: r.fonte ?? "",
    })) ?? [],
  );

  function submeter(e: React.FormEvent) {
    e.preventDefault();
    const req: MembroRequest = {
      nome: nome.trim(),
      dataNascimento: new Date(dataNascimento).toISOString(),
      sexo,
      estadoCivil,
      parentescoId,
      nomeMae: nomeMae.trim() || null,
      nomePai: nomePai.trim() || null,
      escolaridade: escolaridade.trim() || null,
      ocupacao: ocupacao.trim() || null,
      pessoaComDeficiencia: pcd,
      descricaoDeficiencia: pcd ? descPcd.trim() || null : null,
      telefone: telefone.trim() || null,
      documentos: docs
        .filter((d) => d.numero.trim())
        .map((d) => ({ tipoDocumentoId: d.tipoDocumentoId, numero: d.numero.trim(), orgaoEmissor: d.orgaoEmissor.trim() || null })),
      rendas: rendas
        .filter((r) => r.valor)
        .map((r) => ({
          tipoRendaId: r.tipoRendaId,
          valor: Number(r.valor),
          mesReferencia: r.mesReferencia,
          anoReferencia: r.anoReferencia,
          fonte: r.fonte.trim() || null,
        })),
    };
    aoSalvar(req);
  }

  return (
    <form onSubmit={submeter} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Nome" obrigatorio>
          <Entrada value={nome} onChange={(e) => setNome(e.target.value)} required />
        </Campo>
        <Campo label="Data de nascimento" obrigatorio>
          <Entrada type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} required />
        </Campo>
        <Campo label="Sexo">
          <Selecao value={sexo} onChange={(e) => setSexo(Number(e.target.value))}>
            {sexoOpcoes.map((o) => (
              <option key={o.valor} value={o.valor}>{o.rotulo}</option>
            ))}
          </Selecao>
        </Campo>
        <Campo label="Estado civil">
          <Selecao value={estadoCivil} onChange={(e) => setEstadoCivil(Number(e.target.value))}>
            {estadoCivilOpcoes.map((o) => (
              <option key={o.valor} value={o.valor}>{o.rotulo}</option>
            ))}
          </Selecao>
        </Campo>
        <Campo label="Parentesco" obrigatorio>
          <Selecao value={parentescoId} onChange={(e) => setParentescoId(Number(e.target.value))}>
            {parentescos.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </Selecao>
        </Campo>
        <Campo label="Telefone">
          <Entrada value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
        </Campo>
        <Campo label="Nome da mãe">
          <Entrada value={nomeMae} onChange={(e) => setNomeMae(e.target.value)} />
        </Campo>
        <Campo label="Nome do pai">
          <Entrada value={nomePai} onChange={(e) => setNomePai(e.target.value)} />
        </Campo>
        <Campo label="Escolaridade">
          <Entrada value={escolaridade} onChange={(e) => setEscolaridade(e.target.value)} placeholder="Ex.: Ensino médio" />
        </Campo>
        <Campo label="Ocupação">
          <Entrada value={ocupacao} onChange={(e) => setOcupacao(e.target.value)} />
        </Campo>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={pcd} onChange={(e) => setPcd(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
        Pessoa com deficiência
      </label>
      {pcd && (
        <Campo label="Descrição da deficiência">
          <AreaTexto value={descPcd} onChange={(e) => setDescPcd(e.target.value)} />
        </Campo>
      )}

      {/* Documentos */}
      <Secao
        titulo="Documentos"
        aoAdicionar={() => setDocs((d) => [...d, { tipoDocumentoId: 1, numero: "", orgaoEmissor: "" }])}
      >
        {docs.map((d, i) => (
          <div key={i} className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <Campo label="Tipo">
              <Selecao value={d.tipoDocumentoId} onChange={(e) => atualizarDoc(setDocs, i, "tipoDocumentoId", Number(e.target.value))}>
                {tiposDocumento.map((t) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </Selecao>
            </Campo>
            <Campo label="Número">
              <Entrada value={d.numero} onChange={(e) => atualizarDoc(setDocs, i, "numero", e.target.value)} />
            </Campo>
            <Campo label="Órgão emissor">
              <Entrada value={d.orgaoEmissor} onChange={(e) => atualizarDoc(setDocs, i, "orgaoEmissor", e.target.value)} />
            </Campo>
            <BotaoRemover aoClicar={() => setDocs((xs) => xs.filter((_, j) => j !== i))} />
          </div>
        ))}
      </Secao>

      {/* Rendas */}
      <Secao
        titulo="Rendas"
        aoAdicionar={() =>
          setRendas((r) => [
            ...r,
            { tipoRendaId: 1, valor: "", mesReferencia: agora.getMonth() + 1, anoReferencia: agora.getFullYear(), fonte: "" },
          ])
        }
      >
        {rendas.map((r, i) => (
          <div key={i} className="grid items-end gap-2 sm:grid-cols-[1.3fr_1fr_0.7fr_0.8fr_auto]">
            <Campo label="Tipo">
              <Selecao value={r.tipoRendaId} onChange={(e) => atualizarRenda(setRendas, i, "tipoRendaId", Number(e.target.value))}>
                {tiposRenda.map((t) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </Selecao>
            </Campo>
            <Campo label="Valor (R$)">
              <Entrada type="number" step="0.01" min="0" value={r.valor} onChange={(e) => atualizarRenda(setRendas, i, "valor", e.target.value)} />
            </Campo>
            <Campo label="Mês">
              <Entrada type="number" min="1" max="12" value={r.mesReferencia} onChange={(e) => atualizarRenda(setRendas, i, "mesReferencia", Number(e.target.value))} />
            </Campo>
            <Campo label="Ano">
              <Entrada type="number" min="2000" value={r.anoReferencia} onChange={(e) => atualizarRenda(setRendas, i, "anoReferencia", Number(e.target.value))} />
            </Campo>
            <BotaoRemover aoClicar={() => setRendas((xs) => xs.filter((_, j) => j !== i))} />
          </div>
        ))}
      </Secao>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <Botao type="button" variante="contorno" onClick={aoCancelar}>
          Cancelar
        </Botao>
        <Botao type="submit" carregando={salvando}>
          {inicial ? "Salvar membro" : "Adicionar membro"}
        </Botao>
      </div>
    </form>
  );
}

function Secao({ titulo, aoAdicionar, children }: { titulo: string; aoAdicionar: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{titulo}</h3>
        <button type="button" onClick={aoAdicionar} className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
          <IconPlus className="h-4 w-4" /> Adicionar
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function BotaoRemover({ aoClicar }: { aoClicar: () => void }) {
  return (
    <button type="button" onClick={aoClicar} className="mb-1 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600">
      <IconX className="h-4 w-4" />
    </button>
  );
}

function atualizarDoc(set: React.Dispatch<React.SetStateAction<DocLinha[]>>, i: number, chave: keyof DocLinha, v: string | number) {
  set((xs) => xs.map((x, j) => (j === i ? { ...x, [chave]: v } : x)));
}
function atualizarRenda(set: React.Dispatch<React.SetStateAction<RendaLinha[]>>, i: number, chave: keyof RendaLinha, v: string | number) {
  set((xs) => xs.map((x, j) => (j === i ? { ...x, [chave]: v } : x)));
}

// A API devolve sexo/estado civil como texto; convertemos de volta para o valor do enum.
function sexoValor(s: string): number {
  return { Masculino: 1, Feminino: 2, Outro: 3, NaoInformado: 4 }[s] ?? 1;
}
function estadoCivilValor(s: string): number {
  return { Solteiro: 1, Casado: 2, UniaoEstavel: 3, Separado: 4, Divorciado: 5, Viuvo: 6 }[s] ?? 1;
}
