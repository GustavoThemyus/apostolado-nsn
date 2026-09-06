import { eixoDoAno, mais } from "./computo";
import { POSTO } from "./posto";
import type { Classe, Cor } from "./tipos";

const soData = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

export interface DiaProprio {
  nome: string;
  /** Cor própria, quando ela se sobrepõe à do tempo. */
  cor?: Cor;
  classe: Classe;
  /** Posição na Tabula de 1960. Menor vence. */
  posto: number;
}

/**
 * Dias móveis com nome próprio, derivados da Páscoa ou do Natal. Alguns trazem
 * cor própria, que vence a cor do tempo: Corpus Christi é branco mesmo caindo
 * no verde do tempo depois de Pentecostes.
 */
const DIAS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado"] as const;

/** Cristo Rei: último domingo de outubro. */
function cristoRei(ano: number): Date {
  const ultimo = new Date(Date.UTC(ano, 9, 31));
  return mais(ultimo, -(ultimo.getUTCDay()));
}

function tabela(ano: number): [Date, DiaProprio][] {
  const e = eixoDoAno(ano);
  return [
    [e.septuagesima, { nome: "Domingo da Septuagésima", classe: 2, posto: POSTO.domingoSegunda }],
    [mais(e.septuagesima, 7), { nome: "Domingo da Sexagésima", classe: 2, posto: POSTO.domingoSegunda }],
    [mais(e.septuagesima, 14), { nome: "Domingo da Quinquagésima", classe: 2, posto: POSTO.domingoSegunda }],
    [e.cinzas, { nome: "Quarta-feira de Cinzas", classe: 1, posto: POSTO.feriaPrivilegiada }],
    [mais(e.paixao, -7), { nome: "Domingo Laetare", cor: "rosa", classe: 1, posto: POSTO.domingoPrimeira }],
    [e.paixao, { nome: "Domingo da Paixão", classe: 1, posto: POSTO.domingoPrimeira }],
    [e.ramos, { nome: "Domingo de Ramos", classe: 1, posto: POSTO.domingoPrimeira }],
    [mais(e.pascoa, -3), { nome: "Quinta-feira Santa", cor: "branco", classe: 1, posto: POSTO.triduo }],
    [mais(e.pascoa, -2), { nome: "Sexta-feira Santa", cor: "preto", classe: 1, posto: POSTO.triduo }],
    [mais(e.pascoa, -1), { nome: "Sábado Santo", cor: "branco", classe: 1, posto: POSTO.triduo }],
    [e.pascoa, { nome: "Domingo de Páscoa", cor: "branco", classe: 1, posto: POSTO.pascoaPentecostes }],
    [mais(e.pascoa, 7), { nome: "Domingo da Oitava da Páscoa", cor: "branco", classe: 1, posto: POSTO.domingoPrimeira }],
    [e.ascensao, { nome: "Ascensão do Senhor", cor: "branco", classe: 1, posto: POSTO.senhorPrimeira }],
    [e.pentecostes, { nome: "Domingo de Pentecostes", cor: "vermelho", classe: 1, posto: POSTO.pascoaPentecostes }],
    [e.trindade, { nome: "Domingo da Santíssima Trindade", cor: "branco", classe: 1, posto: POSTO.senhorPrimeira }],
    [e.corpusChristi, { nome: "Corpus Christi", cor: "branco", classe: 1, posto: POSTO.senhorPrimeira }],
    [mais(e.corpusChristi, 8), { nome: "Sagrado Coração de Jesus", cor: "branco", classe: 1, posto: POSTO.senhorPrimeira }],
    [e.advento, { nome: "Domingo I do Advento", classe: 1, posto: POSTO.domingoPrimeira }],
    [mais(e.advento, 14), { nome: "Domingo Gaudete", cor: "rosa", classe: 1, posto: POSTO.domingoPrimeira }],
    [cristoRei(ano), { nome: "Nosso Senhor Jesus Cristo Rei", cor: "branco", classe: 1, posto: POSTO.senhorPrimeira }],
    // Semana Santa: as ferias são de I classe e não cedem a festa nenhuma
    ...([1, 2, 3] as const).map(
      (n) =>
        [mais(e.ramos, n), {
          nome: `${DIAS[n]} Santa`,
          cor: "roxo" as const,
          classe: 1 as const,
          posto: POSTO.feriaPrivilegiada,
        }] as [Date, DiaProprio]
    ),
    // Oitava da Páscoa: I classe, fecha a semana para transferências
    ...([1, 2, 3, 4, 5, 6] as const).map(
      (n) =>
        [mais(e.pascoa, n), {
          nome: `${DIAS[n]} da Oitava da Páscoa`,
          cor: "branco" as const,
          classe: 1 as const,
          posto: POSTO.feriaPrivilegiada,
        }] as [Date, DiaProprio]
    ),
    // Oitava de Pentecostes: idem
    ...([1, 2, 3, 4, 5, 6] as const).map(
      (n) =>
        [mais(e.pentecostes, n), {
          nome: `${DIAS[n]} da Oitava de Pentecostes`,
          cor: "vermelho" as const,
          classe: 1 as const,
          posto: POSTO.feriaPrivilegiada,
        }] as [Date, DiaProprio]
    ),
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
  if (mes === 12 && d === 25) return { nome: "Natividade do Senhor", cor: "branco", classe: 1, posto: POSTO.senhorPrimeira };
  if (mes === 1 && d === 1) return { nome: "Oitava do Natal", cor: "branco", classe: 1, posto: POSTO.senhorPrimeira };
  if (mes === 1 && d === 6) return { nome: "Epifania do Senhor", cor: "branco", classe: 1, posto: POSTO.senhorPrimeira };
  return undefined;
}
