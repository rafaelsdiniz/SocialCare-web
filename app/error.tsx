"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { IconHome, IconAlert } from "@/components/icons";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-navy-900 px-4 py-16 text-white">
      {/* Brilhos de fundo nas cores da bandeira */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent-500/15 blur-3xl" />

      <div className="relative w-full max-w-lg text-center animate-fade-up">
        <Link href="/" className="inline-flex">
          <LogoMark className="h-12 w-12" />
        </Link>

        <span className="mt-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
          <IconAlert className="h-8 w-8" />
        </span>

        <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">Algo deu errado</h1>
        <p className="mx-auto mt-3 max-w-md text-brand-50/80">
          Encontramos um erro inesperado ao carregar esta página. Você pode tentar novamente
          ou voltar ao início.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <IconHome className="h-4 w-4" /> Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}
