/** Troca o item de lugar com o vizinho. Fora da lista, devolve a lista intacta. */
export function mover<T>(lista: T[], i: number, passo: number): T[] {
  const j = i + passo;
  if (j < 0 || j >= lista.length) return lista;
  const copia = [...lista];
  [copia[i], copia[j]] = [copia[j], copia[i]];
  return copia;
}
