"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconMenu, IconX } from "@/components/icons";
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

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center">
          <LogoFull className="h-9 sm:h-10" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const ativo = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cx(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  ativo ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100",
                )}
              >
                {l.rotulo}
              </Link>
            );
          })}
          <Link
            href="/login"
            className="ml-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Acessar sistema
          </Link>
        </nav>

        <button className="md:hidden text-slate-600" onClick={() => setAberto((a) => !a)} aria-label="Menu">
          {aberto ? <IconX /> : <IconMenu />}
        </button>
      </div>

      {aberto && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setAberto(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {l.rotulo}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setAberto(false)}
            className="mt-1 block rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-medium text-white"
          >
            Acessar sistema
          </Link>
        </nav>
      )}
    </header>
  );
}
