import type { Metadata } from "next";
import { ContatoForm } from "@/components/site/ContatoForm";
import { Reveal } from "@/components/site/Reveal";

export const metadata: Metadata = { title: "Contato" };

export default function ContatoPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="grid gap-12 md:grid-cols-2">
        <Reveal direcao="right">
          <h1 className="text-3xl font-bold tracking-tight text-ink">Fale com a gente</h1>
          <p className="mt-3 text-slate-600">
            É um órgão público ou organização social e quer conhecer o SocialCare? Envie uma mensagem
            e nossa equipe entrará em contato.
          </p>
          <dl className="mt-8 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-ink">E-mail</dt>
              <dd className="text-slate-500">contato@socialcare.local</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Atendimento</dt>
              <dd className="text-slate-500">Segunda a sexta, das 8h às 18h</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Acesso ao sistema</dt>
              <dd className="text-slate-500">Equipes credenciadas acessam pela área restrita.</dd>
            </div>
          </dl>
        </Reveal>
        <Reveal direcao="left" delay={0.1}>
          <ContatoForm />
        </Reveal>
      </div>
    </div>
  );
}
