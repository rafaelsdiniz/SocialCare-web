"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Botao, Campo, Entrada, AlertaErro } from "@/components/ui";
import { LogoFull } from "@/components/Logo";
import { IconShield } from "@/components/icons";

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
      {/* Painel institucional */}
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-navy-900 via-navy-800 to-brand-700 p-12 text-white lg:flex">
        <div className="flex items-center gap-5">
          <Image
            src="/tocantins.png"
            alt="Governo do Estado do Tocantins"
            width={320}
            height={320}
            className="h-14 w-14 object-contain"
          />
          <span className="h-12 w-px bg-white/25" aria-hidden />
          <Image
            src="/brasil.png"
            alt="Governo Federal do Brasil"
            width={1066}
            height={513}
            className="h-9 w-auto object-contain"
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-200">
            Governo do Estado do Tocantins
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight">Cuidar é transformar.</h1>
          <p className="mt-4 max-w-md text-brand-50">
            Plataforma oficial de gestão da assistência social. Acompanhe famílias, benefícios,
            visitas e atendimentos da rede pública.
          </p>
        </div>

        <p className="text-sm text-brand-100">
          © {new Date().getFullYear()} SocialCare · Governo do Estado do Tocantins
        </p>
      </div>

      {/* Formulário */}
      <div className="flex flex-1 items-center justify-center bg-mist px-4 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex justify-center">
            <LogoFull className="h-10" />
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-ink">Acessar o sistema</h2>
            <p className="mt-1 text-sm text-slate-500">Entre com suas credenciais institucionais.</p>
            <div className="mt-6">
              <Suspense fallback={null}>
                <LoginForm />
              </Suspense>
            </div>
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
            <IconShield className="h-3.5 w-3.5" />
            Acesso restrito a equipes do CRAS/CREAS e parceiros autorizados.
          </p>

          {/* Selo de governo (visível no mobile, onde o painel lateral some) */}
          <div className="mt-6 flex items-center justify-center gap-4 opacity-70 lg:hidden">
            <Image
              src="/tocantins.png"
              alt="Governo do Estado do Tocantins"
              width={320}
              height={320}
              className="h-9 w-9 object-contain"
            />
            <span className="h-7 w-px bg-slate-300" aria-hidden />
            <Image
              src="/brasil.png"
              alt="Governo Federal do Brasil"
              width={1066}
              height={513}
              className="h-6 w-auto object-contain"
            />
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
