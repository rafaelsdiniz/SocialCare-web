"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Direcao = "up" | "down" | "left" | "right";

const deslocamento: Record<Direcao, { x?: number; y?: number }> = {
  up: { y: 28 },
  down: { y: -28 },
  left: { x: 28 },
  right: { x: -28 },
};

/**
 * Revela o conteúdo com fade + slide quando entra na viewport (uma única vez).
 * Respeita `prefers-reduced-motion`.
 */
export function Reveal({
  children,
  delay = 0,
  direcao = "up",
  className,
}: {
  children: ReactNode;
  delay?: number;
  direcao?: Direcao;
  className?: string;
}) {
  const reduzir = useReducedMotion();
  const offset = deslocamento[direcao];

  return (
    <motion.div
      className={className}
      initial={reduzir ? false : { opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
