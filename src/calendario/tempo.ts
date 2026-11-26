import { DIA, emUTC, eixoDoAno, mais } from "./computo";
import { diaProprio } from "./proprios";
import type { Cor, Tempo } from "./tipos";

const soData = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
const entre = (d: Date, de: Date, ate: Date) => soData(d) >= soData(de) && soData(d) <= soData(ate);
const semanasEntre = (de: Date, ate: Date) => Math.floor((soData(ate) - soData(de)) / (7 * DIA));

export function tempoDe(data: Date): { tempo: Tempo; semana?: number } {
  const ano = data.getUTCFullYear();
  const e = eixoDoAno(ano);
  const adventoAnterior = eixoDoAno(ano - 1).advento;

  if (entre(data, e.advento, emUTC(ano, 12, 24))) {
    return { tempo: "advento", semana: semanasEntre(e.advento, data) + 1 };
  }
  if (entre(data, emUTC(ano, 12, 25), emUTC(ano, 12, 31))) return { tempo: "natal" };
  if (entre(data, emUTC(ano, 1, 1), emUTC(ano, 1, 13))) return { tempo: "natal" };

  if (entre(data, emUTC(ano, 1, 14), mais(e.septuagesima, -1))) {
    const primeiroDomingo = mais(emUTC(ano, 1, 13), 7 - (emUTC(ano, 1, 13).getUTCDay() || 7));
    return { tempo: "depoisDaEpifania", semana: Math.max(1, semanasEntre(primeiroDomingo, data) + 1) };
  }
  if (entre(data, e.septuagesima, mais(e.cinzas, -1))) {
    return { tempo: "septuagesima", semana: semanasEntre(e.septuagesima, data) + 1 };
  }
  if (entre(data, e.cinzas, mais(e.paixao, -1))) {
    return { tempo: "quaresma", semana: semanasEntre(mais(e.cinzas, -4), data) + 1 };
  }
  if (entre(data, e.paixao, mais(e.pascoa, -1))) {
    return { tempo: "paixao", semana: semanasEntre(e.paixao, data) + 1 };
  }
  if (entre(data, e.pascoa, mais(e.pentecostes, 6))) {
    return { tempo: "pascoa", semana: semanasEntre(e.pascoa, data) + 1 };
  }
  if (entre(data, e.trindade, mais(e.advento, -1))) {
    return { tempo: "depoisDePentecostes", semana: semanasEntre(e.pentecostes, data) };
  }
  if (soData(data) < soData(adventoAnterior)) return { tempo: "natal" };
  return { tempo: "depoisDePentecostes" };
}

export function corDe(data: Date, tempo: Tempo): Cor {
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
