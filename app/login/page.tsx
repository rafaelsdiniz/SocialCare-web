"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Botao, Campo, Entrada, AlertaErro } from "@/components/ui";
import { IconHands } from "@/components/icons";

function LoginForm() {
  const { entrar } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const expirado = params.get("expirado");

  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(expirado ? "Sua sessão expirou. Entre novamente." : null);
  const [enviando, setEnviando] = useState(false);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await entrar(login, senha);
      router.push("/painel");
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível entrar.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={submeter} className="space-y-4">
      <AlertaErro mensagem={erro} />
      <Campo label="Login" obrigatorio>
        <Entrada
          autoFocus
          required
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="seu.login"
          autoComplete="username"
        />
      </Campo>
      <Campo label="Senha" obrigatorio>
        <Entrada
          required
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </Campo>
      <Botao type="submit" carregando={enviando} className="w-full">
        Entrar
      </Botao>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-brand-600 to-brand-900 p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <IconHands />
          </span>
          <span className="text-lg font-bold">
            Social<span className="text-brand-200">Care</span>
          </span>
        </Link>
        <div>
          <h1 className="text-4xl font-bold leading-tight">Cuidar é transformar.</h1>
          <p className="mt-4 max-w-md text-brand-50">
            Acesse o sistema para acompanhar famílias, benefícios, visitas e atendimentos da rede de
            assistência social.
          </p>
        </div>
        <p className="text-sm text-brand-100">© {new Date().getFullYear()} SocialCare</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-mist px-4 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <IconHands />
            </span>
            <span className="text-lg font-bold text-ink">
              Social<span className="text-brand-600">Care</span>
            </span>
          </Link>
          <h2 className="text-2xl font-semibold text-ink">Acessar o sistema</h2>
          <p className="mt-1 text-sm text-slate-500">Entre com suas credenciais institucionais.</p>
          <div className="mt-6">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/" className="font-medium text-brand-600 hover:text-brand-700">
              ← Voltar ao site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
