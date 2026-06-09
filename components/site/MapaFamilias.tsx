"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui";

// Leaflet acessa `window` no import — carrega só no cliente.
const MapaInner = dynamic(() => import("@/components/site/MapaFamiliasInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[440px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400">
      <Spinner />
    </div>
  ),
});

export function MapaFamilias() {
  return <MapaInner />;
}
