import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { IconArrowRight, IconHome } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-navy-900 px-4 py-16 text-white">
      {/* Brilhos de fundo nas cores da bandeira */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent-500/15 blur-3xl" />

      <div className="relative w-full max-w-lg text-center animate-fade-up">
        <Link href="/" className="inline-flex">
          <LogoMark className="h-12 w-12" />
        </Link>

        <p className="mt-8 bg-gradient-to-r from-brand-300 to-accent-400 bg-clip-text text-7xl font-extrabold leading-none tracking-tight text-transparent sm:text-8xl">
          404
        </p>

        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Página não encontrada</h1>
        <p className="mx-auto mt-3 max-w-md text-brand-50/80">
          O endereço que você tentou acessar não existe ou foi movido. Vamos te levar de volta.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            <IconHome className="h-4 w-4" /> Voltar ao início
          </Link>
          <Link
            href="/programas"
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Conhecer os programas <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
