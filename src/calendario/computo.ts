import type { Eixo } from "./tipos";

const DIA = 86400000;

const emUTC = (a: number, m: number, d: number) => new Date(Date.UTC(a, m - 1, d));
const mais = (d: Date, n: number) => new Date(d.getTime() + n * DIA);

/**
 * Domingo de Páscoa pelo computo gregoriano (algoritmo de Meeus/Jones/Butcher).
 * Exato para qualquer ano do calendário gregoriano.
 */
export function pascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const total = h + l - 7 * m + 114;
  return emUTC(ano, Math.floor(total / 31), (total % 31) + 1);
}

/**
 * Primeiro domingo do Advento: o quarto domingo antes do Natal, ou seja, o
 * domingo mais próximo da festa de Santo André (30 de novembro).
 */
export function primeiroDomingoDoAdvento(ano: number): Date {
  const natal = emUTC(ano, 12, 25);
  // recua até o domingo anterior ao Natal e depois mais três semanas
  const domingoAntesDoNatal = mais(natal, -(natal.getUTCDay() || 7));
  return mais(domingoAntesDoNatal, -21);
}

/** Todas as datas móveis do ano, derivadas da Páscoa. */
export function eixoDoAno(ano: number): Eixo {
  const p = pascoa(ano);
  return {
    ano,
    septuagesima: mais(p, -63),
    cinzas: mais(p, -46),
    paixao: mais(p, -14),
    ramos: mais(p, -7),
    pascoa: p,
    ascensao: mais(p, 39),
    pentecostes: mais(p, 49),
    trindade: mais(p, 56),
    corpusChristi: mais(p, 60),
    advento: primeiroDomingoDoAdvento(ano),
  };
}

export { DIA, emUTC, mais };
