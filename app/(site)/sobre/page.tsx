import type { Metadata } from "next";
import { IconUsers, IconShield, IconChart, IconMap } from "@/components/icons";
import { Reveal } from "@/components/site/Reveal";

export const metadata: Metadata = { title: "Sobre" };

const atores = [
  { titulo: "Administrador", texto: "Gerencia usuários, perfis e parâmetros do sistema, e audita as operações." },
  { titulo: "Gestor", texto: "Aprova benefícios, gerencia programas e instituições parceiras e acompanha relatórios." },
  { titulo: "Assistente Social", texto: "Cadastra famílias e membros, agenda visitas, abre atendimentos e registra encaminhamentos." },
];

const integracoes = [
  { icone: IconMap, titulo: "ViaCEP", texto: "Autopreenchimento de endereço a partir do CEP." },
  { icone: IconChart, titulo: "IBGE Localidades", texto: "Estados e municípios oficiais para padronização dos dados." },
  { icone: IconShield, titulo: "BrasilAPI", texto: "Consulta de CNPJ para o cadastro de instituições parceiras." },
];

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <Reveal>
        <header className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink">Sobre o SocialCare</h1>
          <p className="mt-4 text-slate-600">
            O SocialCare é uma plataforma web e API para a gestão da assistência social em órgãos públicos
            (como CRAS e CREAS) e organizações da sociedade civil. Permite o cadastro de famílias em situação
            de vulnerabilidade, o controle de benefícios concedidos, o agendamento e registro de visitas
            domiciliares, a gestão de programas sociais, os atendimentos e os encaminhamentos para
            instituições parceiras, além da emissão de relatórios gerenciais.
          </p>
        </header>
      </Reveal>

      <section className="mt-14">
        <Reveal>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-ink">
            <IconUsers className="text-brand-600" /> Quem usa
          </h2>
        </Reveal>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {atores.map((a, i) => (
            <Reveal key={a.titulo} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <h3 className="text-lg font-semibold text-brand-700">{a.titulo}</h3>
                <p className="mt-2 text-sm text-slate-500">{a.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <Reveal>
          <h2 className="text-xl font-semibold text-ink">Integrações</h2>
          <p className="mt-2 text-sm text-slate-500">Consumimos serviços públicos para qualificar os dados cadastrais.</p>
        </Reveal>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {integracoes.map((i, idx) => (
            <Reveal key={i.titulo} delay={idx * 0.1}>
              <div className="h-full rounded-2xl border border-slate-200 bg-mist p-6 transition-shadow hover:shadow-md">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500 text-white">
                  <i.icone />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-ink">{i.titulo}</h3>
                <p className="mt-2 text-sm text-slate-500">{i.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <section className="mt-14 rounded-2xl bg-brand-600 p-8 text-white">
          <h2 className="text-2xl font-bold">Cuidar é transformar.</h2>
          <p className="mt-2 max-w-2xl text-brand-50">
            Tecnologia a serviço de quem cuida — para que cada família receba o acompanhamento que merece.
          </p>
        </section>
      </Reveal>
    </div>
  );
}
