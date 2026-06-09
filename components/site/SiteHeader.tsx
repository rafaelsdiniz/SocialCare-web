"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { IconMenu, IconX, IconArrowRight } from "@/components/icons";
import { LogoFull } from "@/components/Logo";
import { cx } from "@/components/ui";

const links = [
  { href: "/", rotulo: "Início" },
  { href: "/programas", rotulo: "Programas" },
  { href: "/indicadores", rotulo: "Indicadores" },
  { href: "/sobre", rotulo: "Sobre" },
  { href: "/contato", rotulo: "Contato" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const ehAtivo = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="z-40">
      {/* Barra de identificação do governo */}
      <div className="bg-navy-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 sm:px-6">
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-100">
            <Image src="/tocantins.png" alt="" width={320} height={320} className="h-4 w-4 object-contain" />
            Governo do Estado do Tocantins
          </span>
          <div className="hidden items-center gap-5 text-xs sm:flex">
            <Link href="/indicadores" className="text-navy-100 transition-colors hover:text-white">Transparência</Link>
            <Link href="/contato" className="text-navy-100 transition-colors hover:text-white">Fale conosco</Link>
            <Link href="/login" className="text-navy-100 transition-colors hover:text-white">Acesso restrito</Link>
          </div>
        </div>
      </div>

      {/* Navegação principal (fixa) */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
            <LogoFull className="h-9 sm:h-10" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const ativo = ehAtivo(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cx(
                    "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                    ativo ? "text-brand-700" : "text-slate-600 hover:text-brand-700",
                  )}
                >
                  {l.rotulo}
                  {ativo && (
                    <motion.span
                      layoutId="nav-indicador"
                      className="absolute inset-x-2 -bottom-[7px] h-0.5 rounded-full bg-brand-600"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
            <Link
              href="/login"
              className="ml-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow"
            >
              Acessar sistema <IconArrowRight className="h-4 w-4" />
            </Link>
          </nav>

          <button
            className="text-slate-700 md:hidden"
            onClick={() => setAberto((a) => !a)}
            aria-label="Abrir menu"
          >
            {aberto ? <IconX /> : <IconMenu />}
          </button>
        </div>

        {/* Filete tricolor */}
        <div className="h-1 bg-gradient-to-r from-brand-500 via-accent-400 to-navy-600" />

        {aberto && (
          <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setAberto(false)}
                className={cx(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  ehAtivo(l.href) ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100",
                )}
              >
                {l.rotulo}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setAberto(false)}
              className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white"
            >
              Acessar sistema <IconArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
