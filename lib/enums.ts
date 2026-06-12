// Enums da API (valor numérico → rótulo PT-BR) e listas para selects.
// A API serializa os enums como string no retorno e aceita número/string no request.

export interface Opcao {
  valor: number;
  rotulo: string;
}

function opcoes(map: Record<number, string>): Opcao[] {
  return Object.entries(map).map(([valor, rotulo]) => ({ valor: Number(valor), rotulo }));
}

export const Sexo: Record<number, string> = {
  1: "Masculino",
  2: "Feminino",
  3: "Outro",
  4: "Não informado",
};
export const sexoOpcoes = opcoes(Sexo);

export const EstadoCivil: Record<number, string> = {
  1: "Solteiro(a)",
  2: "Casado(a)",
  3: "União estável",
  4: "Separado(a)",
  5: "Divorciado(a)",
  6: "Viúvo(a)",
};
export const estadoCivilOpcoes = opcoes(EstadoCivil);

export const StatusFamilia: Record<number, string> = {
  1: "Ativa",
  2: "Em acompanhamento",
  3: "Inativa",
  4: "Desligada",
};
export const statusFamiliaOpcoes = opcoes(StatusFamilia);

export const StatusVisita: Record<number, string> = {
  1: "Agendada",
  2: "Realizada",
  3: "Não realizada",
  4: "Cancelada",
};
export const statusVisitaOpcoes = opcoes(StatusVisita);

export const TipoVisita: Record<number, string> = {
  1: "Domiciliar",
  2: "Institucional",
  3: "Emergencial",
  4: "Acompanhamento",
};
export const tipoVisitaOpcoes = opcoes(TipoVisita);

export const StatusAtendimento: Record<number, string> = {
  1: "Aberto",
  2: "Em andamento",
  3: "Concluído",
  4: "Cancelado",
};
export const statusAtendimentoOpcoes = opcoes(StatusAtendimento);

export const StatusBeneficio: Record<number, string> = {
  1: "Em análise",
  2: "Aprovado",
  3: "Ativo",
  4: "Suspenso",
  5: "Encerrado",
  6: "Indeferido",
};
export const statusBeneficioOpcoes = opcoes(StatusBeneficio);

export const StatusEncaminhamento: Record<number, string> = {
  1: "Enviado",
  2: "Recebido",
  3: "Em atendimento",
  4: "Concluído",
  5: "Recusado",
};
export const statusEncaminhamentoOpcoes = opcoes(StatusEncaminhamento);

export const TipoAuditoria: Record<number, string> = {
  1: "Criação",
  2: "Alteração",
  3: "Exclusão",
  4: "Login",
  5: "Logout",
  6: "Acesso negado",
};
export const tipoAuditoriaOpcoes = opcoes(TipoAuditoria);

// Rótulos amigáveis a partir do nome PascalCase do enum retornado pela API.
export const rotulosStatus: Record<string, string> = {
  Ativa: "Ativa",
  EmAcompanhamento: "Em acompanhamento",
  Inativa: "Inativa",
  Desligada: "Desligada",
  Agendada: "Agendada",
  Realizada: "Realizada",
  NaoRealizada: "Não realizada",
  Cancelada: "Cancelada",
  Aberto: "Aberto",
  EmAndamento: "Em andamento",
  Concluido: "Concluído",
  Cancelado: "Cancelado",
  EmAnalise: "Em análise",
  Aprovado: "Aprovado",
  Ativo: "Ativo",
  Suspenso: "Suspenso",
  Encerrado: "Encerrado",
  Indeferido: "Indeferido",
  Enviado: "Enviado",
  Recebido: "Recebido",
  EmAtendimento: "Em atendimento",
  Recusado: "Recusado",
  // Tipos de visita (também via ToString)
  Domiciliar: "Domiciliar",
  Institucional: "Institucional",
  Emergencial: "Emergencial",
  Acompanhamento: "Acompanhamento",
};

// Cores semânticas (classes Tailwind) por nome de status retornado pela API.
export const corStatus: Record<string, string> = {
  Ativa: "bg-accent-100 text-accent-700",
  EmAcompanhamento: "bg-brand-100 text-brand-700",
  Inativa: "bg-slate-100 text-slate-600",
  Desligada: "bg-slate-200 text-slate-700",
  Agendada: "bg-brand-100 text-brand-700",
  Realizada: "bg-accent-100 text-accent-700",
  NaoRealizada: "bg-amber-100 text-amber-700",
  Cancelada: "bg-rose-100 text-rose-700",
  Aberto: "bg-brand-100 text-brand-700",
  EmAndamento: "bg-amber-100 text-amber-700",
  Concluido: "bg-accent-100 text-accent-700",
  Cancelado: "bg-rose-100 text-rose-700",
  EmAnalise: "bg-amber-100 text-amber-700",
  Aprovado: "bg-brand-100 text-brand-700",
  Ativo: "bg-accent-100 text-accent-700",
  Suspenso: "bg-amber-100 text-amber-700",
  Encerrado: "bg-slate-100 text-slate-600",
  Indeferido: "bg-rose-100 text-rose-700",
  Enviado: "bg-brand-100 text-brand-700",
  Recebido: "bg-brand-100 text-brand-700",
  EmAtendimento: "bg-amber-100 text-amber-700",
  Recusado: "bg-rose-100 text-rose-700",
};

export function classeStatus(status?: string | null): string {
  if (!status) return "bg-slate-100 text-slate-600";
  return corStatus[status] ?? "bg-slate-100 text-slate-600";
}

export function rotuloStatus(status?: string | null): string {
  if (!status) return "—";
  return rotulosStatus[status] ?? status;
}

// Reversos nome→valor para preencher selects de edição.
export const statusFamiliaValor: Record<string, number> = {
  Ativa: 1,
  EmAcompanhamento: 2,
  Inativa: 3,
  Desligada: 4,
};
export const statusAtendimentoValor: Record<string, number> = {
  Aberto: 1,
  EmAndamento: 2,
  Concluido: 3,
  Cancelado: 4,
};
export const tipoVisitaValor: Record<string, number> = {
  Domiciliar: 1,
  Institucional: 2,
  Emergencial: 3,
  Acompanhamento: 4,
};
