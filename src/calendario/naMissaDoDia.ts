import { eixoDoAno } from "./computo";
import { desenvolvimentoDe, ritoProprioDe, type RitoProprio } from "./desenvolvimento";
import { diaLiturgico } from "./precedencia";
import type { NaMissa } from "./ordo";
import type { Marcas } from "../data/tipos";

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
  /**
   * Como a Missa se despede: "Ite, Missa est" (com Glória), "Benedicámus
   * Dómino" (sem Glória) ou "Requiéscant in pace" (Defuntos). O Ordo diz
   * qual, quando cobre o ano; fora dele, deduz-se pela mesma regra.
   */
  fecho: "ite" | "benedicamus" | "requiescant" | null;
  /** De onde vieram Glória e Credo: o Ordo publicado ou a dedução das rubricas. */
  fonte: "ordo" | "rubricas";
  /** No Tríduo não há Missa comum: a tela avisa em vez de mostrar o Ordinário. */
  ritoProprio?: RitoProprio;
}

/** O que o Ordo escreve vira um dos três; sem Ordo, a regra geral decide. */
function fechoDe(
  doOrdo: string | undefined,
  gloria: boolean,
  defuntos: boolean,
): "ite" | "benedicamus" | "requiescant" {
  if (doOrdo?.startsWith("Ite")) return "ite";
  if (doOrdo?.startsWith("Benedicamus")) return "benedicamus";
  if (doOrdo?.startsWith("Requiescant")) return "requiescant";
  return defuntos ? "requiescant" : gloria ? "ite" : "benedicamus";
}

export function naMissaDoDia(data: Date, doOrdo?: NaMissa | null): NaMissaDoDia {
  const dia = diaLiturgico(data);

  const rito = ritoProprioDe(dia);
  if (rito) {
    return {
      gloria: false, credo: false, aspersao: null, salmo42: false, fecho: null,
      fonte: "rubricas", ritoProprio: rito,
    };
  }

  const e = eixoDoAno(data.getUTCFullYear());
  const hoje = soData(data);
  const domingo = data.getUTCDay() === 0;
  const noPascal = hoje >= soData(e.pascoa) && hoje <= soData(e.pentecostes);

  const dev = desenvolvimentoDe(dia);
  const gloria = doOrdo ? doOrdo.gloria : (dev?.gloria ?? false);
  const defuntos = dia.cor === "preto";

  return {
    gloria,
    credo: doOrdo ? doOrdo.credo : (dev?.credo ?? false),
    fecho: fechoDe(doOrdo?.fecho, gloria, defuntos),
    aspersao: domingo ? (noPascal ? "vidi-aquam" : "asperges") : null,
    salmo42: dia.cor !== "preto" && dia.tempo !== "paixao",
    fonte: doOrdo ? "ordo" : "rubricas",
  };
}

/** O bloco com esta condição aparece neste dia? */
export function condicaoValeNoDia(
  quando: Marcas["quando"],
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
    case "ite":
    case "benedicamus":
    case "requiescant":
      return dia.fecho === quando;
    // o incenso depende de a Missa ser cantada, e não do dia: a tela o deixa
    // num bloco que se abre, e quem decide é quem está na capela
    case "incenso":
      return true;
  }
}
