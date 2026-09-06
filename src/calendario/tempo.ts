import { DIA, emUTC, eixoDoAno, mais } from "./computo";
import { diaProprio } from "./proprios";
import type { Cor, Eixo, Tempo } from "./tipos";

const soData = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
const entre = (d: Date, de: Date, ate: Date) => soData(d) >= soData(de) && soData(d) <= soData(ate);
const semanasEntre = (de: Date, ate: Date) => Math.floor((soData(ate) - soData(de)) / (7 * DIA));

/**
 * O ano litúrgico começa no Advento do ano civil anterior. Devolve o eixo que
 * governa a data, que pode ser o do ano civil ou o do ano seguinte.
 */
export function eixoQueGoverna(data: Date): Eixo {
  const ano = data.getUTCFullYear();
  const desteAno = eixoDoAno(ano);
  // depois do primeiro domingo do Advento já vale o ano litúrgico seguinte
  return soData(data) >= soData(desteAno.advento) ? eixoDoAno(ano + 1) : desteAno;
}

/** Tempo litúrgico e, quando cabe, o número da semana. */
export function tempoDe(data: Date): { tempo: Tempo; semana?: number } {
  const ano = data.getUTCFullYear();
  const e = eixoDoAno(ano);
  const adventoAnterior = eixoDoAno(ano - 1).advento;

  // Advento: do primeiro domingo até a véspera do Natal
  if (entre(data, e.advento, emUTC(ano, 12, 24))) {
    return { tempo: "advento", semana: semanasEntre(e.advento, data) + 1 };
  }
  // Natal: de 25/12 até 13/1, contando a virada do ano
  if (entre(data, emUTC(ano, 12, 25), emUTC(ano, 12, 31))) return { tempo: "natal" };
  if (entre(data, emUTC(ano, 1, 1), emUTC(ano, 1, 13))) return { tempo: "natal" };

  // Depois da Epifania: de 14/1 até a véspera da Septuagésima
  if (entre(data, emUTC(ano, 1, 14), mais(e.septuagesima, -1))) {
    const primeiroDomingo = mais(emUTC(ano, 1, 13), 7 - (emUTC(ano, 1, 13).getUTCDay() || 7));
    return { tempo: "depoisDaEpifania", semana: Math.max(1, semanasEntre(primeiroDomingo, data) + 1) };
  }
  // Septuagésima: até a terça antes das Cinzas
  if (entre(data, e.septuagesima, mais(e.cinzas, -1))) {
    return { tempo: "septuagesima", semana: semanasEntre(e.septuagesima, data) + 1 };
  }
  // Quaresma: das Cinzas à véspera do Domingo da Paixão
  if (entre(data, e.cinzas, mais(e.paixao, -1))) {
    return { tempo: "quaresma", semana: semanasEntre(mais(e.cinzas, -4), data) + 1 };
  }
  // Paixão: do Domingo da Paixão ao Sábado Santo
  if (entre(data, e.paixao, mais(e.pascoa, -1))) {
    return { tempo: "paixao", semana: semanasEntre(e.paixao, data) + 1 };
  }
  // Pascal: da Páscoa ao sábado depois de Pentecostes
  if (entre(data, e.pascoa, mais(e.pentecostes, 6))) {
    return { tempo: "pascoa", semana: semanasEntre(e.pascoa, data) + 1 };
  }
  // Depois de Pentecostes: da Trindade até a véspera do Advento
  if (entre(data, e.trindade, mais(e.advento, -1))) {
    return { tempo: "depoisDePentecostes", semana: semanasEntre(e.pentecostes, data) };
  }
  // resto do começo de janeiro pertence ao Natal do ano anterior
  if (soData(data) < soData(adventoAnterior)) return { tempo: "natal" };
  return { tempo: "depoisDePentecostes" };
}

/** Cor do paramento do dia, pelo tempo e pelas exceções próprias. */
export function corDe(data: Date, tempo: Tempo): Cor {
  // festa com cor própria vence a cor do tempo
  const proprio = diaProprio(data);
  if (proprio?.cor) return proprio.cor;

  switch (tempo) {
    case "advento":
    case "quaresma":
    case "septuagesima":
    case "paixao":
      return "roxo";
    case "natal":
    case "pascoa":
      return "branco";
    case "depoisDaEpifania":
    case "depoisDePentecostes":
      return "verde";
  }
}

