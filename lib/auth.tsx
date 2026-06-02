"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, limparSessao, setSessao, usuarioArmazenado, getToken } from "@/lib/api";
import type { LoginResponse, UsuarioAutenticado } from "@/lib/types";

interface AuthContextValor {
  usuario: UsuarioAutenticado | null;
  carregando: boolean;
  entrar: (login: string, senha: string) => Promise<void>;
  sair: () => void;
  temPerfil: (...perfis: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValor | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = getToken();
    const u = usuarioArmazenado<UsuarioAutenticado>();
    if (token && u) setUsuario(u);
    setCarregando(false);
  }, []);

  const entrar = useCallback(async (login: string, senha: string) => {
    const resp = await apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: { login, senha },
      auth: false,
    });
    setSessao(resp.token, resp.usuario);
    setUsuario(resp.usuario);
  }, []);

  const sair = useCallback(() => {
    limparSessao();
    setUsuario(null);
  }, []);

  const temPerfil = useCallback(
    (...perfis: string[]) => !!usuario && perfis.some((p) => usuario.perfis.includes(p)),
    [usuario],
  );

  const valor = useMemo<AuthContextValor>(
    () => ({ usuario, carregando, entrar, sair, temPerfil }),
    [usuario, carregando, entrar, sair, temPerfil],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValor {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  return ctx;
}

// Papéis
export const PERFIL = {
  Admin: "Administrador",
  Gestor: "Gestor",
  Assistente: "AssistenteSocial",
} as const;

export const GESTAO = [PERFIL.Gestor, PERFIL.Admin];
export const OPERACAO = [PERFIL.Assistente, PERFIL.Gestor, PERFIL.Admin];
export const ADMIN = [PERFIL.Admin];
