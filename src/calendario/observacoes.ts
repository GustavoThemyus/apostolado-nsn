import { eixoDoAno, mais } from "./computo";

const soData = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
const igual = (a: Date, b: Date) => soData(a) === soData(b);

export function observacoesDe(data: Date): string[] {
  const notas: string[] = [];
  const ano = data.getUTCFullYear();
  const e = eixoDoAno(ano);

  if (data.getUTCMonth() === 3 && data.getUTCDate() === 25) {
    notas.push("Ladainhas maiores, com procissão");
  }
  for (const n of [3, 2, 1]) {
    if (igual(data, mais(e.ascensao, -n))) {
      notas.push("Ladainhas menores, com procissão das Rogações");
    }
  }
  return notas;
}
