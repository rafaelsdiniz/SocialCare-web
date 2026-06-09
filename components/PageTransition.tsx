"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

/** Reanima o conteúdo a cada mudança de rota (key = pathname força o replay). */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduzir = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={reduzir ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
