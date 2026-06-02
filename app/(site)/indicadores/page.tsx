import type { Metadata } from "next";
import { PainelIndicadores } from "@/components/site/PainelIndicadores";

export const metadata: Metadata = { title: "Indicadores públicos" };

export default function IndicadoresPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Indicadores públicos</h1>
        <p className="mt-3 text-slate-500">
          Estatísticas agregadas e anonimizadas sobre o atendimento da rede — disponíveis para parceiros,
          BIs e para a transparência com a sociedade.
        </p>
      </header>
      <PainelIndicadores />
    </div>
  );
}
