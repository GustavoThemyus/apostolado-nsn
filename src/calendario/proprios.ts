import { eixoDoAno, mais } from "./computo";
import type { Classe, Cor } from "./tipos";

const soData = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

export interface DiaProprio {
  nome: string;
  /** Cor própria, quando ela se sobrepõe à do tempo. */
  cor?: Cor;
  classe: Classe;
}

/**
 * Dias móveis com nome próprio, derivados da Páscoa ou do Natal. Alguns trazem
 * cor própria, que vence a cor do tempo: Corpus Christi é branco mesmo caindo
 * no verde do tempo depois de Pentecostes.
 */
/** Cristo Rei: último domingo de outubro. */
function cristoRei(ano: number): Date {
  const ultimo = new Date(Date.UTC(ano, 9, 31));
  return mais(ultimo, -(ultimo.getUTCDay()));
}

function tabela(ano: number): [Date, DiaProprio][] {
  const e = eixoDoAno(ano);
  return [
    [e.septuagesima, { nome: "Domingo da Septuagésima", classe: 1 }],
    [mais(e.septuagesima, 7), { nome: "Domingo da Sexagésima", classe: 1 }],
    [mais(e.septuagesima, 14), { nome: "Domingo da Quinquagésima", classe: 1 }],
    [e.cinzas, { nome: "Quarta-feira de Cinzas", classe: 1 }],
    [mais(e.paixao, -7), { nome: "Domingo Laetare", cor: "rosa", classe: 1 }],
    [e.paixao, { nome: "Domingo da Paixão", classe: 1 }],
    [e.ramos, { nome: "Domingo de Ramos", classe: 1 }],
    [mais(e.pascoa, -3), { nome: "Quinta-feira Santa", cor: "branco", classe: 1 }],
    [mais(e.pascoa, -2), { nome: "Sexta-feira Santa", cor: "preto", classe: 1 }],
    [mais(e.pascoa, -1), { nome: "Sábado Santo", cor: "branco", classe: 1 }],
    [e.pascoa, { nome: "Domingo de Páscoa", cor: "branco", classe: 1 }],
    [mais(e.pascoa, 7), { nome: "Domingo da Oitava da Páscoa", cor: "branco", classe: 1 }],
    [e.ascensao, { nome: "Ascensão do Senhor", cor: "branco", classe: 1 }],
    [e.pentecostes, { nome: "Domingo de Pentecostes", cor: "vermelho", classe: 1 }],
    [e.trindade, { nome: "Domingo da Santíssima Trindade", cor: "branco", classe: 1 }],
    [e.corpusChristi, { nome: "Corpus Christi", cor: "branco", classe: 1 }],
    [mais(e.corpusChristi, 8), { nome: "Sagrado Coração de Jesus", cor: "branco", classe: 1 }],
    [e.advento, { nome: "Domingo I do Advento", classe: 1 }],
    [mais(e.advento, 14), { nome: "Domingo Gaudete", cor: "rosa", classe: 1 }],
    [cristoRei(ano), { nome: "Nosso Senhor Jesus Cristo Rei", cor: "branco", classe: 1 }],
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
  if (mes === 12 && d === 25) return { nome: "Natividade do Senhor", cor: "branco", classe: 1 };
  if (mes === 1 && d === 1) return { nome: "Oitava do Natal", cor: "branco", classe: 1 };
  if (mes === 1 && d === 6) return { nome: "Epifania do Senhor", cor: "branco", classe: 1 };
  return undefined;
}
