// Catálogos semeados na API (DataSeeder) — IDs fixos.
// Não há endpoint para listá-los, então replicamos o seed aqui para os selects.

export interface ItemCatalogo {
  id: number;
  nome: string;
}

export const parentescos: ItemCatalogo[] = [
  { id: 1, nome: "Responsável" },
  { id: 2, nome: "Cônjuge" },
  { id: 3, nome: "Filho(a)" },
  { id: 4, nome: "Enteado(a)" },
  { id: 5, nome: "Pai/Mãe" },
  { id: 6, nome: "Avô/Avó" },
  { id: 7, nome: "Neto(a)" },
  { id: 8, nome: "Irmão/Irmã" },
  { id: 9, nome: "Outro" },
];

export const tiposDocumento: ItemCatalogo[] = [
  { id: 1, nome: "CPF" },
  { id: 2, nome: "RG" },
  { id: 3, nome: "NIS" },
  { id: 4, nome: "Certidão de Nascimento" },
  { id: 5, nome: "Carteira de Trabalho" },
  { id: 6, nome: "Título de Eleitor" },
];

export const tiposRenda: ItemCatalogo[] = [
  { id: 1, nome: "Salário CLT" },
  { id: 2, nome: "Autônomo" },
  { id: 3, nome: "Aposentadoria" },
  { id: 4, nome: "Pensão" },
  { id: 5, nome: "Bolsa Família" },
  { id: 6, nome: "Benefício de Prestação Continuada" },
  { id: 7, nome: "Trabalho Informal" },
];

// Perfis (Perfil.Id no seed). Usados no cadastro de usuários.
export const perfis: ItemCatalogo[] = [
  { id: 1, nome: "Administrador" },
  { id: 2, nome: "Gestor" },
  { id: 3, nome: "AssistenteSocial" },
];

export const rotuloPerfil: Record<string, string> = {
  Administrador: "Administrador",
  Gestor: "Gestor",
  AssistenteSocial: "Assistente Social",
};
