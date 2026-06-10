// Validações de formato no cliente — evitam enviar dados previsivelmente inválidos
// à API (CNPJ/CPF com dígito verificador errado, CEP/e-mail malformados).
// Regras de negócio (duplicidade, vínculos, etc.) continuam sendo validadas pelo backend.

import { soDigitos } from "./format";

/** Valida os dígitos verificadores de um CPF (aceita com ou sem máscara). */
export function cpfValido(valor: string): boolean {
  const d = soDigitos(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

  const dv = (ate: number, pesoInicial: number) => {
    let soma = 0;
    for (let i = 0; i < ate; i++) soma += Number(d[i]) * (pesoInicial - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return dv(9, 10) === Number(d[9]) && dv(10, 11) === Number(d[10]);
}

/** Valida os dígitos verificadores de um CNPJ (aceita com ou sem máscara). */
export function cnpjValido(valor: string): boolean {
  const d = soDigitos(valor);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;

  const dv = (ate: number) => {
    const pesos = ate === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < ate; i++) soma += Number(d[i]) * pesos[i];
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  return dv(12) === Number(d[12]) && dv(13) === Number(d[13]);
}

/** CEP precisa ter 8 dígitos. */
export function cepValido(valor: string): boolean {
  return soDigitos(valor).length === 8;
}

/** Validação básica de formato de e-mail. */
export function emailValido(valor: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
}
