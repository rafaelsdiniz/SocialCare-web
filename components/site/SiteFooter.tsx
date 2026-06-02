import Link from "next/link";
import { IconHands } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <IconHands />
            </span>
            <span className="text-lg font-bold tracking-tight text-ink">
              Social<span className="text-brand-600">Care</span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-slate-500">
            Cuidar é transformar. Gestão de assistência social para órgãos públicos e organizações da sociedade civil.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Navegação</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/programas" className="hover:text-brand-600">Programas sociais</Link></li>
            <li><Link href="/indicadores" className="hover:text-brand-600">Indicadores públicos</Link></li>
            <li><Link href="/sobre" className="hover:text-brand-600">Sobre o projeto</Link></li>
            <li><Link href="/contato" className="hover:text-brand-600">Contato</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Acesso restrito</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/login" className="hover:text-brand-600">Entrar no sistema</Link></li>
            <li><span className="text-slate-400">Para equipes do CRAS/CREAS e parceiros</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4">
        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} SocialCare · Plataforma de gestão de assistência social.
        </p>
      </div>
    </footer>
  );
}
