"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { useFetch, useDebounce } from "@/lib/hooks";
import type { CriarUsuarioRequest, PagedResult, Usuario, UsuarioResumo } from "@/lib/types";
import { perfis as catalogoPerfis, rotuloPerfil } from "@/lib/catalogos";
import {
  CabecalhoPagina,
  Botao,
  Entrada,
  Selecao,
  Campo,
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
import { ADMIN } from "@/lib/auth";
import { IconPlus, IconSearch } from "@/components/icons";

function Conteudo() {
  const toast = useToast();
  const confirmar = useConfirmacao();
  const [busca, setBusca] = useState("");
  const [ativo, setAtivo] = useState("");
  const [pagina, setPagina] = useState(1);
  const buscaD = useDebounce(busca);

  const { dados, carregando, erro, recarregar } = useFetch<PagedResult<UsuarioResumo>>("/api/usuarios", {
    busca: buscaD || undefined,
    ativo: ativo || undefined,
    pagina,
    tamanhoPagina: 20,
  });

  const [modal, setModal] = useState(false);
  const [editar, setEditar] = useState<Usuario | null>(null);
  const [senhaDe, setSenhaDe] = useState<UsuarioResumo | null>(null);

  async function abrirEdicao(id: number) {
    try {
      setEditar(await apiFetch<Usuario>(`/api/usuarios/${id}`));
      setModal(true);
    } catch {
      toast.erro("Não foi possível carregar o usuário.");
    }
  }

  async function inativar(id: number, nome: string) {
    if (!(await confirmar({ mensagem: `Inativar o usuário "${nome}"?`, confirmar: "Inativar", perigo: true }))) return;
    try {
      await apiFetch(`/api/usuarios/${id}`, { method: "DELETE" });
      toast.sucesso("Usuário inativado.");
      recarregar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao inativar.");
    }
  }

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Usuários"
        descricao="Contas de acesso ao sistema e seus perfis."
        acao={
          <Botao onClick={() => { setEditar(null); setModal(true); }}>
            <IconPlus className="h-4 w-4" /> Novo usuário
          </Botao>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Entrada value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(1); }} placeholder="Buscar por nome, login ou e-mail..." className="pl-9" />
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
        <Vazio titulo="Nenhum usuário encontrado" />
      ) : (
        <>
          <Tabela>
            <thead>
              <tr>
                <Th>Nome</Th>
                <Th>Login</Th>
                <Th>E-mail</Th>
                <Th>Perfis</Th>
                <Th>Situação</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dados.itens.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <Td className="font-medium">{u.nome}</Td>
                  <Td>{u.login}</Td>
                  <Td>{u.email}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {u.perfis.map((p) => (
                        <Badge key={p} className="bg-brand-50 text-brand-700">{rotuloPerfil[p] ?? p}</Badge>
                      ))}
                    </div>
                  </Td>
                  <Td><Badge className={u.ativo ? "bg-accent-100 text-accent-700" : "bg-slate-100 text-slate-500"}>{u.ativo ? "Ativo" : "Inativo"}</Badge></Td>
                  <Td className="whitespace-nowrap text-right">
                    <button onClick={() => abrirEdicao(u.id)} className="text-sm font-medium text-brand-600 hover:text-brand-700">Editar</button>
                    <button onClick={() => setSenhaDe(u)} className="ml-3 text-sm font-medium text-slate-600 hover:text-slate-800">Senha</button>
                    {u.ativo && (
                      <button onClick={() => inativar(u.id, u.nome)} className="ml-3 text-sm font-medium text-rose-600 hover:text-rose-700">Inativar</button>
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
        <UsuarioModal usuario={editar} aoFechar={() => { setModal(false); setEditar(null); }} aoSalvar={() => { setModal(false); setEditar(null); recarregar(); }} />
      )}
      {senhaDe && (
        <SenhaModal usuario={senhaDe} aoFechar={() => setSenhaDe(null)} aoSalvar={() => setSenhaDe(null)} />
      )}
    </div>
  );
}

function SelecaoPerfis({ valor, aoMudar }: { valor: number[]; aoMudar: (v: number[]) => void }) {
  function alternar(id: number) {
    aoMudar(valor.includes(id) ? valor.filter((x) => x !== id) : [...valor, id]);
  }
  return (
    <Campo label="Perfis" obrigatorio>
      <div className="flex flex-wrap gap-2">
        {catalogoPerfis.map((p) => {
          const ativo = valor.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => alternar(p.id)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                ativo ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {rotuloPerfil[p.nome] ?? p.nome}
            </button>
          );
        })}
      </div>
    </Campo>
  );
}

function UsuarioModal({ usuario, aoFechar, aoSalvar }: { usuario: Usuario | null; aoFechar: () => void; aoSalvar: () => void }) {
  const toast = useToast();
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [login, setLogin] = useState(usuario?.login ?? "");
  const [senha, setSenha] = useState("");
  const [perfilIds, setPerfilIds] = useState<number[]>(
    usuario ? catalogoPerfis.filter((p) => usuario.perfis.includes(p.nome)).map((p) => p.id) : [],
  );
  const [ativo, setAtivo] = useState(usuario?.ativo ?? true);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (perfilIds.length === 0) return toast.erro("Selecione ao menos um perfil.");
    setSalvando(true);
    try {
      if (usuario) {
        await apiFetch(`/api/usuarios/${usuario.id}`, {
          method: "PUT",
          body: { nome: nome.trim(), email: email.trim(), perfilIds, ativo },
        });
        toast.sucesso("Usuário atualizado.");
      } else {
        const body: CriarUsuarioRequest = { nome: nome.trim(), email: email.trim(), login: login.trim(), senha, perfilIds };
        await apiFetch("/api/usuarios", { method: "POST", body });
        toast.sucesso("Usuário criado.");
      }
      aoSalvar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao salvar.");
      setSalvando(false);
    }
  }

  return (
    <Modal aberto aoFechar={aoFechar} titulo={usuario ? "Editar usuário" : "Novo usuário"}>
      <form onSubmit={salvar} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Nome" obrigatorio><Entrada value={nome} onChange={(e) => setNome(e.target.value)} required /></Campo>
          <Campo label="E-mail" obrigatorio><Entrada type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Campo>
          <Campo label="Login" obrigatorio>
            <Entrada value={login} onChange={(e) => setLogin(e.target.value)} required disabled={!!usuario} />
          </Campo>
          {!usuario && (
            <Campo label="Senha" obrigatorio>
              <Entrada type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} />
            </Campo>
          )}
        </div>
        <SelecaoPerfis valor={perfilIds} aoMudar={setPerfilIds} />
        {usuario && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
            Usuário ativo
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

function SenhaModal({ usuario, aoFechar, aoSalvar }: { usuario: UsuarioResumo; aoFechar: () => void; aoSalvar: () => void }) {
  const toast = useToast();
  const [novaSenha, setNovaSenha] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await apiFetch(`/api/usuarios/${usuario.id}/senha`, { method: "PUT", body: { novaSenha } });
      toast.sucesso("Senha redefinida.");
      aoSalvar();
    } catch (err) {
      toast.erro(err instanceof ApiError ? err.message : "Erro ao redefinir senha.");
      setSalvando(false);
    }
  }

  return (
    <Modal aberto aoFechar={aoFechar} titulo={`Redefinir senha · ${usuario.nome}`} largura="max-w-md">
      <form onSubmit={salvar} className="space-y-4">
        <Campo label="Nova senha" obrigatorio>
          <Entrada type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required minLength={6} />
        </Campo>
        <div className="flex justify-end gap-3">
          <Botao type="button" variante="contorno" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" carregando={salvando}>Redefinir</Botao>
        </div>
      </form>
    </Modal>
  );
}

export default function UsuariosPage() {
  return (
    <RequerPerfil perfis={ADMIN}>
      <Conteudo />
    </RequerPerfil>
  );
}
