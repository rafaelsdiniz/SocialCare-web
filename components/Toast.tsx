"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { IconCheck, IconAlert, IconX } from "@/components/icons";
import { cx } from "@/components/ui";

type Tipo = "sucesso" | "erro" | "info";
interface ToastItem {
  id: number;
  tipo: Tipo;
  mensagem: string;
}

interface ToastCtx {
  sucesso: (m: string) => void;
  erro: (m: string) => void;
  info: (m: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<ToastItem[]>([]);

  const adicionar = useCallback((tipo: Tipo, mensagem: string) => {
    const id = Date.now() + Math.random();
    setItens((xs) => [...xs, { id, tipo, mensagem }]);
    setTimeout(() => setItens((xs) => xs.filter((x) => x.id !== id)), 4000);
  }, []);

  const valor: ToastCtx = {
    sucesso: (m) => adicionar("sucesso", m),
    erro: (m) => adicionar("erro", m),
    info: (m) => adicionar("info", m),
  };

  return (
    <Ctx.Provider value={valor}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {itens.map((t) => (
          <div
            key={t.id}
            className={cx(
              "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg animate-fade-up",
              t.tipo === "sucesso" && "border-accent-200 bg-white text-accent-700",
              t.tipo === "erro" && "border-rose-200 bg-white text-rose-700",
              t.tipo === "info" && "border-brand-200 bg-white text-brand-700",
            )}
          >
            {t.tipo === "sucesso" ? <IconCheck className="mt-0.5 h-4 w-4 shrink-0" /> : t.tipo === "erro" ? <IconAlert className="mt-0.5 h-4 w-4 shrink-0" /> : <IconCheck className="mt-0.5 h-4 w-4 shrink-0" />}
            <span className="flex-1 text-slate-700">{t.mensagem}</span>
            <button onClick={() => setItens((xs) => xs.filter((x) => x.id !== t.id))} className="text-slate-400 hover:text-slate-600">
              <IconX className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider>.");
  return ctx;
}
