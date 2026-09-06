import { eixoDoAno, mais } from "./computo";
import type { Cor } from "./tipos";

const soData = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

export interface DiaProprio {
  nome: string;
  /** Cor própria, quando ela se sobrepõe à do tempo. */
  cor?: Cor;
}

/**
 * Dias móveis com nome próprio, derivados da Páscoa ou do Natal. Alguns trazem
 * cor própria, que vence a cor do tempo: Corpus Christi é branco mesmo caindo
 * no verde do tempo depois de Pentecostes.
 */
function tabela(ano: number): [Date, DiaProprio][] {
  const e = eixoDoAno(ano);
  return [
    [e.septuagesima, { nome: "Domingo da Septuagésima" }],
    [mais(e.septuagesima, 7), { nome: "Domingo da Sexagésima" }],
    [mais(e.septuagesima, 14), { nome: "Domingo da Quinquagésima" }],
    [e.cinzas, { nome: "Quarta-feira de Cinzas" }],
    [mais(e.paixao, -7), { nome: "Domingo Laetare", cor: "rosa" }],
    [e.paixao, { nome: "Domingo da Paixão" }],
    [e.ramos, { nome: "Domingo de Ramos" }],
    [mais(e.pascoa, -3), { nome: "Quinta-feira Santa", cor: "branco" }],
    [mais(e.pascoa, -2), { nome: "Sexta-feira Santa", cor: "preto" }],
    [mais(e.pascoa, -1), { nome: "Sábado Santo", cor: "branco" }],
    [e.pascoa, { nome: "Domingo de Páscoa", cor: "branco" }],
    [mais(e.pascoa, 7), { nome: "Domingo da Oitava da Páscoa", cor: "branco" }],
    [e.ascensao, { nome: "Ascensão do Senhor", cor: "branco" }],
    [e.pentecostes, { nome: "Domingo de Pentecostes", cor: "vermelho" }],
    [e.trindade, { nome: "Domingo da Santíssima Trindade", cor: "branco" }],
    [e.corpusChristi, { nome: "Corpus Christi", cor: "branco" }],
    [mais(e.corpusChristi, 8), { nome: "Sagrado Coração de Jesus", cor: "branco" }],
    [e.advento, { nome: "Domingo I do Advento" }],
    [mais(e.advento, 14), { nome: "Domingo Gaudete", cor: "rosa" }],
  ];
}

/** O dia próprio de uma data, se houver. Consulta o ano civil e o anterior. */
export function diaProprio(data: Date): DiaProprio | undefined {
  const ano = data.getUTCFullYear();
  for (const a of [ano, ano - 1]) {
    for (const [quando, dia] of tabela(a)) {
      if (soData(quando) === soData(data)) return dia;
    }
  }
  const mes = data.getUTCMonth() + 1;
  const d = data.getUTCDate();
  if (mes === 12 && d === 25) return { nome: "Natividade do Senhor", cor: "branco" };
  if (mes === 1 && d === 1) return { nome: "Oitava do Natal", cor: "branco" };
  if (mes === 1 && d === 6) return { nome: "Epifania do Senhor", cor: "branco" };
  return undefined;
}
