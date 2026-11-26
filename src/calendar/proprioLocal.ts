import type { FestaFixa } from "./santoral";

export const PROPRIO_LOCAL: FestaFixa[] = [
  {
    mes: 8,
    dia: 5,
    nome: "Nossa Senhora das Neves, Titular do Apostolado",
    classe: 1,
    cor: "branco",
  },
];

export function comProprioLocal(santoral: FestaFixa[]): FestaFixa[] {
  const locais = new Set(PROPRIO_LOCAL.map((f) => `${f.mes}-${f.dia}`));
  return [...santoral.filter((f) => !locais.has(`${f.mes}-${f.dia}`)), ...PROPRIO_LOCAL];
}
