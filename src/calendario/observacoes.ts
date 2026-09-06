import { eixoDoAno, mais } from "./computo";

const soData = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
const igual = (a: Date, b: Date) => soData(a) === soData(b);

/**
 * Observações que acompanham o dia sem disputar precedência: procissões e
 * ritos que acontecem mesmo quando outra celebração ocupa a Missa. É o caso
 * das Rogações, cuja ladainha se faz ainda que o dia seja de uma festa.
 */
export function observacoesDe(data: Date): string[] {
  const notas: string[] = [];
  const ano = data.getUTCFullYear();
  const e = eixoDoAno(ano);

  // Rogação maior: 25 de abril, junto com São Marcos
  if (data.getUTCMonth() === 3 && data.getUTCDate() === 25) {
    notas.push("Ladainhas maiores, com procissão");
  }
  // Rogações menores: segunda, terça e quarta antes da Ascensão
  for (const n of [3, 2, 1]) {
    if (igual(data, mais(e.ascensao, -n))) {
      notas.push("Ladainhas menores, com procissão das Rogações");
    }
  }
  return notas;
}
