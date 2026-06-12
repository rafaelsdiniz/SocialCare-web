"use client";

import { useAuth } from "@/lib/auth";
import { Vazio } from "@/components/ui";
import { IconShield } from "@/components/icons";

/** Restringe o conteúdo a quem tem ao menos um dos perfis informados. */
export function RequerPerfil({ perfis, children }: { perfis: string[]; children: React.ReactNode }) {
  const { temPerfil } = useAuth();
  if (!temPerfil(...perfis)) {
    return (
      <div className="py-10">
        <Vazio
          titulo="Acesso restrito"
          descricao="Você não tem permissão para acessar esta área. Fale com um administrador se precisar de acesso."
        />
        <div className="mt-4 flex justify-center text-slate-300">
          <IconShield className="h-8 w-8" />
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
