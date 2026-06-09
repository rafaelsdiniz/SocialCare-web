import Image from "next/image";

/**
 * Selo institucional: identifica a plataforma como uma iniciativa
 * do Governo do Estado do Tocantins, em conformidade com as diretrizes
 * de governo do Brasil.
 */
export function SeloGoverno() {
  return (
    <section className="border-y border-slate-200 bg-mist">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-14 text-center sm:px-6 md:flex-row md:gap-12 md:text-left">
        <div className="flex shrink-0 items-center gap-6">
          <Image
            src="/tocantins.png"
            alt="Brasão do Governo do Estado do Tocantins"
            width={320}
            height={320}
            className="h-20 w-20 object-contain"
          />
          <span className="h-16 w-px bg-slate-300" aria-hidden />
          <Image
            src="/brasil.png"
            alt="Governo Federal do Brasil"
            width={1066}
            height={513}
            className="h-12 w-auto object-contain"
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            Iniciativa pública
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">
            Um serviço do Governo do Estado do Tocantins
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
            O SocialCare é uma plataforma oficial de gestão da assistência social,
            mantida pelo Governo do Estado do Tocantins em alinhamento às políticas
            do Governo Federal. Os dados são tratados conforme a Lei Geral de Proteção
            de Dados (LGPD) e utilizados exclusivamente para o acompanhamento de famílias
            em situação de vulnerabilidade.
          </p>
        </div>
      </div>
    </section>
  );
}
