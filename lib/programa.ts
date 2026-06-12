// Imagem de fallback (gradiente nas cores do Brasil) para programas sem foto.

const PARES = [
  ["#1fb55f", "#0d431f"],
  ["#356ec9", "#061a40"],
  ["#fbc014", "#a87a00"],
  ["#009c3b", "#006626"],
];

/** Data URL de um gradiente determinístico por id do programa. */
export function placeholderPrograma(id: number, w = 600, h = 400): string {
  const [a, b] = PARES[id % PARES.length];
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/>` +
    `</linearGradient></defs><rect width='${w}' height='${h}' fill='url(#g)'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
