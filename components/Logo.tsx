import Image from "next/image";
import { cx } from "@/components/ui";

/** Logo horizontal completa (ícone + SocialCare + subtítulo). */
export function LogoFull({ className }: { className?: string }) {
  return (
    <Image
      src="/socialcare-logo.png"
      alt="SocialCare — Gestão de Assistência Social"
      width={600}
      height={178}
      priority
      className={cx("w-auto", className ?? "h-9")}
    />
  );
}

/** Apenas o ícone (mão segurando a pessoa). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/socialcare-icon.png"
      alt="SocialCare"
      width={512}
      height={512}
      priority
      className={cx(className ?? "h-9 w-9")}
    />
  );
}
