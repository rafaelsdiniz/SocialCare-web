import type { ComponentType, SVGProps } from "react";
import {
  IconHome,
  IconUsers,
  IconCalendar,
  IconClipboard,
  IconShare,
  IconGift,
  IconLayers,
  IconBuilding,
  IconChart,
  IconUser,
  IconShield,
} from "@/components/icons";
import { ADMIN, GESTAO, OPERACAO } from "@/lib/auth";

export interface ItemNav {
  href: string;
  rotulo: string;
  icone: ComponentType<SVGProps<SVGSVGElement>>;
  perfis?: string[]; // se ausente, visível a todos os autenticados
  grupo: string;
}

export const navItens: ItemNav[] = [
  { href: "/painel", rotulo: "Painel", icone: IconHome, grupo: "Geral" },

  { href: "/painel/familias", rotulo: "Famílias", icone: IconUsers, perfis: OPERACAO, grupo: "Operação" },
  { href: "/painel/visitas", rotulo: "Visitas", icone: IconCalendar, perfis: OPERACAO, grupo: "Operação" },
  { href: "/painel/atendimentos", rotulo: "Atendimentos", icone: IconClipboard, perfis: OPERACAO, grupo: "Operação" },
  { href: "/painel/encaminhamentos", rotulo: "Encaminhamentos", icone: IconShare, perfis: OPERACAO, grupo: "Operação" },

  { href: "/painel/beneficios", rotulo: "Benefícios", icone: IconGift, perfis: GESTAO, grupo: "Gestão" },
  { href: "/painel/programas", rotulo: "Programas", icone: IconLayers, perfis: GESTAO, grupo: "Gestão" },
  { href: "/painel/instituicoes", rotulo: "Instituições", icone: IconBuilding, perfis: GESTAO, grupo: "Gestão" },
  { href: "/painel/relatorios", rotulo: "Relatórios", icone: IconChart, perfis: GESTAO, grupo: "Gestão" },

  { href: "/painel/usuarios", rotulo: "Usuários", icone: IconUser, perfis: ADMIN, grupo: "Administração" },
  { href: "/painel/auditoria", rotulo: "Auditoria", icone: IconShield, perfis: ADMIN, grupo: "Administração" },
];

export const gruposNav = ["Geral", "Operação", "Gestão", "Administração"];
