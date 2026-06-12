"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/lib/hooks";
import type { Usuario } from "@/lib/types";
import { rotuloPerfil } from "@/lib/catalogos";
import { dataHora, iniciais } from "@/lib/format";
import { emailValido } from "@/lib/validacao";
import {
  CabecalhoPagina,
  Cartao,
  Campo,
  Entrada,
  Botao,
  Badge,
  AlertaErro,
} from "@/components/ui";
import { useToast } from "@/components/Toast";
import { IconUser, IconShield } from "@/components/icons";

export default function ContaPage() {
  const toast = useToast();
  const { usuario, atualizarUsuario } = useAuth();
  const { dados } = useFetch<Usuario>("/api/conta");

  // --- Dados pessoais ---
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [erroDados, setErroDados] = useState<string | null>(null);

  async function salvarDados(e: React.FormEvent) {
    e.preventDefault();
    setErroDados(null);
    if (!emailValido(email)) {
      setErroDados("E-mail em formato inválido.");
      return;
    }
    setSalvandoDados(true);
    try {
      await apiFetch("/api/conta", { method: "PUT", body: { nome: nome.trim(), email: email.trim() } });
      atualizarUsuario({ nome: nome.trim(), email: email.trim() });
      toast.sucesso("Dados atualizados.");
    } catch (err) {
      setErroDados(err instanceof ApiError ? err.message : "Erro ao salvar os dados.");
    } finally {
      setSalvandoDados(false);
    }
  }

  // --- Senha ---
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState<string | null>(null);

  async function salvarSenha(e: React.FormEvent) {
    e.preventDefault();
    setErroSenha(null);
    if (novaSenha.length < 8) {
      setErroSenha("A nova senha deve ter ao menos 8 caracteres.");
      return;
    }
    if (novaSenha !== confirmar) {
      setErroSenha("A confirmação não corresponde à nova senha.");
      return;
    }
    setSalvandoSenha(true);
    try {
      await apiFetch("/api/conta/senha", { method: "PUT", body: { senhaAtual, novaSenha } });
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmar("");
      toast.sucesso("Senha alterada com sucesso.");
    } catch (err) {
      setErroSenha(err instanceof ApiError ? err.message : "Erro ao alterar a senha.");
    } finally {
      setSalvandoSenha(false);
    }
  }

  const perfis = usuario?.perfis ?? [];

  return (
    <div className="space-y-6">
      <CabecalhoPagina titulo="Minha conta" descricao="Gerencie seus dados de acesso e sua senha." />

      {/* Resumo */}
      <Cartao className="flex flex-wrap items-center gap-4 p-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
          {iniciais(usuario?.nome)}
        </span>
        <div className="min-w-0">
          <p className="text-lg font-semibold text-ink">{usuario?.nome}</p>
          <p className="text-sm text-slate-500">@{usuario?.login}</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {perfis.map((p) => (
            <Badge key={p} className="bg-brand-50 text-brand-700">{rotuloPerfil[p] ?? p}</Badge>
          ))}
        </div>
        {dados?.ultimoLoginEm && (
          <p className="w-full text-xs text-slate-400">Último acesso em {dataHora(dados.ultimoLoginEm)}.</p>
        )}
      </Cartao>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dados pessoais */}
        <Cartao className="p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            <IconUser className="h-[18px] w-[18px] text-brand-600" /> Dados pessoais
          </h2>
          <form onSubmit={salvarDados} className="mt-4 space-y-4">
            <AlertaErro mensagem={erroDados} />
            <Campo label="Nome" obrigatorio>
              <Entrada value={nome} onChange={(e) => setNome(e.target.value)} required maxLength={150} />
            </Campo>
            <Campo label="E-mail" obrigatorio>
              <Entrada type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={200} />
            </Campo>
            <Campo label="Login">
              <Entrada value={usuario?.login ?? ""} disabled />
            </Campo>
            <div className="flex justify-end">
              <Botao type="submit" carregando={salvandoDados}>Salvar dados</Botao>
            </div>
          </form>
        </Cartao>

        {/* Senha */}
        <Cartao className="p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            <IconShield className="h-[18px] w-[18px] text-brand-600" /> Alterar senha
          </h2>
          <form onSubmit={salvarSenha} className="mt-4 space-y-4">
            <AlertaErro mensagem={erroSenha} />
            <Campo label="Senha atual" obrigatorio>
              <Entrada type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} required autoComplete="current-password" />
            </Campo>
            <Campo label="Nova senha" obrigatorio>
              <Entrada type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required minLength={8} autoComplete="new-password" />
            </Campo>
            <Campo label="Confirmar nova senha" obrigatorio>
              <Entrada type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required minLength={8} autoComplete="new-password" />
            </Campo>
            <p className="text-xs text-slate-400">A senha deve ter ao menos 8 caracteres.</p>
            <div className="flex justify-end">
              <Botao type="submit" carregando={salvandoSenha}>Alterar senha</Botao>
            </div>
          </form>
        </Cartao>
      </div>
    </div>
  );
}
