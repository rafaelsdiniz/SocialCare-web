import Link from "next/link";
import Image from "next/image";
import { DestaqueProgramas, ResumoIndicadores } from "@/components/site/PublicWidgets";
import {
  IconUsers,
  IconGift,
  IconCalendar,
  IconShare,
  IconShield,
  IconArrowRight,
  IconHeart,
} from "@/components/icons";

const recursos = [
  { icone: IconUsers, titulo: "Cadastro de famílias", texto: "Núcleos familiares, membros, renda per capita e situações de vulnerabilidade." },
  { icone: IconGift, titulo: "Benefícios e programas", texto: "Conceda, aprove e acompanhe benefícios vinculados a programas sociais." },
  { icone: IconCalendar, titulo: "Visitas e atendimentos", texto: "Agende visitas domiciliares e registre atendimentos com parecer técnico." },
  { icone: IconShare, titulo: "Encaminhamentos", texto: "Direcione famílias para instituições parceiras e acompanhe o retorno." },
  { icone: IconShield, titulo: "Controle de acesso", texto: "Perfis de Administrador, Gestor e Assistente Social com trilha de auditoria." },
  { icone: IconHeart, titulo: "Indicadores públicos", texto: "Estatísticas agregadas e anonimizadas para parceiros e transparência." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden text-white">
        <Image
          src="/hero.jpg"
          alt="Assistente social acompanhando uma família em visita domiciliar"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/70 to-navy-900/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl animate-fade-up">
            <h1 className="text-5xl font-extrabold leading-[1.03] tracking-tight drop-shadow-sm sm:text-6xl lg:text-7xl">
              Cuidar é<br />
              <span className="bg-gradient-to-r from-brand-300 to-accent-400 bg-clip-text text-transparent">
                transformar
              </span>{" "}
              vidas.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-brand-50/90 sm:text-xl">
              O SocialCare conecta equipes do CRAS, CREAS e organizações sociais para acompanhar
              famílias em situação de vulnerabilidade com dados, agilidade e transparência.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                Acessar o sistema <IconArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/programas"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Conhecer os programas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Indicadores */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-ink">Impacto em números</h2>
          <p className="mt-2 text-sm text-slate-500">Dados agregados e anonimizados, atualizados continuamente.</p>
        </div>
        <ResumoIndicadores />
      </section>

      {/* Recursos */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-ink">Tudo o que a sua equipe precisa</h2>
            <p className="mt-3 text-slate-500">
              Uma plataforma única para registrar, acompanhar e analisar o trabalho da assistência social.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recursos.map((r) => (
              <div key={r.titulo} className="rounded-2xl border border-slate-200 bg-mist p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <r.icone />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-ink">{r.titulo}</h3>
                <p className="mt-2 text-sm text-slate-500">{r.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programas em destaque */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-ink">Programas em destaque</h2>
            <p className="mt-2 text-slate-500">Iniciativas disponíveis para as famílias acompanhadas.</p>
          </div>
          <Link href="/programas" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
            Ver todos <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <DestaqueProgramas />
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-navy-800 to-brand-600">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center text-white sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">Faça parte da rede de cuidado</h2>
          <p className="max-w-xl text-brand-50">
            Equipes técnicas e parceiros institucionais acessam o sistema para transformar dados em ação.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Entrar no sistema <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
