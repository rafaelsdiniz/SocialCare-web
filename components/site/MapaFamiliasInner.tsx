"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { apiFetch } from "@/lib/api";
import type { PontoMapa } from "@/lib/types";
import { Spinner } from "@/components/ui";

/** Ajusta o enquadramento do mapa aos pontos carregados. */
function AjustarAosPontos({ pontos }: { pontos: PontoMapa[] }) {
  const map = useMap();
  useEffect(() => {
    if (pontos.length === 0) return;
    const bounds: LatLngBoundsExpression = pontos.map((p) => [p.lat, p.lng]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }, [pontos, map]);
  return null;
}

export default function MapaFamiliasInner() {
  const [pontos, setPontos] = useState<PontoMapa[] | null>(null);

  useEffect(() => {
    apiFetch<PontoMapa[]>("/api/publico/mapa", { auth: false })
      .then(setPontos)
      .catch(() => setPontos([]));
  }, []);

  const maxFamilias = useMemo(
    () => Math.max(1, ...(pontos ?? []).map((p) => p.familias)),
    [pontos],
  );

  if (!pontos)
    return (
      <div className="flex h-[440px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400">
        <Spinner />
      </div>
    );

  if (pontos.length === 0)
    return (
      <div className="flex h-[440px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
        Ainda não há famílias geolocalizadas para exibir.
      </div>
    );

  const totalFamilias = pontos.reduce((s, p) => s + p.familias, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <MapContainer
        center={[-10.2, -48.3]}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: 440, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AjustarAosPontos pontos={pontos} />
        {pontos.map((p, i) => {
          const raio = 6 + (p.familias / maxFamilias) * 16;
          return (
            <CircleMarker
              key={`${p.lat}-${p.lng}-${i}`}
              center={[p.lat, p.lng]}
              radius={raio}
              pathOptions={{ color: "#00822f", fillColor: "#009c3b", fillOpacity: 0.55, weight: 1.5 }}
            >
              <Tooltip direction="top" offset={[0, -4]} opacity={1}>
                <span className="text-xs">
                  <strong>{p.municipio}</strong>
                  <br />
                  {p.familias} {p.familias === 1 ? "família" : "famílias"} nesta área
                </span>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-500">
        <span>
          <strong className="text-ink">{totalFamilias.toLocaleString("pt-BR")}</strong> famílias ativas geolocalizadas
        </span>
        <span className="text-[11px] text-slate-400">Pontos agregados e anonimizados (~100 m)</span>
      </div>
    </div>
  );
}
