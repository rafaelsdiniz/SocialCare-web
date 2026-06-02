"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { navItens, gruposNav } from "@/components/painel/nav";
import { rotuloPerfil } from "@/lib/catalogos";
import { iniciais } from "@/lib/format";
import { cx, Spinner } from "@/components/ui";
import { IconHands, IconLogout, IconMenu, IconX } from "@/components/icons";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  const { usuario, carregando, sair, temPerfil } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    if (!carregando && !usuario) router.replace("/login");
  }, [carregando, usuario, router]);

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  if (carregando || !usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        <Spinner />
      </div>
    );
  }

  const itensVisiveis = navItens.filter((i) => !i.perfis || temPerfil(...i.perfis));

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/painel" className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
          <IconHands />
        </span>
        <span className="text-lg font-bold text-ink">
          Social<span className="text-brand-600">Care</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {gruposNav.map((grupo) => {
          const itens = itensVisiveis.filter((i) => i.grupo === grupo);
          if (itens.length === 0) return null;
          return (
            <div key={grupo}>
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{grupo}</p>
              <div className="space-y-0.5">
                {itens.map((i) => {
                  const ativo = i.href === "/painel" ? pathname === "/painel" : pathname.startsWith(i.href);
                  return (
                    <Link
                      key={i.href}
                      href={i.href}
                      className={cx(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        ativo ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100",
                      )}
                    >
                      <i.icone className="h-[18px] w-[18px]" />
                      {i.rotulo}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-mist">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">{sidebar}</aside>

      {/* Sidebar mobile */}
      {menuAberto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMenuAberto(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <button className="text-slate-600 lg:hidden" onClick={() => setMenuAberto((a) => !a)} aria-label="Menu">
            {menuAberto ? <IconX /> : <IconMenu />}
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-ink">{usuario.nome}</p>
              <p className="text-xs text-slate-500">{usuario.perfis.map((p) => rotuloPerfil[p] ?? p).join(", ")}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {iniciais(usuario.nome)}
            </span>
            <button
              onClick={() => {
                sair();
                router.replace("/login");
              }}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-rose-600"
              title="Sair"
            >
              <IconLogout className="h-[18px] w-[18px]" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
