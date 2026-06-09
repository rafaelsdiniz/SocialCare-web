import Image from "next/image";
import { LogoMark } from "@/components/Logo";

export function TelaCarregando({ texto = "Carregando..." }: { texto?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-6 bg-mist">
      <div className="relative flex items-center justify-center">
        <span className="absolute h-24 w-24 animate-ping rounded-full bg-brand-200/60" />
        <span className="absolute h-32 w-32 animate-pulse rounded-full bg-brand-100/50" />
        <LogoMark className="relative h-16 w-16 animate-pulse" />
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-navy-600">
        <svg className="h-4 w-4 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
        </svg>
        {texto}
      </div>
      <div className="mt-2 flex items-center gap-4 opacity-80">
        <Image
          src="/tocantins.png"
          alt="Governo do Estado do Tocantins"
          width={320}
          height={320}
          className="h-9 w-9 object-contain"
        />
        <span className="h-7 w-px bg-slate-300" aria-hidden />
        <Image
          src="/brasil.png"
          alt="Governo Federal do Brasil"
          width={1066}
          height={513}
          className="h-6 w-auto object-contain"
        />
      </div>
    </div>
  );
}
