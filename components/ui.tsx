import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { classeStatus, rotuloStatus } from "@/lib/enums";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ---- Botão ----
type Variante = "primario" | "secundario" | "contorno" | "perigo" | "fantasma";
const variantes: Record<Variante, string> = {
  primario: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
  secundario: "bg-accent-500 text-white hover:bg-accent-600 shadow-sm",
  contorno: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  perigo: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
  fantasma: "text-slate-600 hover:bg-slate-100",
};

export function Botao({
  variante = "primario",
  className,
  carregando,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; carregando?: boolean }) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60",
        variantes[variante],
        className,
      )}
      disabled={carregando || props.disabled}
      {...props}
    >
      {carregando && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function BotaoLink({
  href,
  variante = "primario",
  className,
  children,
}: {
  href: string;
  variante?: Variante;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        variantes[variante],
        className,
      )}
    >
      {children}
    </Link>
  );
}

// ---- Campo / rótulo ----
export function Campo({
  label,
  obrigatorio,
  erro,
  children,
  className,
}: {
  label?: string;
  obrigatorio?: boolean;
  erro?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {obrigatorio && <span className="text-rose-500"> *</span>}
        </label>
      )}
      {children}
      {erro && <span className="text-xs text-rose-600">{erro}</span>}
    </div>
  );
}

const campoBase =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-400";

export function Entrada({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(campoBase, className)} {...props} />;
}

export function AreaTexto({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(campoBase, "min-h-[88px] resize-y", className)} {...props} />;
}

export function Selecao({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx(campoBase, "appearance-none bg-white", className)} {...props}>
      {children}
    </select>
  );
}

// ---- Cartões ----
export function Cartao({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cx("rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cx("animate-spin text-current", className ?? "h-5 w-5")} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
    </svg>
  );
}

export function StatusBadge({ status }: { status?: string | null }) {
  return (
    <span className={cx("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", classeStatus(status))}>
      {rotuloStatus(status)}
    </span>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cx("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", className ?? "bg-slate-100 text-slate-600")}>
      {children}
    </span>
  );
}

// ---- Cabeçalho de página ----
export function CabecalhoPagina({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-slate-500">{descricao}</p>}
      </div>
      {acao}
    </div>
  );
}

// ---- Estados ----
export function Vazio({ titulo, descricao, acao }: { titulo: string; descricao?: string; acao?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <p className="text-base font-medium text-slate-700">{titulo}</p>
      {descricao && <p className="max-w-sm text-sm text-slate-500">{descricao}</p>}
      {acao && <div className="mt-3">{acao}</div>}
    </div>
  );
}

export function CarregandoBloco({ texto = "Carregando..." }: { texto?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
      <Spinner /> <span className="text-sm">{texto}</span>
    </div>
  );
}

export function AlertaErro({ mensagem }: { mensagem?: string | null }) {
  if (!mensagem) return null;
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {mensagem}
    </div>
  );
}

// ---- Tabela ----
export function Tabela({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">{children}</table>
    </div>
  );
}
export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th className={cx("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500", className)}>
      {children}
    </th>
  );
}
export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cx("px-4 py-3 text-slate-700", className)}>{children}</td>;
}

// ---- Paginação ----
export function Paginacao({
  pagina,
  totalPaginas,
  totalItens,
  aoMudar,
}: {
  pagina: number;
  totalPaginas: number;
  totalItens: number;
  aoMudar: (p: number) => void;
}) {
  if (totalPaginas <= 1) {
    return <p className="px-1 py-2 text-xs text-slate-400">{totalItens} registro(s)</p>;
  }
  return (
    <div className="flex items-center justify-between px-1 py-2">
      <p className="text-xs text-slate-500">
        Página {pagina} de {totalPaginas} · {totalItens} registro(s)
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => aoMudar(pagina - 1)}
          disabled={pagina <= 1}
          aria-label="Página anterior"
          className="rounded-lg border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          <IconChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => aoMudar(pagina + 1)}
          disabled={pagina >= totalPaginas}
          aria-label="Próxima página"
          className="rounded-lg border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          <IconChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
