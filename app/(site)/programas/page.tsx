import type { Metadata } from "next";
import { VitrineProgramas } from "@/components/site/VitrineProgramas";
import { Reveal } from "@/components/site/Reveal";

export const metadata: Metadata = { title: "Programas sociais" };

export default function ProgramasPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <header className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink">Programas sociais</h1>
          <p className="mt-3 text-slate-500">
            Conheça as iniciativas disponíveis para as famílias acompanhadas pela rede de assistência social.
            Clique em um programa para ver mais informações.
          </p>
        </header>
      </Reveal>
      <VitrineProgramas />
    </div>
  );
}
