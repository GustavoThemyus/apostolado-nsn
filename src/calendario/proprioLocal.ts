import type { FestaFixa } from "./santoral";

/**
 * Próprio do Apostolado Nossa Senhora das Neves.
 *
 * Pelas Rubricas Gerais de 1960, o Titular da igreja é festa de I classe
 * naquela igreja. Nossa Senhora das Neves, que no calendário universal é de
 * III classe em 5 de agosto, sobe aqui a I classe. E, sendo de I classe,
 * passa a transferir-se quando impedida, em vez de ser apenas omitida.
 */
export const PROPRIO_LOCAL: FestaFixa[] = [
  {
    mes: 8,
    dia: 5,
    nome: "Nossa Senhora das Neves, Titular da capela",
    classe: 1,
    cor: "branco",
  },
];

/**
 * O Santoral com o próprio local sobreposto: uma entrada local substitui a
 * universal do mesmo dia.
 */
export function comProprioLocal(santoral: FestaFixa[]): FestaFixa[] {
  const locais = new Set(PROPRIO_LOCAL.map((f) => `${f.mes}-${f.dia}`));
  return [...santoral.filter((f) => !locais.has(`${f.mes}-${f.dia}`)), ...PROPRIO_LOCAL];
}
