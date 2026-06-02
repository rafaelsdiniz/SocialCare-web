"use client";

import { usePathname } from "next/navigation";

/** Reanima o conteúdo a cada mudança de rota (key = pathname força o replay). */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-page">
      {children}
    </div>
  );
}
