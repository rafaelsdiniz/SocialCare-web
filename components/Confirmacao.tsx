"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Modal } from "@/components/Modal";
import { Botao } from "@/components/ui";

interface OpcoesConfirmacao {
  titulo?: string;
  mensagem: string;
  /** Texto do botão de confirmação (padrão: "Confirmar"). */
  confirmar?: string;
  /** Texto do botão de cancelamento (padrão: "Cancelar"). */
  cancelar?: string;
  /** Destaca o botão de confirmação em vermelho (ações destrutivas). */
  perigo?: boolean;
}

type FuncaoConfirmar = (opcoes: OpcoesConfirmacao | string) => Promise<boolean>;

const Ctx = createContext<FuncaoConfirmar | null>(null);

/**
 * Substitui o `window.confirm` nativo por um modal estilizado.
 * Uso: `if (!(await confirmar("Remover item?"))) return;`
 */
export function ConfirmacaoProvider({ children }: { children: React.ReactNode }) {
  const [opcoes, setOpcoes] = useState<OpcoesConfirmacao | null>(null);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const confirmar = useCallback<FuncaoConfirmar>((opts) => {
    setOpcoes(typeof opts === "string" ? { mensagem: opts } : opts);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const responder = useCallback((ok: boolean) => {
    resolverRef.current?.(ok);
    resolverRef.current = null;
    setOpcoes(null);
  }, []);

  return (
    <Ctx.Provider value={confirmar}>
      {children}
      <Modal
        aberto={!!opcoes}
        aoFechar={() => responder(false)}
        titulo={opcoes?.titulo ?? "Confirmar ação"}
        largura="max-w-md"
      >
        <p className="text-sm text-slate-600">{opcoes?.mensagem}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Botao variante="contorno" onClick={() => responder(false)}>
            {opcoes?.cancelar ?? "Cancelar"}
          </Botao>
          <Botao
            variante={opcoes?.perigo ? "perigo" : "primario"}
            onClick={() => responder(true)}
            autoFocus
          >
            {opcoes?.confirmar ?? "Confirmar"}
          </Botao>
        </div>
      </Modal>
    </Ctx.Provider>
  );
}

export function useConfirmacao(): FuncaoConfirmar {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useConfirmacao precisa estar dentro de <ConfirmacaoProvider>.");
  return ctx;
}
