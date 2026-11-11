import { eixoDoAno } from "./computo";
import { desenvolvimentoDe, ritoProprioDe, type RitoProprio } from "./desenvolvimento";
import { diaLiturgico } from "./precedencia";
import type { NaMissa } from "./ordo";

const soData = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

/**
 * O que o Ordinário precisa saber do dia para mostrar só o que a Missa tem.
 *
 * Não decide nada de novo: junta o que o calendário já sabe. Glória e Credo
 * vêm do Ordo quando ele cobre o ano, que é a fonte, e das rubricas gerais
 * (`desenvolvimentoDe`) quando não cobre. A aspersão e o salmo 42 são regras
 * simples do dia, ditas pelo Perez, e moram aqui porque o motor ainda não
 * tinha onde guardá-las.
 */
export interface NaMissaDoDia {
  gloria: boolean;
  credo: boolean;
  /**
   * A aspersão do domingo: "asperges" fora do Tempo Pascal, "vidi-aquam" do
   * Domingo de Páscoa ao de Pentecostes. Nulo nos outros dias.
   */
  aspersao: "asperges" | "vidi-aquam" | null;
  /** O salmo 42 se omite nas Missas de Defuntos e no Tempo da Paixão. */
  salmo42: boolean;
  /** De onde vieram Glória e Credo: o Ordo publicado ou a dedução das rubricas. */
  fonte: "ordo" | "rubricas";
  /** No Tríduo não há Missa comum: a tela avisa em vez de mostrar o Ordinário. */
  ritoProprio?: RitoProprio;
}

export function naMissaDoDia(data: Date, doOrdo?: NaMissa | null): NaMissaDoDia {
  const dia = diaLiturgico(data);

  const rito = ritoProprioDe(dia);
  if (rito) {
    return { gloria: false, credo: false, aspersao: null, salmo42: false, fonte: "rubricas", ritoProprio: rito };
  }

  const e = eixoDoAno(data.getUTCFullYear());
  const hoje = soData(data);
  const domingo = data.getUTCDay() === 0;
  const noPascal = hoje >= soData(e.pascoa) && hoje <= soData(e.pentecostes);

  const dev = desenvolvimentoDe(dia);

  return {
    gloria: doOrdo ? doOrdo.gloria : (dev?.gloria ?? false),
    credo: doOrdo ? doOrdo.credo : (dev?.credo ?? false),
    aspersao: domingo ? (noPascal ? "vidi-aquam" : "asperges") : null,
    salmo42: dia.cor !== "preto" && dia.tempo !== "paixao",
    fonte: doOrdo ? "ordo" : "rubricas",
  };
}

/** O bloco com esta condição aparece neste dia? */
export function condicaoValeNoDia(
  quando: "asperges" | "vidi-aquam" | "salmo-42" | "gloria" | "credo" | "incenso" | undefined,
  dia: NaMissaDoDia,
): boolean {
  switch (quando) {
    case undefined:
      return true;
    case "asperges":
      return dia.aspersao === "asperges";
    case "vidi-aquam":
      return dia.aspersao === "vidi-aquam";
    case "salmo-42":
      return dia.salmo42;
    case "gloria":
      return dia.gloria;
    case "credo":
      return dia.credo;
    // o incenso depende de a Missa ser cantada, e não do dia: a tela o deixa
    // num bloco que se abre, e quem decide é quem está na capela
    case "incenso":
      return true;
  }
}
