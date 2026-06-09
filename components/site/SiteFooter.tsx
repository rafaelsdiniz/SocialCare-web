import Link from "next/link";
import Image from "next/image";
import { LogoFull } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="bg-navy-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <LogoFull className="h-9" />
          <p className="mt-4 max-w-xs text-sm text-slate-400">
            Cuidar é transformar. Gestão de assistência social do Governo do Estado do Tocantins.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Navegação</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link href="/programas" className="hover:text-white">Programas sociais</Link></li>
            <li><Link href="/indicadores" className="hover:text-white">Indicadores públicos</Link></li>
            <li><Link href="/sobre" className="hover:text-white">Sobre o projeto</Link></li>
            <li><Link href="/contato" className="hover:text-white">Contato</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Acesso restrito</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link href="/login" className="hover:text-white">Entrar no sistema</Link></li>
            <li><span className="text-slate-500">Para equipes do CRAS/CREAS e parceiros</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-center sm:flex-row sm:justify-between sm:gap-6 sm:px-6 sm:text-left">
          <div className="flex items-center gap-5">
            <Image
              src="/tocantins.png"
              alt="Brasão do Governo do Estado do Tocantins"
              width={320}
              height={320}
              className="h-12 w-12 object-contain"
            />
            <Image
              src="/brasil.png"
              alt="Governo Federal do Brasil"
              width={1066}
              height={513}
              className="h-10 w-auto object-contain"
            />
          </div>
          <p className="max-w-md text-xs leading-relaxed text-slate-400">
            Plataforma oficial mantida pelo <strong className="font-semibold text-slate-200">Governo do Estado do Tocantins</strong>,
            em alinhamento às políticas de assistência social do Governo Federal.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 py-4">
        <p className="text-center text-xs text-slate-500">
          © {new Date().getFullYear()} SocialCare · Plataforma de gestão de assistência social do Governo do Estado do Tocantins.
        </p>
      </div>
    </footer>
  );
}
